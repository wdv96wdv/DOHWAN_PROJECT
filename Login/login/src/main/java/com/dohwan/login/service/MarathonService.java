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
import com.fasterxml.jackson.databind.ObjectMapper;

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
    private final ObjectMapper objectMapper;

    // 병렬 처리를 위한 스레드 풀 생성 (동시 10개 작업)
    private final ExecutorService executor = Executors.newFixedThreadPool(10);

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.key}")
    private String supabaseKey;

    public MarathonService(RestTemplate restTemplate, MarathonRepository marathonRepository,
            ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.marathonRepository = marathonRepository;
        this.objectMapper = objectMapper;
    }

    // --- 1. 데이터 조회 (기존 유지) ---
    public List<Marathon> findAllMarathons() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("apikey", supabaseKey);
        headers.set("Authorization", "Bearer " + supabaseKey);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            String url = supabaseUrl + "/rest/v1/marathons?select=*&order=race_date.desc";
            ResponseEntity<List> response = restTemplate.exchange(url, HttpMethod.GET, entity, List.class);
            if (response.getBody() == null)
                return Collections.emptyList();
            return objectMapper.convertValue(response.getBody(),
                    objectMapper.getTypeFactory().constructCollectionType(List.class, Marathon.class));
        } catch (Exception e) {
            log.error(">>> [조회 실패] : {}", e.getMessage());
            return marathonRepository.findAllByOrderByRaceDateDesc();
        }
    }

    // --- 2. 데이터 수집 (병렬 최적화 버전) ---
    @Scheduled(cron = "0 0 3 * * *") // 매일 새벽 3시에 한 번만 실행
    public void crawlMarathonData() {
        log.info(">>> [병렬 수집 시작] 마라톤 데이터 크롤링...");
        String baseUrl = "https://marathongo.co.kr/bbs/board.php?bo_table=sub2_1";

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

            if (dateCandidates.size() < 2)
                return;

            String raceDate = dateCandidates.get(0);
            String startDate = dateCandidates.get(1);
            String endDate = (dateCandidates.size() >= 3) ? dateCandidates.get(2) : startDate;

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

            // 4. 데이터 패키징 및 전송
            Map<String, Object> data = new HashMap<>();
            data.put("title", cleanMarathonTitle(title));
            data.put("link", detailUrl);
            data.put("location", extractLocation(allText));
            data.put("race_date", raceDate);
            data.put("start_date", startDate);
            data.put("end_date", endDate);
            data.put("type", typeSet.toArray(new String[0])); // 수집된 종목 배열화
            data.put("is_first_come", allText.contains("선착순"));

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
            restTemplate.postForEntity(supabaseUrl + "/rest/v1/marathons", entity, String.class);
            log.info(">>> [저장 완료] : {}", data.get("title"));
        } catch (Exception e) {
            log.warn(">>> [저장 실패] : {}", e.getMessage());
        }
    }
}