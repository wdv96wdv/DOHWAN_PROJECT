package com.dohwan.login.service;

import com.dohwan.login.dto.MarathonRequest;
import com.dohwan.login.entity.Marathon;
import com.dohwan.login.repository.MarathonRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.*;

@Service
public class MarathonService {

    private static final Logger log = LoggerFactory.getLogger(MarathonService.class);

    /** 허용하는 종목 값 */
    private static final Set<String> ALLOWED_TYPES = new LinkedHashSet<>(
            List.of("Full", "Half", "10Km", "5Km"));

    /** 직접 등록한 대회의 source_type 값 */
    public static final String SOURCE_ADMIN = "admin";

    private final RestTemplate restTemplate;
    private final MarathonRepository marathonRepository;

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.key}")
    private String supabaseKey;

    public MarathonService(RestTemplate restTemplate, MarathonRepository marathonRepository) {
        this.restTemplate = restTemplate;
        this.marathonRepository = marathonRepository;
    }

    // --- 1. 공개 조회 ---
    public List<Marathon> findAllMarathons() {
        LocalDate today = LocalDate.now();
        try {
            // JPA로 오늘 이후 대회만 오름차순 조회 (과거 종료 대회 제외)
            List<Marathon> list = marathonRepository.findByRaceDateGreaterThanEqualOrderByRaceDateAsc(today);
            if (list != null && !list.isEmpty()) {
                log.info(">>> [JPA 조회 성공] 오늘({}) 이후 대회: {}개", today, list.size());
                return list;
            }
            log.warn(">>> [JPA 조회 결과 없음] 오늘 이후 대회 0개");
        } catch (Exception e) {
            log.warn(">>> [JPA 조회 실패, Supabase REST 폴백 시도] : {}", e.getMessage());
        }

        // 폴백: Supabase REST API 조회 (날짜 필터 + 페이지네이션으로 1000개 제한 우회)
        HttpHeaders headers = new HttpHeaders();
        headers.set("apikey", supabaseKey);
        headers.set("Authorization", "Bearer " + supabaseKey);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        List<Marathon> allResults = new ArrayList<>();
        int pageSize = 1000;
        int offset = 0;

        try {
            while (true) {
                String url = supabaseUrl + "/rest/v1/marathons?select=*"
                        + "&race_date=gte." + today
                        + "&order=race_date.asc"
                        + "&limit=" + pageSize
                        + "&offset=" + offset;

                ResponseEntity<List<Marathon>> response = restTemplate.exchange(
                        url,
                        HttpMethod.GET,
                        entity,
                        new org.springframework.core.ParameterizedTypeReference<List<Marathon>>() {
                        });

                List<Marathon> page = (response != null) ? response.getBody() : null;
                if (page == null || page.isEmpty())
                    break;

                allResults.addAll(page);
                if (page.size() < pageSize)
                    break;
                offset += pageSize;
            }
            log.info(">>> [Supabase REST 폴백] 오늘 이후 대회: {}개", allResults.size());
            return allResults;
        } catch (Exception e) {
            log.error(">>> [조회 실패] : {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    public Optional<Marathon> findMarathonById(Long id) {
        try {
            Optional<Marathon> direct = marathonRepository.findById(id);
            if (direct.isPresent()) {
                return direct;
            }
        } catch (Exception e) {
            log.warn(">>> [JPA 단건 조회 실패, REST 시도] : {}", e.getMessage());
        }

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
                    new org.springframework.core.ParameterizedTypeReference<List<Marathon>>() {
                    });
            List<Marathon> body = (response != null) ? response.getBody() : null;
            if (body == null || body.isEmpty()) {
                return Optional.empty();
            }
            return Optional.ofNullable(body.get(0));
        } catch (Exception e) {
            log.error(">>> [단건 조회 실패] : {}", e.getMessage());
            return Optional.empty();
        }
    }

    // --- 2. 관리자 전용: 목록 / 등록 / 수정 / 삭제 ---

    /** 관리자 목록: 지난 대회 포함, 최신 대회일 순 */
    @Transactional(readOnly = true)
    public List<Marathon> findAllForAdmin() {
        return marathonRepository.findAllByOrderByRaceDateDesc();
    }

    @Transactional
    public Marathon create(MarathonRequest req) {
        Marathon m = new Marathon();
        apply(m, req, null);
        m.setSourceType(SOURCE_ADMIN);
        Marathon saved = marathonRepository.save(m);
        log.info(">>> [마라톤 등록] id={} title={} race_date={}", saved.getId(), saved.getTitle(), saved.getRaceDate());
        return saved;
    }

    @Transactional
    public Marathon update(Long id, MarathonRequest req) {
        Marathon m = marathonRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 대회입니다. id=" + id));
        apply(m, req, id);
        Marathon saved = marathonRepository.save(m);
        log.info(">>> [마라톤 수정] id={} title={}", saved.getId(), saved.getTitle());
        return saved;
    }

    @Transactional
    public void delete(Long id) {
        if (!marathonRepository.existsById(id)) {
            throw new IllegalArgumentException("존재하지 않는 대회입니다. id=" + id);
        }
        marathonRepository.deleteById(id);
        log.info(">>> [마라톤 삭제] id={}", id);
    }

    /** 요청값 검증 후 엔티티에 반영. selfId는 수정 시 자기 자신을 중복 검사에서 제외하기 위한 값 */
    private void apply(Marathon m, MarathonRequest req, Long selfId) {
        if (req == null) {
            throw new IllegalArgumentException("요청 내용이 비어 있습니다.");
        }

        String title = trimToNull(req.getTitle());
        if (title == null) {
            throw new IllegalArgumentException("대회명을 입력해 주세요.");
        }
        if (title.length() > 255) {
            throw new IllegalArgumentException("대회명은 255자 이내로 입력해 주세요.");
        }

        String location = trimToNull(req.getLocation());
        if (location == null) {
            throw new IllegalArgumentException("지역을 선택해 주세요.");
        }
        if (location.length() > 100) {
            throw new IllegalArgumentException("지역은 100자 이내로 입력해 주세요.");
        }

        LocalDate raceDate = parseDate(req.getRaceDate(), "대회일", true);
        LocalDate startDate = parseDate(req.getStartDate(), "접수 시작일", false);
        LocalDate endDate = parseDate(req.getEndDate(), "접수 마감일", false);
        // 접수일을 비워두면 기존 데이터 형식에 맞춰 대회일/시작일로 채운다
        if (startDate == null)
            startDate = raceDate;
        if (endDate == null)
            endDate = startDate;
        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("접수 마감일은 접수 시작일보다 빠를 수 없습니다.");
        }

        List<String> types = new ArrayList<>();
        if (req.getType() != null) {
            for (String t : req.getType()) {
                if (t == null)
                    continue;
                if (!ALLOWED_TYPES.contains(t)) {
                    throw new IllegalArgumentException("허용되지 않는 종목입니다: " + t);
                }
                if (!types.contains(t))
                    types.add(t);
            }
        }
        if (types.isEmpty()) {
            throw new IllegalArgumentException("종목을 하나 이상 선택해 주세요.");
        }

        String link = trimToNull(req.getLink());
        if (link != null && !link.matches("^https?://\\S+$")) {
            throw new IllegalArgumentException("링크는 http:// 또는 https:// 로 시작해야 합니다.");
        }

        // 포스터는 우리 Supabase Storage에 직접 올린 파일만 허용 (외부 이미지 URL 금지)
        String posterUrl = trimToNull(req.getPosterUrl());
        if (posterUrl != null && !posterUrl.startsWith(supabaseUrl + "/storage/v1/object/public/")) {
            throw new IllegalArgumentException("포스터는 직접 업로드한 이미지만 사용할 수 있습니다.");
        }

        // 같은 대회가 두 번 등록되지 않도록 (title + race_date)
        Optional<Marathon> dup = marathonRepository.findByTitleAndRaceDate(title, raceDate);
        if (dup.isPresent() && !Objects.equals(dup.get().getId(), selfId)) {
            throw new IllegalArgumentException("같은 이름과 대회일의 대회가 이미 등록되어 있습니다.");
        }

        m.setTitle(title);
        m.setLocation(location);
        m.setLink(link);
        m.setRaceDate(raceDate);
        m.setStartDate(startDate);
        m.setEndDate(endDate);
        m.setType(types);
        m.setFirstComeFirstServed(req.isFirstCome());
        m.setPosterUrl(posterUrl);
    }

    private static LocalDate parseDate(String value, String label, boolean required) {
        String v = trimToNull(value);
        if (v == null) {
            if (required) {
                throw new IllegalArgumentException(label + "을(를) 입력해 주세요.");
            }
            return null;
        }
        try {
            return LocalDate.parse(v);
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException(label + " 형식이 올바르지 않습니다. (yyyy-MM-dd)");
        }
    }

    private static String trimToNull(String s) {
        if (s == null)
            return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }
}
