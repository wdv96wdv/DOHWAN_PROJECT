package com.dohwan.login.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.dohwan.login.entity.Records;

@Repository
public interface RecordRepository extends JpaRepository<Records, Long> {

    // 사용자별 생성일 기준 내림차순 정렬
    List<Records> findByUserNoOrderByCreatedAtDesc(Long userNo);

    // 사용자별 운동 이름으로 검색
    List<Records> findByUserNoAndRunningNameContainingIgnoreCaseOrderByCreatedAtDesc(Long userNo, String runningName);

    // 사용자별 recordDate 기준 특정 날짜 운동 기록 조회
    @Query("SELECT r FROM Records r WHERE r.userNo = :userNo AND r.recordDate >= :start AND r.recordDate < :end ORDER BY r.createdAt DESC")
    List<Records> findRecordsByDateRange(
            @Param("userNo") Long userNo,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    // UUID로 운동 기록 조회 (사용자 검증 포함 권장)
    Optional<Records> findById(String id);

    // UUID로 운동 기록 존재 여부 확인
    boolean existsById(String id);

    // UUID로 운동 기록 삭제
    void deleteById(String id);

    // UUID 리스트로 여러 운동 기록 조회
    List<Records> findByIdIn(List<String> ids);
}
