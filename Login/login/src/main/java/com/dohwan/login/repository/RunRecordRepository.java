package com.dohwan.login.repository;

import com.dohwan.login.entity.RunRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RunRecordRepository extends JpaRepository<RunRecord, Long> {
}
