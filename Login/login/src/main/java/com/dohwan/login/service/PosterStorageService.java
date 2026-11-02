package com.dohwan.login.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.YearMonth;
import java.util.UUID;

/**
 * 마라톤 포스터 전용 Supabase Storage('posters' 버킷) 관리.
 * - 버킷은 공개 읽기 / 쓰기 정책 없음 → 업로드와 삭제는 서비스 키를 가진 이 서버만 할 수 있다.
 * - WebP 파일만 허용한다 (프론트에서 업로드 전에 WebP로 압축해서 보낸다).
 */
@Service
public class PosterStorageService {

    private static final Logger log = LoggerFactory.getLogger(PosterStorageService.class);

    public static final String BUCKET = "posters";
    /** 압축된 포스터의 최대 크기 (버킷 제한과 동일하게 2MB) */
    public static final long MAX_BYTES = 2L * 1024 * 1024;

    private final RestTemplate restTemplate;

    @Value("${supabase.url}")
    private String supabaseUrl;

    /** service_role(secret) 키. 환경변수 SUPABASE_SERVICE_KEY 로만 주입하고 코드/저장소에 넣지 않는다. */
    @Value("${supabase.service-key:}")
    private String serviceKey;

    public PosterStorageService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /** 공개 URL의 앞부분. 이 값으로 시작하는 URL만 우리가 올린 포스터로 인정한다. */
    public String publicPrefix() {
        return supabaseUrl + "/storage/v1/object/public/" + BUCKET + "/";
    }

    public boolean isOwnPosterUrl(String url) {
        return url != null && url.startsWith(publicPrefix()) && url.length() > publicPrefix().length();
    }

    /** WebP 이미지를 업로드하고 공개 URL을 반환한다. */
    public String upload(MultipartFile file) {
        if (serviceKey == null || serviceKey.isBlank()) {
            throw new IllegalArgumentException("포스터 업로드 설정(SUPABASE_SERVICE_KEY)이 아직 되어 있지 않습니다.");
        }
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("업로드할 이미지가 없습니다.");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new IllegalArgumentException("포스터는 압축 후 2MB 이하여야 합니다.");
        }

        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            throw new IllegalArgumentException("이미지를 읽을 수 없습니다.");
        }
        if (!isWebp(bytes)) {
            throw new IllegalArgumentException("WebP 이미지만 업로드할 수 있습니다.");
        }

        // 추측하기 어려운 이름 + 월별 폴더. 같은 이름이 생기지 않으므로 캐시를 길게 잡는다.
        String path = "marathon/" + YearMonth.now() + "/" + UUID.randomUUID() + ".webp";

        HttpHeaders headers = new HttpHeaders();
        headers.set("apikey", serviceKey);
        headers.set("Authorization", "Bearer " + serviceKey);
        headers.setContentType(MediaType.parseMediaType("image/webp"));
        headers.set("Cache-Control", "max-age=31536000");
        headers.set("x-upsert", "false");

        try {
            restTemplate.exchange(
                    supabaseUrl + "/storage/v1/object/" + BUCKET + "/" + path,
                    HttpMethod.POST,
                    new HttpEntity<>(bytes, headers),
                    String.class);
        } catch (HttpStatusCodeException e) {
            log.error(">>> [포스터 업로드 실패] status={} body={}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new IllegalArgumentException("포스터 업로드에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        }

        String url = publicPrefix() + path;
        log.info(">>> [포스터 업로드 완료] {} ({} bytes)", path, bytes.length);
        return url;
    }

    /** 교체/삭제된 포스터 파일을 정리한다. 실패해도 서비스 흐름은 막지 않는다. */
    public void deleteQuietly(String url) {
        try {
            if (!isOwnPosterUrl(url) || serviceKey == null || serviceKey.isBlank()) {
                return;
            }
            String path = url.substring(publicPrefix().length());
            if (path.contains("..") || path.contains("?") || path.contains("#")) {
                return;
            }

            HttpHeaders headers = new HttpHeaders();
            headers.set("apikey", serviceKey);
            headers.set("Authorization", "Bearer " + serviceKey);

            restTemplate.exchange(
                    supabaseUrl + "/storage/v1/object/" + BUCKET + "/" + path,
                    HttpMethod.DELETE,
                    new HttpEntity<>(headers),
                    String.class);
            log.info(">>> [포스터 파일 삭제] {}", path);
        } catch (Exception e) {
            log.warn(">>> [포스터 파일 삭제 실패, 무시] {} : {}", url, e.getMessage());
        }
    }

    /** RIFF....WEBP 시그니처 확인 (확장자/Content-Type만 믿지 않는다) */
    private static boolean isWebp(byte[] b) {
        return b != null && b.length > 12
                && b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F'
                && b[8] == 'W' && b[9] == 'E' && b[10] == 'B' && b[11] == 'P';
    }
}
