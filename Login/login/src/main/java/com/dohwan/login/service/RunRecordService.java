package com.dohwan.login.service;

import com.dohwan.login.dto.RunRecordDto;
import com.dohwan.login.entity.RunRecord;
import com.dohwan.login.repository.RunRecordRepository;
import org.springframework.stereotype.Service;

@Service
public class RunRecordService {

    private final RunRecordRepository repository;

    public RunRecordService(RunRecordRepository repository) {
        this.repository = repository;
    }

    public RunRecord saveRunRecord(RunRecordDto dto) {
        double pace = (double) dto.getDurationSec() / 60 / dto.getDistanceKm();
        double speed = dto.getDistanceKm() / ((double) dto.getDurationSec() / 3600);
        int calories = (int) (dto.getWeightKg() * dto.getDistanceKm() * 1.036); // 간단한 추정식

        RunRecord record = new RunRecord();
        record.setDate(dto.getDate());
        record.setDistanceKm(dto.getDistanceKm());
        record.setDurationSec(dto.getDurationSec());
        record.setWeightKg(dto.getWeightKg());
        record.setPaceMinPerKm(pace);
        record.setSpeedKmh(speed);
        record.setCalories(calories);

        return repository.save(record);
    }
}
