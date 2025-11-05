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

    // 생성일 기준 내림차순 정렬
    List<Records> findAllByOrderByCreatedAtDesc();

    // 운동 이름으로 검색
    List<Records> findByRunningNameContainingIgnoreCaseOrderByCreatedAtDesc(String runningName);

    // recordDate 기준 특정 날짜 운동 기록 조회
    @Query("SELECT r FROM Records r WHERE r.recordDate >= :start AND r.recordDate < :end ORDER BY r.createdAt DESC")
    List<Records> findRecordsByDateRange(
            @Param("start") LocalDateTime start, 
            @Param("end") LocalDateTime end
    );

    // 특정 운동의 최신 기록 조회
    @Query("SELECT r FROM Records r WHERE r.runningName = :runningName ORDER BY r.createdAt DESC")
    List<Records> findLatestByRunningName(@Param("runningName") String runningName);

    // UUID로 운동 기록 조회
    Optional<Records> findById(String id);

    // UUID로 운동 기록 존재 여부 확인
    boolean existsById(String id);

    // UUID로 운동 기록 삭제
    void deleteById(String id);

    // UUID 리스트로 여러 운동 기록 조회
    List<Records> findByIdIn(List<String> ids);
}
