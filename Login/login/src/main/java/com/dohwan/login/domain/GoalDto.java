package com.dohwan.login.domain;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GoalDto {
    private String title;       // 예: "주간 거리 목표"
    private double targetValue; // 예: 20.0 (km)
    private String unit;        // 예: "km", "min/km"
}