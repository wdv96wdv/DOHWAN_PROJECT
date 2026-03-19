package com.dohwan.login.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RunRecordDto {
    private String date;         // yyyy-MM-dd 형식
    private double distanceKm;   // km 단위
    private int durationSec;     // 초 단위
    private double weightKg;     // kg 단위
}
