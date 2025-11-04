package com.dohwan.login.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "run_record")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RunRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String date;
    private double distanceKm;
    private int durationSec;
    private double weightKg;

    // 계산된 값 저장
    private double paceMinPerKm;
    private double speedKmh;
    private int calories;
}