package com.dohwan.login.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty; // 추가
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "marathons")
@Getter
@Setter
@NoArgsConstructor
public class Marathon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String location;

    private String link;

    // Marathon.java
    @JsonProperty("race_date")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd") // 추가
    @Column(name = "race_date")
    private LocalDate raceDate;

    @JsonProperty("start_date")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd") // 추가
    @Column(name = "start_date")
    private LocalDate startDate;

    @JsonProperty("end_date")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd") // 추가
    @Column(name = "end_date")
    private LocalDate endDate;

    @JsonProperty("is_first_come")
    @Column(name = "is_first_come")
    private boolean firstComeFirstServed;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "type", columnDefinition = "text[]")
    private List<String> type;
}