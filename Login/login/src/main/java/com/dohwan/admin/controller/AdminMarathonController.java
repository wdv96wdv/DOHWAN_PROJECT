package com.dohwan.admin.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.dohwan.login.dto.MarathonRequest;
import com.dohwan.login.entity.Marathon;
import com.dohwan.login.service.MarathonService;
import com.dohwan.login.service.PosterStorageService;

/**
 * 관리자 전용 마라톤 일정 등록/수정/삭제.
 * SecurityConfig의 /admin/** (hasRole ADMIN)과 메서드 단위 @PreAuthorize로 이중 보호한다.
 */
@RestController
@RequestMapping("/admin/marathons")
public class AdminMarathonController {

    private final MarathonService marathonService;
    private final PosterStorageService posterStorage;

    public AdminMarathonController(MarathonService marathonService, PosterStorageService posterStorage) {
        this.marathonService = marathonService;
        this.posterStorage = posterStorage;
    }

    // 전체 목록 (지난 대회 포함)
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping
    public ResponseEntity<List<Marathon>> list() {
        return ResponseEntity.ok(marathonService.findAllForAdmin());
    }

    // 등록
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping
    public ResponseEntity<Marathon> create(@RequestBody MarathonRequest request) {
        return ResponseEntity.ok(marathonService.create(request));
    }

    // 포스터 업로드 (프론트에서 WebP로 압축한 파일만 허용). 반환된 url을 등록/수정 요청의 poster_url에 넣는다.
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping(value = "/poster", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadPoster(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(Map.of("url", posterStorage.upload(file)));
    }

    // 수정
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Marathon> update(@PathVariable("id") Long id, @RequestBody MarathonRequest request) {
        return ResponseEntity.ok(marathonService.update(id, request));
    }

    // 삭제
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable("id") Long id) {
        marathonService.delete(id);
        return ResponseEntity.ok("삭제 완료");
    }
}
