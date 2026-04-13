package com.dohwan.login.service;

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
    // objectMapper 필드 제거됨

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

    // --- 1. 데이터 조회 (기존 유지 및 단건 추가) ---
    public List<Marathon> findAllMarathons() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("apikey", supabaseKey);
        headers.set("Authorization", "Bearer " + supabaseKey);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            // 정렬 기준을 뺀 기본 조회 쿼리 유지 (전체 데이터를 받아옴)
            String url = supabaseUrl + "/rest/v1/marathons?select=*";
            
            // ParameterizedTypeReference를 사용하여 제네릭 타입 정보 유지
            ResponseEntity<List<Marathon>> response = restTemplate.exchange(
                url, 
                HttpMethod.GET, 
                entity, 
                new org.springframework.core.ParameterizedTypeReference<List<Marathon>>() {}
            );
            
            if (response == null || response.getBody() == null)
                return Collections.emptyList();
            
            // 데이터 형평성을 위해 매번 랜덤하게 섞어서 반환
            List<Marathon> marathons = new ArrayList<>(response.getBody());
            Collections.shuffle(marathons);
            return marathons;
        } catch (Exception e) {
            log.error(">>> [조회 실패] : {}", e.getMessage());
            // DB fallback 시에도 랜덤하게 섞어서 반환
            List<Marathon> fallbackList = new ArrayList<>(marathonRepository.findAllByOrderByRaceDateDesc());
            Collections.shuffle(fallbackList);
            return fallbackList;
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
            if (body == null || body.isEmpty())
                return marathonRepository.findById(id);

            Marathon single = body.get(0);
            return Optional.ofNullable(single);
        } catch (Exception e) {
            log.error(">>> [단건 조회 실패] : {}", e.getMessage());
            return marathonRepository.findById(id);
        }
    }

    // --- 2. 데이터 수집 (병렬 최적화 버전) ---
    @Scheduled(cron = "0 0 3 * * *") // 매일 새벽 3시에 한 번만 실행
    public void crawlMarathonData() {
        log.info(">>> [병렬 수집 시작] 마라톤 데이터 크롤링...");
        // 마라톤Go 사이트 구조 변경에 따른 목록 페이지 URL 최신화
        String baseUrl = "https://marathongo.co.kr/raceSchedule/domestic";

        try {
            Document listDoc = Jsoup.connect(baseUrl)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                    .timeout(30000).get();

            Elements links = listDoc.select("a[href*=/raceDetail/]");
            List<String> detailUrls = links.stream()
                    .map(el -> el.attr("abs:href"))
                    .distinct()
                    .collect(Collectors.toList());

            log.info(">>> 분석 대상 URL 수: {}개", detailUrls.size());

            // CompletableFuture를 이용한 병렬 실행
            List<CompletableFuture<Void>> futures = detailUrls.stream()
                    .map(url -> CompletableFuture.runAsync(() -> processDetailPage(url), executor))
                    .collect(Collectors.toList());

            // 모든 작업이 끝날 때까지 대기
            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

            log.info(">>> [병렬 수집 완료]");
        } catch (Exception e) {
            log.error(">>> [메인 크롤링 중단] : {}", e.getMessage());
        }
    }

    // 상세 페이지 개별 처리 로직
    private void processDetailPage(String detailUrl) {
        try {
            Document detailDoc = Jsoup.connect(detailUrl)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                    .timeout(15000).get();

            String allText = detailDoc.body().text();

            // 1. 제목 추출
            String title = detailDoc.title().split("-")[0].trim();
            if (title.isEmpty() || title.contains("Marathon")) {
                Element firstP = detailDoc.select("p").first();
                title = (firstP != null) ? firstP.text() : "제목 없음";
            }

            // 2. 날짜 추출
            List<String> dateCandidates = new ArrayList<>();
            java.util.regex.Matcher m = java.util.regex.Pattern
                    .compile("202\\d[\\.\\-]\\d{1,2}[\\.\\-]\\d{1,2}")
                    .matcher(allText);
            while (m.find()) {
                dateCandidates.add(extractDate(m.group()));
            }

            String raceDate = null;
            String startDate = null;
            String endDate = null;

            if (dateCandidates.size() >= 1) raceDate = dateCandidates.get(0);
            if (dateCandidates.size() >= 2) startDate = dateCandidates.get(1);
            if (dateCandidates.size() >= 3) endDate = dateCandidates.get(2);
            
            if (startDate == null) startDate = raceDate;
            if (endDate == null) endDate = startDate;

            if (raceDate == null) {
                log.warn(">>> [날짜 추출 실패] 건너뜀 : {}", detailUrl);
                return;
            }

            // 3. 종목(Type) 정밀 추출 (리액트 필터 연동용)
            Set<String> typeSet = new HashSet<>();

            // 모든 텍스트 요소를 뒤져서 키워드 매칭
            Elements elements = detailDoc.select("p, div, span, b, strong");
            for (Element el : elements) {
                String text = el.text().trim();

                // 1. 풀코스 (Full) 매칭: '풀' 단독 태그 혹은 '풀코스' 포함
                if (text.equals("풀") || text.contains("풀코스") || text.toLowerCase().contains("full")) {
                    typeSet.add("Full");
                }
                // 2. 하프코스 (Half) 매칭
                else if (text.equals("하프") || text.contains("하프코스") || text.toLowerCase().contains("half")) {
                    typeSet.add("Half");
                }
                // 3. 10km / 5km 매칭
                else if (text.toLowerCase().contains("10km")) {
                    typeSet.add("10Km");
                } else if (text.toLowerCase().contains("5km")) {
                    typeSet.add("5Km");
                }
            }

            // 4. 실제 공식 홈페이지(신청하기) 링크 추출 시도 (정밀화)
            String officialLink = detailUrl; // 기본값
            boolean found = false;

            // 4-1. OG Meta Description에서 링크 추출 시도 (가장 정확한 경우가 많음)
            Element ogDesc = detailDoc.select("meta[property=og:description]").first();
            if (ogDesc != null) {
                String descContent = ogDesc.attr("content");
                // 정규표현식으로 URL 추출 (한글 등 비영어권 문자 제외)
                java.util.regex.Matcher urlMatcher = java.util.regex.Pattern
                        .compile("https?://[a-zA-Z0-9\\.\\-]+(?:/[a-zA-Z0-9\\.\\-/\\?\\=\\&_]*)?")
                        .matcher(descContent);
                
                while (urlMatcher.find()) {
                    String candidate = urlMatcher.group().trim()
                            .split("[^\\p{ASCII}]")[0] // 한글 등 비ASCII 문자가 보이면 그 앞에서 자름
                            .replaceAll("[\\.\\,\\!\\?\\>\\<\\(\\)\\[\\]\\{\\}]+$", ""); 
                    if (!candidate.contains("marathongo.co.kr")) {
                        officialLink = candidate;
                        found = true;
                        break;
                    }
                }
            }

            // 4-2. '신청하기', '홈페이지' 텍스트를 포함하는 링크 찾기 (OG에서 못 찾은 경우)
            if (!found) {
                Elements allLinks = detailDoc.select("a[href]");
                for (Element linkEl : allLinks) {
                    String linkText = linkEl.text().trim();
                    String href = linkEl.attr("abs:href");

                    // 핵심 키워드가 포함되었거나, marathongo가 아닌 외부 도메인인 경우
                    if (linkText.contains("신청하기") || linkText.contains("홈페이지") || linkText.contains("접수하기")) {
                        if (href != null && !href.isEmpty() && !href.contains("marathongo.co.kr") && href.startsWith("http")) {
                            officialLink = href;
                            found = true;
                            break;
                        }
                    }
                }
            }

            // 4-3. 도저히 못 찾으면 본문 텍스트 내에서 URL 패턴 검색
            if (!found) {
                java.util.regex.Matcher mUrl = java.util.regex.Pattern
                        .compile("https?://[a-zA-Z0-9\\.\\-]+(?:/[a-zA-Z0-9\\.\\-/\\?\\=\\&_]*)?")
                        .matcher(allText);
                while (mUrl.find()) {
                    String candidate = mUrl.group().trim()
                            .split("[^\\p{ASCII}]")[0] // 한글 등 비ASCII 문자가 보이면 그 앞에서 자름
                            .replaceAll("[\\.\\,\\!\\?\\>\\<\\(\\)\\[\\]\\{\\}]+$", ""); 
                    if (!candidate.contains("marathongo.co.kr") && !candidate.contains("google.com")) {
                        officialLink = candidate;
                        found = true;
                        break;
                    }
                }
            }

            if (found) {
                log.info(">>> [공식 사이트 추출 성공] : {} (대회: {})", officialLink, title);
            } else {
                log.warn(">>> [공식 사이트 추출 실패] 상세 페이지 유지 : {} (대회: {})", detailUrl, title);
            }

            // 5. 데이터 패키징 및 전송
            Map<String, Object> data = new HashMap<>();
            data.put("title", cleanMarathonTitle(title));
            data.put("link", officialLink);
            data.put("location", extractLocation(allText));
            data.put("race_date", raceDate);
            data.put("start_date", startDate);
            data.put("end_date", endDate);
            data.put("type", typeSet.toArray(new String[0])); 
            data.put("is_first_come", allText.contains("선착순"));

            log.info(">>> [업서트 준비] : {} (날짜: {}, 링크: {})", data.get("title"), raceDate, officialLink);
            sendToSupabase(data);

        } catch (Exception e) {
            log.warn(">>> [상세 분석 실패] {} : {}", detailUrl, e.getMessage());
        }
    }

    // --- 유틸리티 메서드 (기존 로직 유지) ---
    private String cleanMarathonTitle(String title) {
        if (title == null || title.isEmpty())
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
            // on_conflict 파라미터를 추가해야 중복 시 링크 등이 업데이트(UPSERT)됩니다.
            String upsertUrl = supabaseUrl + "/rest/v1/marathons?on_conflict=title,race_date";
            restTemplate.postForEntity(upsertUrl, entity, String.class);
            log.info(">>> [저장/갱신 완료] : {}", data.get("title"));
        } catch (Exception e) {
            log.warn(">>> [저장 실패] : {}", e.getMessage());
        }
    }
}