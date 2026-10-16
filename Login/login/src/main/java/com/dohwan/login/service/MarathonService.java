package com.dohwan.login.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.dohwan.login.repository.MarathonRepository;
import com.dohwan.login.entity.Marathon;

import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

@Service
public class MarathonService {

    private static final Logger log = LoggerFactory.getLogger(MarathonService.class);
    private final RestTemplate restTemplate;
    private final MarathonRepository marathonRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // 병렬 처리를 위한 스레드 풀 생성 (동시 10개 작업)
    private final ExecutorService executor = Executors.newFixedThreadPool(10);

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.key}")
    private String supabaseKey;

    public MarathonService(RestTemplate restTemplate, MarathonRepository marathonRepository) {
        this.restTemplate = restTemplate;
        this.marathonRepository = marathonRepository;
    }

    // --- 1. 데이터 조회 ---
    public List<Marathon> findAllMarathons() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("apikey", supabaseKey);
        headers.set("Authorization", "Bearer " + supabaseKey);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            // 다가오는 날짜 순으로 정렬하여 조회
            String url = supabaseUrl + "/rest/v1/marathons?select=*&order=race_date.asc";

            ResponseEntity<List<Marathon>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                new org.springframework.core.ParameterizedTypeReference<List<Marathon>>() {}
            );

            if (response == null || response.getBody() == null) {
                return Collections.emptyList();
            }

            return new ArrayList<>(response.getBody());
        } catch (Exception e) {
            log.error(">>> [조회 실패] : {}", e.getMessage());
            return new ArrayList<>(marathonRepository.findAllByOrderByRaceDateDesc());
        }
    }

    public Optional<Marathon> findMarathonById(Long id) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("apikey", supabaseKey);
        headers.set("Authorization", "Bearer " + supabaseKey);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            String url = supabaseUrl + "/rest/v1/marathons?id=eq." + id + "&select=*";

            ResponseEntity<List<Marathon>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                new org.springframework.core.ParameterizedTypeReference<List<Marathon>>() {}
            );
            List<Marathon> body = (response != null) ? response.getBody() : null;
            if (body == null || body.isEmpty()) {
                return marathonRepository.findById(id);
            }

            Marathon single = body.get(0);
            return Optional.ofNullable(single);
        } catch (Exception e) {
            log.error(">>> [단건 조회 실패] : {}", e.getMessage());
            return marathonRepository.findById(id);
        }
    }

    // --- 2. 데이터 수집 (사이트맵 + 상세페이지 정밀 JSON 파싱) ---
    @Scheduled(cron = "0 0 3 * * *") // 매일 새벽 3시에 실행
    public void crawlMarathonData() {
        log.info(">>> [정밀 수집 시작] 마라톤GO 데이터 크롤링...");
        Set<String> allDetailUrls = new LinkedHashSet<>();

        // 1. 현재 메인/일정 페이지의 최신 등록 대회 수집
        try {
            String baseUrl = "https://marathongo.co.kr/raceSchedule/domestic";
            Document listDoc = Jsoup.connect(baseUrl)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                    .timeout(30000).get();

            Elements links = listDoc.select("a[href*=/raceDetail/]");
            for (Element el : links) {
                String href = el.attr("abs:href");
                if (href != null && !href.isEmpty()) {
                    allDetailUrls.add(href);
                }
            }
            log.info(">>> 메인 일정 페이지 수집 URL: {}개", allDetailUrls.size());
        } catch (Exception e) {
            log.warn(">>> [메인 일정 수집 실패] : {}", e.getMessage());
        }

        // 2. 사이트맵(sitemap.xml)에서 전체 국내 마라톤 대회 URL 추가 수집 (누락 방지)
        try {
            String sitemapUrl = "https://marathongo.co.kr/sitemap.xml";
            Document sitemapDoc = Jsoup.connect(sitemapUrl)
                    .parser(org.jsoup.parser.Parser.xmlParser())
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                    .timeout(30000).get();

            Elements locs = sitemapDoc.select("loc");
            int sitemapCount = 0;
            for (Element loc : locs) {
                String u = loc.text().trim();
                if (u.contains("/raceDetail/domestic/")) {
                    // 과거 오래된 연도(2021~2024년 이전)는 제외하여 현재/다가오는 대회 위주로 집중 수집
                    boolean isOld = u.contains("2021") || u.contains("2022") || u.contains("2023") || u.contains("2024");
                    if (!isOld) {
                        allDetailUrls.add(u);
                        sitemapCount++;
                    }
                }
            }
            log.info(">>> 사이트맵 추가 URL: {}개 (총 대상 URL: {}개)", sitemapCount, allDetailUrls.size());
        } catch (Exception e) {
            log.warn(">>> [사이트맵 수집 실패] : {}", e.getMessage());
        }

        if (allDetailUrls.isEmpty()) {
            log.warn(">>> 수집 대상 URL이 없습니다.");
            return;
        }

        try {
            List<CompletableFuture<Void>> futures = allDetailUrls.stream()
                    .map(url -> CompletableFuture.runAsync(() -> processDetailPage(url), executor))
                    .collect(Collectors.toList());

            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
            log.info(">>> [정밀 수집 완료] 총 {}개 대회 처리됨", allDetailUrls.size());
        } catch (Exception e) {
            log.error(">>> [크롤링 대기 중 에러] : {}", e.getMessage());
        }
    }

    // 상세 페이지 개별 처리 로직
    private void processDetailPage(String detailUrl) {
        try {
            Document detailDoc = Jsoup.connect(detailUrl)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                    .timeout(15000).get();

            // 1순위: 마라톤GO의 Next.js 원본 정밀 데이터(__NEXT_DATA__) 추출
            Element nextDataEl = detailDoc.selectFirst("script#__NEXT_DATA__");
            if (nextDataEl != null && !nextDataEl.data().isEmpty()) {
                try {
                    JsonNode rootNode = objectMapper.readTree(nextDataEl.data());
                    JsonNode raceDetail = rootNode.path("props").path("pageProps").path("raceDetail");
                    if (raceDetail != null && !raceDetail.isMissingNode() && !raceDetail.isNull()) {
                        processFromRaceDetailJson(raceDetail, detailDoc, detailUrl);
                        return;
                    }
                } catch (Exception ex) {
                    log.warn(">>> [__NEXT_DATA__ JSON 파싱 실패, HTML 파서 폴백] {} : {}", detailUrl, ex.getMessage());
                }
            }

            // 2순위 폴백: JSON이 없을 경우 HTML 직접 파싱
            processFromHtml(detailDoc, detailUrl);

        } catch (Exception e) {
            log.warn(">>> [상세 분석 실패] {} : {}", detailUrl, e.getMessage());
        }
    }

    // __NEXT_DATA__ 내부의 정확한 raceDetail JSON 객체 파싱
    private void processFromRaceDetailJson(JsonNode raceDetail, Document detailDoc, String detailUrl) {
        String rawTitle = raceDetail.path("raceName").asText("").trim();
        if (rawTitle.isEmpty()) {
            rawTitle = detailDoc.title().split("-")[0].trim();
        }
        String title = cleanMarathonTitle(rawTitle);

        String raceDate = raceDetail.path("raceDate").asText(null);
        String startDate = raceDetail.path("applicationStartDate").asText(null);
        String endDate = raceDetail.path("applicationEndDate").asText(null);

        if (raceDate != null && raceDate.trim().isEmpty()) raceDate = null;
        if (startDate != null && startDate.trim().isEmpty()) startDate = null;
        if (endDate != null && endDate.trim().isEmpty()) endDate = null;

        if (startDate == null) startDate = raceDate;
        if (endDate == null) endDate = startDate;

        if (raceDate == null) {
            log.warn(">>> [날짜 누락 건너뜀] : {}", detailUrl);
            return;
        }

        // 공식 홈페이지 신청 링크
        String homepageUrl = raceDetail.path("homepageUrl").asText("").trim();
        String officialLink = detailUrl;
        if (!homepageUrl.isEmpty() && homepageUrl.startsWith("http")) {
            officialLink = homepageUrl;
        }

        // 지역 카테고리
        String regionCategory = raceDetail.path("regionCategory").asText("").trim();
        String region = raceDetail.path("region").asText("").trim();
        String place = raceDetail.path("place").asText("").trim();
        String location = "전국";
        if (!regionCategory.isEmpty()) {
            location = regionCategory;
        } else if (!region.isEmpty()) {
            location = region;
        } else if (!place.isEmpty()) {
            location = extractLocation(place);
        }

        // 종목 매칭 (Full, Half, 10Km, 5Km)
        String raceTypeList = raceDetail.path("raceTypeList").asText("").toLowerCase();
        Set<String> typeSet = new LinkedHashSet<>();
        if (raceTypeList.contains("풀") || raceTypeList.contains("full")) {
            typeSet.add("Full");
        }
        if (raceTypeList.contains("하프") || raceTypeList.contains("half")) {
            typeSet.add("Half");
        }
        if (raceTypeList.contains("10k") || raceTypeList.contains("10km")) {
            typeSet.add("10Km");
        }
        if (raceTypeList.contains("5k") || raceTypeList.contains("5km")) {
            typeSet.add("5Km");
        }

        // 선착순 여부
        String intro = raceDetail.path("intro").asText("");
        boolean isFirstCome = intro.contains("선착순") || title.contains("선착순");

        // 포스터 이미지
        String posterUrl = null;
        Element ogImg = detailDoc.selectFirst("meta[property=og:image]");
        if (ogImg != null) {
            String content = ogImg.attr("content");
            if (content != null && !content.isEmpty() && !content.contains("thumbnail.png")) {
                posterUrl = content;
            }
        }

        Map<String, Object> data = new HashMap<>();
        data.put("title", title);
        data.put("link", officialLink);
        data.put("location", location);
        data.put("race_date", raceDate);
        data.put("start_date", startDate);
        data.put("end_date", endDate);
        data.put("type", typeSet.toArray(new String[0]));
        data.put("is_first_come", isFirstCome);
        data.put("poster_url", posterUrl);

        sendToSupabase(data);
    }

    // 폴백 HTML 파서 (JSON이 없는 예외 케이스용)
    private void processFromHtml(Document detailDoc, String detailUrl) {
        String allText = detailDoc.body().text();

        // 1. 제목 추출
        String title = detailDoc.title().split("-")[0].trim();
        if (title.isEmpty() || title.contains("Marathon")) {
            Element firstP = detailDoc.select("p").first();
            title = (firstP != null) ? firstP.text() : "제목 없음";
        }

        // 2. 날짜 추출 (중복 날짜 제거하여 startDate, endDate 오염 방지)
        LinkedHashSet<String> dateCandidates = new LinkedHashSet<>();
        java.util.regex.Matcher m = java.util.regex.Pattern
                .compile("202\\d[\\.\\-]\\d{1,2}[\\.\\-]\\d{1,2}")
                .matcher(allText);
        while (m.find()) {
            dateCandidates.add(extractDate(m.group()));
        }

        List<String> dateList = new ArrayList<>(dateCandidates);
        String raceDate = !dateList.isEmpty() ? dateList.get(0) : null;
        String startDate = dateList.size() >= 2 ? dateList.get(1) : raceDate;
        String endDate = dateList.size() >= 3 ? dateList.get(2) : startDate;

        if (raceDate == null) {
            log.warn(">>> [HTML 폴백: 날짜 추출 실패] 건너뜀 : {}", detailUrl);
            return;
        }

        // 3. 종목 추출
        Set<String> typeSet = new LinkedHashSet<>();
        Elements elements = detailDoc.select("p, div, span, b, strong");
        for (Element el : elements) {
            String text = el.text().trim();
            if (text.equals("풀") || text.contains("풀코스") || text.toLowerCase().contains("full")) {
                typeSet.add("Full");
            } else if (text.equals("하프") || text.contains("하프코스") || text.toLowerCase().contains("half")) {
                typeSet.add("Half");
            } else if (text.toLowerCase().contains("10km")) {
                typeSet.add("10Km");
            } else if (text.toLowerCase().contains("5km")) {
                typeSet.add("5Km");
            }
        }

        // 4. 공식 링크 추출
        String officialLink = detailUrl;
        Element ogDesc = detailDoc.select("meta[property=og:description]").first();
        if (ogDesc != null) {
            java.util.regex.Matcher urlMatcher = java.util.regex.Pattern
                    .compile("https?://[a-zA-Z0-9\\.\\-]+(?:/[a-zA-Z0-9\\.\\-/\\?\\=\\&_]*)?")
                    .matcher(ogDesc.attr("content"));
            if (urlMatcher.find()) {
                String candidate = urlMatcher.group().trim().split("[^\\p{ASCII}]")[0]
                        .replaceAll("[\\.\\,\\!\\?\\>\\<\\(\\)\\[\\]\\{\\}]+$", "");
                if (!candidate.contains("marathongo.co.kr")) {
                    officialLink = candidate;
                }
            }
        }

        // 5. 포스터 이미지
        String posterUrl = null;
        Element ogImg = detailDoc.selectFirst("meta[property=og:image]");
        if (ogImg != null) {
            String content = ogImg.attr("content");
            if (content != null && !content.isEmpty() && !content.contains("thumbnail.png")) {
                posterUrl = content;
            }
        }

        Map<String, Object> data = new HashMap<>();
        data.put("title", cleanMarathonTitle(title));
        data.put("link", officialLink);
        data.put("location", extractLocation(allText));
        data.put("race_date", raceDate);
        data.put("start_date", startDate);
        data.put("end_date", endDate);
        data.put("type", typeSet.toArray(new String[0]));
        data.put("is_first_come", allText.contains("선착순"));
        data.put("poster_url", posterUrl);

        sendToSupabase(data);
    }

    // --- 유틸리티 메서드 ---
    private String cleanMarathonTitle(String title) {
        if (title == null || title.trim().isEmpty())
            return "제목 없음";
        return title.replaceAll("\\[.*?\\]", "").split("\\|")[0].trim();
    }

    private String extractDate(String text) {
        if (text == null)
            return null;
        String rawDate = text.replace(".", "-");
        try {
            String[] parts = rawDate.split("-");
            return String.format("%s-%02d-%02d", parts[0], Integer.parseInt(parts[1]), Integer.parseInt(parts[2]));
        } catch (Exception e) {
            return rawDate;
        }
    }

    private String extractLocation(String text) {
        String[] locations = { "서울", "경기", "인천", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주", "부산", "울산", "대구", "광주",
                "대전", "세종" };
        for (String loc : locations) {
            if (text.contains(loc))
                return loc;
        }
        return "전국";
    }

    private void sendToSupabase(Map<String, Object> data) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("apikey", supabaseKey);
        headers.set("Authorization", "Bearer " + supabaseKey);
        headers.set("Prefer", "resolution=merge-duplicates");

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(data, headers);
        try {
            String upsertUrl = supabaseUrl + "/rest/v1/marathons?on_conflict=title,race_date";
            restTemplate.postForEntity(upsertUrl, entity, String.class);
            log.info(">>> [저장/갱신 완료] : {} ({})", data.get("title"), data.get("race_date"));
        } catch (Exception e) {
            log.warn(">>> [저장 실패] {} : {}", data.get("title"), e.getMessage());
        }
    }
}