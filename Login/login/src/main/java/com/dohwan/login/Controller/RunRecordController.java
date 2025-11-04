package com.dohwan.login.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dohwan.login.domain.RunRecordDto;
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
    public ResponseEntity<RunRecord> saveRun(@RequestBody RunRecordDto dto) {
        RunRecord saved = service.saveRunRecord(dto);
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<List<RunRecord>> getAllRuns() {
        return ResponseEntity.ok(repository.findAll());
    }
}
