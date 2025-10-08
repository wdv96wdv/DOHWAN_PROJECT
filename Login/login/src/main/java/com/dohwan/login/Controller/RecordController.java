package com.dohwan.login.Controller;
import com.dohwan.login.entity.Records;
import com.dohwan.login.repository.RecordRepository;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;


@Slf4j
@RestController
@RequestMapping("/records")
@CrossOrigin(origins = "*")
public class RecordController {
    
    @Autowired
    private RecordRepository recordRepository;
    
    // 모든 운동 기록 조회
    @GetMapping
    public ResponseEntity<List<Records>> getAllRecords() {
        try {
            List<Records> records = recordRepository.findAllByOrderByCreatedAtDesc();
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // 특정 운동 기록 조회
    @GetMapping("/{id}")
    public ResponseEntity<Records> getRecordById(@PathVariable("id") String id) {
        try {
            Optional<Records> record = recordRepository.findById(id);
            if (record.isPresent()) {
                return ResponseEntity.ok(record.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // 운동 기록 생성
    @PostMapping
    public ResponseEntity<Records> createRecord(@RequestBody Records record) {
        try {
            Records savedRecord = recordRepository.save(record);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedRecord);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    // 운동 기록 수정
    @PutMapping("/{id}")
    public ResponseEntity<Records> updateRecord(@PathVariable("id") String id, @RequestBody Records recordDetails) {
        log.info("운동기록 수정 :  {}", id);
        try {
            Optional<Records> optionalRecord = recordRepository.findById(id);
            if (optionalRecord.isPresent()) {
                Records record = optionalRecord.get();
                record.setExerciseName(recordDetails.getExerciseName());
                record.setWeight(recordDetails.getWeight());
                record.setRoundCount(recordDetails.getRoundCount());
                record.setReps(recordDetails.getReps());
                record.setNote(recordDetails.getNote());
                // no는 auto increment이므로 수정하지 않음
                
                Records updatedRecord = recordRepository.save(record);
                return ResponseEntity.ok(updatedRecord);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    // 운동 기록 삭제
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deleteRecord(@PathVariable("id") String id) {
        log.info("운동 삭제 : {}", id);
        try {
            if (recordRepository.existsById(id)) {
                log.info("운동 삭제2 : {}", id);
                recordRepository.deleteById(id);
                return ResponseEntity.noContent().build();
            } else {
                log.info("운동 삭제 실패 : {}", id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.info("운동 삭제 오류 : {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // 운동 이름으로 검색
    @GetMapping("/search")
    public ResponseEntity<List<Records>> searchRecords(@RequestParam("exerciseName") String exerciseName) {
        try {
            List<Records> records = recordRepository.findByExerciseNameContainingIgnoreCaseOrderByCreatedAtDesc(exerciseName);
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // 오늘 운동 기록 조회
    @GetMapping("/today")
    public ResponseEntity<List<Records>> getTodayRecords() {
        try {
            List<Records> records = recordRepository.findTodayRecords();
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // UUID로 운동 기록 조회
    @GetMapping("/uuid/{id}")
    public ResponseEntity<Records> getRecordByUuid(@PathVariable("id") String id) {
        try {
            Optional<Records> record = recordRepository.findById(id);
            if (record.isPresent()) {
                return ResponseEntity.ok(record.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // UUID로 운동 기록 삭제
    @DeleteMapping("/uuid/{id}")
    @Transactional
    public ResponseEntity<Void> deleteRecordByUuid(@PathVariable("id") String id) {
        try {
            if (recordRepository.existsById(id)) {
                recordRepository.deleteById(id);
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // UUID 리스트로 여러 운동 기록 조회
    @PostMapping("/uuid/batch")
    public ResponseEntity<List<Records>> getRecordsByUuids(@RequestBody List<String> ids) {
        try {
            List<Records> records = recordRepository.findByIdIn(ids);
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}