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

    // UUID로 운동 기록 조회
    Optional<Records> findByUuid(String uuid);
    
    // UUID로 운동 기록 존재 여부 확인
    boolean existsByUuid(String uuid);
    
    // UUID로 운동 기록 삭제
    void deleteByUuid(String uuid);
    
    // UUID 리스트로 여러 운동 기록 조회
    List<Records> findByUuidIn(List<String> uuids);

    // 이달의 리더보드 조회 (Record와 UserEntity 조인, 거리 총합 기준 내림차순)
    // 이달의 리더보드 조회 (Record와 UserEntity, Profile 조인 불가 시 users 테이블 아바타 우선 사용, 없으면 빈 문자열 반환)
    // 리소스 제약 상, Native Query 매핑 오류를 피하기 위해 프론트엔드에서 보정하거나 Users 엔티티에 연관된 프로필 이미지를 활용합니다.
    @Query("SELECT new com.dohwan.login.dto.LeaderboardDto(u.username, u.avatarUrl, SUM(COALESCE(r.distanceKm, 0.0)), COUNT(r)) " +
           "FROM Records r JOIN UserEntity u ON r.userNo = u.no " +
           "WHERE r.recordDate >= :start AND r.recordDate < :end " +
           "GROUP BY u.username, u.avatarUrl " +
           "ORDER BY SUM(COALESCE(r.distanceKm, 0.0)) DESC")
    List<com.dohwan.login.dto.LeaderboardDto> getMonthlyLeaderboard(
            @Param("start") java.time.LocalDateTime start,
            @Param("end") java.time.LocalDateTime end
    );

    // 총 누적 거리 조회
    @Query("SELECT SUM(COALESCE(r.distanceKm, 0.0)) FROM Records r")
    Double getTotalDistance();

    // 활동 중인 러너 수 조회 (한 번이라도 기록이 있는 사용자 수)
    @Query("SELECT COUNT(DISTINCT r.userNo) FROM Records r")
    Long getTotalActiveRunners();
}
