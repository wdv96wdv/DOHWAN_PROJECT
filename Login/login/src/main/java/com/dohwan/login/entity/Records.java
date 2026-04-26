package com.dohwan.login.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity // JPA Entity임을 명시
@Table(name = "records") // 테이블 이름 지정
@EntityListeners(AuditingEntityListener.class) // Auditing 기능 활성화 (createdAt, updatedAt 자동 관리)
@Data // Lombok: getter, setter, toString, equals, hashCode 자동 생성
@NoArgsConstructor // Lombok: 기본 생성자 자동 생성
@AllArgsConstructor // Lombok: 모든 필드를 받는 생성자 자동 생성
@Builder // Lombok: Builder 패턴 자동 생성
public class Records {

    @Id // Primary Key
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment 전략
    @Column(name = "no") // 컬럼 이름 지정
    private Long no; // 운동 기록 번호 (Primary Key)

    @JsonProperty("id")
    @Column(name = "id", unique = true, updatable = false, nullable = false) // 유니크 키 제약조건
    @Builder.Default // Builder 패턴에서 기본값 지정
    private String uuid = UUID.randomUUID().toString(); // 고유 식별자 (UUID)

    @Column(name = "user_no") // 사용자 번호
    private Long userNo; // 사용자 번호 (FK)

    @Column(name = "running_name", nullable = false, length = 100) // 필수 입력, 최대 100자
    private String runningName; // 러닝 이름

    @Column(name = "distance_km") // 선택 입력
    private Double distanceKm; // 거리 (km)

    @Column(name = "duration_sec") // 선택 입력
    private Integer durationSec; // 운동 시간 (초)

    @Column(name = "pace_min_per_km") // 선택 입력
    private Integer paceMinPerKm; // 평균페이스 (분/km)

    @Column(name = "speed_kmh") // 선택 입력
    private Double speedKmh; // 속도 (km/h)

    @Column(name = "cadence") // 선택 입력
    private Integer cadence; // 케이던스 (보/분)

    @Column(name = "calories") // 선택 입력
    private Integer calories; // 칼로리 (kcal)

    @Column(name = "note", length = 500) // 선택 입력, 최대 500자
    private String note; // 운동 메모

    @CreationTimestamp // 생성 시간 자동 설정
    @Column(name = "created_at", nullable = false, updatable = false) // 수정 불가
    private LocalDateTime createdAt; // 생성 일시

    @UpdateTimestamp // 수정 시간 자동 설정
    @Column(name = "updated_at", nullable = false) // 필수 컬럼
    private LocalDateTime updatedAt; // 수정 일시

    // 사용자 입력용 러닝 날짜
    @Column(name = "record_date", nullable = false)
    private LocalDateTime recordDate;
}
