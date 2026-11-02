package com.dohwan.admin.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.dohwan.login.dto.MarathonRequest;
import com.dohwan.login.entity.Marathon;
import com.dohwan.login.service.MarathonService;

/**
 * 관리자 전용 마라톤 일정 등록/수정/삭제.
 * SecurityConfig의 /admin/** (hasRole ADMIN)과 메서드 단위 @PreAuthorize로 이중 보호한다.
 */
@RestController
@RequestMapping("/admin/marathons")
public class AdminMarathonController {

    private final MarathonService marathonService;

    public AdminMarathonController(MarathonService marathonService) {
        this.marathonService = marathonService;
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
