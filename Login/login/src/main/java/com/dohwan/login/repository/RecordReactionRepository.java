package com.dohwan.login.repository;

import com.dohwan.login.entity.RecordReaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RecordReactionRepository extends JpaRepository<RecordReaction, Long> {
    Optional<RecordReaction> findByRecordNoAndUserNo(Long recordNo, Long userNo);
    long countByRecordNo(Long recordNo);
    boolean existsByRecordNoAndUserNo(Long recordNo, Long userNo);
}
