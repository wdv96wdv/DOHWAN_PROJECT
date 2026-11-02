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

import java.time.LocalDate;
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

    // --- 1. 데이터 조회 (임시 비활성화: 신규 공식 데이터 수집 파이프라인 개편 준비) ---
    public List<Marathon> findAllMarathons() {
        log.info(">>> [안내] 마라톤 데이터베이스 개편 작업 중으로 목록 조회가 임시 비활성화(숨김)되었습니다.");
        return Collections.emptyList();
    }

    public Optional<Marathon> findMarathonById(Long id) {
        log.info(">>> [안내] 마라톤 데이터베이스 개편 작업 중으로 상세 조회가 임시 비활성화(숨김)되었습니다.");
        return Optional.empty();
    }

    // --- 신규 마라톤 직접 등록 (자체 서비스 파이프라인) ---
    public Marathon registerMarathon(Marathon marathon) {
        Marathon saved = marathonRepository.save(marathon);
        log.info(">>> [신규 마라톤 등록 성공] ID: {}, Title: {}", saved.getId(), saved.getTitle());
        return saved;
    }

    // --- 2. 데이터 수집 (크롤링 전면 중단/비활성화 처리) ---
    // 외부 마라톤 사이트(마라톤go 등) 크롤링이 즉각 중단되었습니다.
    // @Scheduled(cron = "0 0 3 * * *")
    public void crawlMarathonData() {
        log.warn(">>> [알림] 마라톤 외부 사이트 크롤링 기능이 중단(비활성화)되었습니다. 아무 동작도 수행하지 않습니다.");
    }

    // 상세 페이지 개별 처리 로직 (중단)
    private void processDetailPage(String detailUrl) {
        // 크롤링 중단으로 인한 비활성화
        return;
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
        String raceDetailUrl = raceDetail.path("raceDetailUrl").asText("").trim();
        if (!raceDetailUrl.isEmpty()) {
            posterUrl = "https://marathongo.co.kr/assets/image/race/domestic/" + raceDetailUrl + ".webp";
        } else {
            Element ogImg = detailDoc.selectFirst("meta[property=og:image]");
            if (ogImg != null) {
                String content = ogImg.attr("content");
                if (content != null && !content.isEmpty() && !content.contains("thumbnail.png")) {
                    posterUrl = content;
                }
            }
        }

        saveMarathon(title, officialLink, location, raceDate, startDate, endDate, typeSet, isFirstCome, posterUrl);
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

        saveMarathon(cleanMarathonTitle(title), officialLink, extractLocation(allText), raceDate, startDate, endDate, typeSet, allText.contains("선착순"), posterUrl);
    }

    // --- 저장 핵심 로직 (JPA 직접 저장으로 RLS 우회 및 Supabase 영속화) ---
    private void saveMarathon(String title, String officialLink, String location, String raceDateStr, String startDateStr, String endDateStr, Set<String> typeSet, boolean isFirstCome, String posterUrl) {
        // 1. JPA 직접 저장: DB connection(postgres 계정)을 통해 Supabase REST RLS 제약 없이 직접 저장
        try {
            LocalDate raceDate = LocalDate.parse(raceDateStr);
            LocalDate startDate = LocalDate.parse(startDateStr);
            LocalDate endDate = LocalDate.parse(endDateStr);

            Optional<Marathon> existing = marathonRepository.findByTitleAndRaceDate(title, raceDate);
            Marathon marathon = existing.orElse(new Marathon());
            marathon.setTitle(title);
            marathon.setRaceDate(raceDate);
            marathon.setStartDate(startDate);
            marathon.setEndDate(endDate);
            marathon.setLocation(location);
            marathon.setLink(officialLink);
            marathon.setType(new ArrayList<>(typeSet));
            marathon.setFirstComeFirstServed(isFirstCome);
            marathon.setPosterUrl(posterUrl);

            marathonRepository.save(marathon);
            log.info(">>> [DB 저장/갱신 완료] : {} ({})", title, raceDateStr);
        } catch (Exception ex) {
            log.warn(">>> [JPA 저장 실패] {} : {}", title, ex.getMessage());
        }

        // 2. Supabase REST API 호출
        Map<String, Object> data = new HashMap<>();
        data.put("title", title);
        data.put("link", officialLink);
        data.put("location", location);
        data.put("race_date", raceDateStr);
        data.put("start_date", startDateStr);
        data.put("end_date", endDateStr);
        data.put("type", typeSet.toArray(new String[0]));
        data.put("is_first_come", isFirstCome);
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
        } catch (Exception ignored) {
            // RLS 등으로 인한 REST API 실패는 JPA 직접 저장이 처리하므로 무시
        }
    }
}