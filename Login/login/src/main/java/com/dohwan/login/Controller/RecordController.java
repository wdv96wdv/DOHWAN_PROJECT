package com.dohwan.login.Controller;

import com.dohwan.login.common.ApiResponse;
import com.dohwan.login.dto.CustomUser;
import com.dohwan.login.entity.Records;
import com.dohwan.login.repository.RecordRepository;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/records")
@CrossOrigin(origins = "*")
public class RecordController {

    @Autowired
    private RecordRepository recordRepository;

    // 모든 운동 기록 조회 (사용자별)
    @GetMapping
    public ResponseEntity<ApiResponse<List<Records>>> getAllRecords(@AuthenticationPrincipal CustomUser user) {
        log.info(">>> [GET] /records - 모든 운동 기록 조회 요청 (User No: {})", user != null ? user.getUserNo() : "null");
        try {
            if (user == null) {
                log.warn(">>> [GET] /records - 사용자 인증 정보가 없습니다.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error(401, "로그인이 필요합니다."));
            }
            List<Records> records = recordRepository.findByUserNoOrderByCreatedAtDesc(user.getUserNo());
            log.info(">>> [GET] /records - {}개의 기록을 찾았습니다.", records.size());
            return ResponseEntity.ok(ApiResponse.success(records));
        } catch (Exception e) {
            log.error(">>> [GET] /records - 조회 중 에러 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "서버 에러가 발생했습니다."));
        }
    }

    @Autowired
    private com.dohwan.login.repository.RecordReactionRepository reactionRepository;

    // 소셜 피드: 전체 유저 기록 최신순 조회 (username 포함)
    @GetMapping("/feed")
    public ResponseEntity<ApiResponse<List<java.util.Map<String, Object>>>> getAllFeedRecords(@AuthenticationPrincipal CustomUser currentUser) {
        try {
            List<Object[]> rows = recordRepository.findAllFeedRecords();
            List<java.util.Map<String, Object>> result = rows.stream().map(row -> {
                Records r = (Records) row[0];
                String username = (String) row[1];
                String avatarUrl = (String) row[2];
                
                long likeCount = reactionRepository.countByRecordNo(r.getNo());
                boolean isLiked = false;
                if (currentUser != null) {
                    isLiked = reactionRepository.existsByRecordNoAndUserNo(r.getNo(), currentUser.getUserNo());
                }

                java.util.Map<String, Object> item = new java.util.HashMap<>();
                item.put("id", r.getUuid());
                item.put("username", username);
                item.put("avatarUrl", avatarUrl);
                item.put("runningName", r.getRunningName());
                item.put("date", r.getRecordDate() != null ? r.getRecordDate().toString() : "");
                item.put("distanceKm", r.getDistanceKm());
                item.put("durationSec", r.getDurationSec());
                item.put("paceMinPerKm", r.getPaceMinPerKm());
                item.put("calories", r.getCalories());
                item.put("note", r.getNote());
                item.put("reactionCount", likeCount);
                item.put("liked", isLiked);
                return item;
            }).collect(java.util.stream.Collectors.toList());
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            log.error(">>> [GET] /records/feed 오류", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "서버 에러가 발생했습니다."));
        }
    }

    // 소셜 피드 좋아요 토글 API
    @PostMapping("/{uuid}/like")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> toggleLike(
            @AuthenticationPrincipal CustomUser user,
            @PathVariable("uuid") String uuid) {
        try {
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error(401, "로그인이 필요합니다."));
            }
            Optional<Records> optionalRecord = recordRepository.findByUuid(uuid);
            if (optionalRecord.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error(404, "기록을 찾을 수 없습니다."));
            }
            Records record = optionalRecord.get();
            Optional<com.dohwan.login.entity.RecordReaction> existingReaction =
                    reactionRepository.findByRecordNoAndUserNo(record.getNo(), user.getUserNo());

            boolean liked;
            if (existingReaction.isPresent()) {
                reactionRepository.delete(existingReaction.get());
                liked = false;
            } else {
                com.dohwan.login.entity.RecordReaction newReaction = com.dohwan.login.entity.RecordReaction.builder()
                        .record(record)
                        .userNo(user.getUserNo())
                        .build();
                reactionRepository.save(newReaction);
                liked = true;
            }

            long updatedCount = reactionRepository.countByRecordNo(record.getNo());
            java.util.Map<String, Object> body = new java.util.HashMap<>();
            body.put("liked", liked);
            body.put("reactionCount", updatedCount);

            return ResponseEntity.ok(ApiResponse.success(liked ? "좋아요를 눌렀습니다." : "좋아요를 취소했습니다.", body));
        } catch (Exception e) {
            log.error("좋아요 처리 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "서버 에러가 발생했습니다."));
        }
    }

    // 특정 운동 기록 조회 (UUID)
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Records>> getRecordById(@PathVariable("id") String id) {
        try {
            Optional<Records> record = recordRepository.findByUuid(id);
            if (record.isPresent()) {
                return ResponseEntity.ok(ApiResponse.success(record.get()));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error(404, "기록을 찾을 수 없습니다."));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "서버 에러가 발생했습니다."));
        }
    }

    // 운동 기록 생성
    @PostMapping
    public ResponseEntity<ApiResponse<Records>> createRecord(
            @AuthenticationPrincipal CustomUser user,
            @RequestBody Records record) {
        try {
            // 현재 로그인한 사용자 번호 설정
            record.setUserNo(user.getUserNo());
            
            // recordDate가 비어있으면 현재 시간 기준으로 기본 설정
            if (record.getRecordDate() == null) {
                record.setRecordDate(LocalDateTime.now());
            }
            Records savedRecord = recordRepository.save(record);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("운동 기록이 생성되었습니다.", savedRecord));
        } catch (Exception e) {
            log.error("운동 기록 생성 실패", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(400, "잘못된 요청입니다."));
        }
    }

    // 운동 기록 수정
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Records>> updateRecord(
            @AuthenticationPrincipal CustomUser user,
            @PathVariable("id") String id, 
            @RequestBody Records recordDetails) {
        log.info("운동기록 수정 :  {}", id);
        try {
            Optional<Records> optionalRecord = recordRepository.findByUuid(id);
            if (optionalRecord.isPresent()) {
                Records record = optionalRecord.get();
                
                // 본인 기록인지 확인
                if (!record.getUserNo().equals(user.getUserNo())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(ApiResponse.error(403, "권한이 없습니다."));
                }

                if (recordDetails.getRunningName() != null) record.setRunningName(recordDetails.getRunningName());
                if (recordDetails.getDistanceKm() != null) record.setDistanceKm(recordDetails.getDistanceKm());
                if (recordDetails.getDurationSec() != null) record.setDurationSec(recordDetails.getDurationSec());
                if (recordDetails.getPaceMinPerKm() != null) record.setPaceMinPerKm(recordDetails.getPaceMinPerKm());
                if (recordDetails.getSpeedKmh() != null) record.setSpeedKmh(recordDetails.getSpeedKmh());
                if (recordDetails.getCadence() != null) record.setCadence(recordDetails.getCadence());
                if (recordDetails.getCalories() != null) record.setCalories(recordDetails.getCalories());
                if (recordDetails.getNote() != null) record.setNote(recordDetails.getNote());
                if (recordDetails.getRecordDate() != null) record.setRecordDate(recordDetails.getRecordDate());

                Records updatedRecord = recordRepository.save(record);
                return ResponseEntity.ok(ApiResponse.success("운동 기록이 수정되었습니다.", updatedRecord));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error(404, "기록을 찾을 수 없습니다."));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(400, "잘못된 요청입니다."));
        }
    }

    // 운동 기록 삭제
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> deleteRecord(
            @AuthenticationPrincipal CustomUser user,
            @PathVariable("id") String id) {
        try {
            Optional<Records> optionalRecord = recordRepository.findByUuid(id);
            if (optionalRecord.isPresent()) {
                // 본인 기록인지 확인
                if (!optionalRecord.get().getUserNo().equals(user.getUserNo())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(ApiResponse.error(403, "권한이 없습니다."));
                }
                recordRepository.deleteByUuid(id);
                return ResponseEntity.ok(ApiResponse.success("기록이 삭제되었습니다."));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error(404, "기록을 찾을 수 없습니다."));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "서버 에러가 발생했습니다."));
        }
    }

    // 운동 이름으로 검색 (사용자별)
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<Records>>> searchRecords(
            @AuthenticationPrincipal CustomUser user,
            @RequestParam("runningName") String runningName) {
        try {
            List<Records> records = recordRepository.findByUserNoAndRunningNameContainingIgnoreCaseOrderByCreatedAtDesc(user.getUserNo(), runningName);
            return ResponseEntity.ok(ApiResponse.success(records));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "서버 에러가 발생했습니다."));
        }
    }

    // 특정 날짜 운동 기록 조회 (사용자별)
    @GetMapping("/by-date")
    public ResponseEntity<ApiResponse<List<Records>>> getRecordsByDate(
            @AuthenticationPrincipal CustomUser user,
            @RequestParam("date") String dateStr) {
        try {
            LocalDate date = LocalDate.parse(dateStr);
            LocalDateTime start = date.atStartOfDay();
            LocalDateTime end = date.atTime(LocalTime.MAX);
            List<Records> records = recordRepository.findRecordsByDateRange(user.getUserNo(), start, end);
            return ResponseEntity.ok(ApiResponse.success(records));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "서버 에러가 발생했습니다."));
        }
    }

    // 오늘 운동 기록 조회 (사용자별)
    @GetMapping("/today")
    public ResponseEntity<ApiResponse<List<Records>>> getTodayRecords(@AuthenticationPrincipal CustomUser user) {
        try {
            LocalDate today = LocalDate.now();
            LocalDateTime start = today.atStartOfDay();
            LocalDateTime end = today.atTime(LocalTime.MAX);
            List<Records> records = recordRepository.findRecordsByDateRange(user.getUserNo(), start, end);
            return ResponseEntity.ok(ApiResponse.success(records));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "서버 에러가 발생했습니다."));
        }
    }

    // UUID 리스트로 여러 운동 기록 조회
    @PostMapping("/uuid/batch")
    public ResponseEntity<ApiResponse<List<Records>>> getRecordsByUuids(@RequestBody List<String> ids) {
        try {
            List<Records> records = recordRepository.findByUuidIn(ids);
            return ResponseEntity.ok(ApiResponse.success(records));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "서버 에러가 발생했습니다."));
        }
    }

    // 이달의 리더보드 조회
    @GetMapping("/leaderboard")
    public ResponseEntity<ApiResponse<List<com.dohwan.login.dto.LeaderboardDto>>> getLeaderboard() {
        try {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
            LocalDateTime endOfRange = startOfMonth.plusMonths(1);
            List<com.dohwan.login.dto.LeaderboardDto> leaderboard = recordRepository.getMonthlyLeaderboard(startOfMonth, endOfRange);
            return ResponseEntity.ok(ApiResponse.success(leaderboard));
        } catch (Exception e) {
            log.error("리더보드 조회 에러: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "서버 에러가 발생했습니다."));
        }
    }

    // 앱 전체 통계 조회 (활동 중인 러너 및 총 누적 거리)
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> getAppStats() {
        try {
            Double totalDistance = recordRepository.getTotalDistance();
            Long activeRunners = recordRepository.getTotalActiveRunners();
            
            java.util.Map<String, Object> stats = new java.util.HashMap<>();
            stats.put("totalDistance", totalDistance != null ? Math.round(totalDistance) : 0);
            stats.put("activeRunners", activeRunners != null ? activeRunners : 0);
            
            return ResponseEntity.ok(ApiResponse.success(stats));
        } catch (Exception e) {
            log.error("통계 조회 에러: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "서버 에러가 발생했습니다."));
        }
    }
}
