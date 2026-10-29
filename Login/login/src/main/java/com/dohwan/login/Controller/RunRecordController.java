package com.dohwan.login.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dohwan.login.common.ApiResponse;
import com.dohwan.login.dto.CustomUser;
import com.dohwan.login.dto.RunRecordDto;
import com.dohwan.login.entity.RunRecord;
import com.dohwan.login.repository.RunRecordRepository;
import com.dohwan.login.service.RunRecordService;

@RestController
@RequestMapping("/run")
public class RunRecordController {

    @Autowired
    private RunRecordService service;
    
    @Autowired
    private RunRecordRepository repository;

    @PostMapping
    public ResponseEntity<?> saveRun(@AuthenticationPrincipal CustomUser user, @RequestBody RunRecordDto dto) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error(401, "로그인이 필요합니다."));
        }
        RunRecord saved = service.saveRunRecord(dto);
        return ResponseEntity.ok(ApiResponse.success(saved));
    }

    @GetMapping
    public ResponseEntity<?> getAllRuns(@AuthenticationPrincipal CustomUser user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error(401, "로그인이 필요합니다."));
        }
        return ResponseEntity.ok(ApiResponse.success(repository.findAll()));
    }
}
