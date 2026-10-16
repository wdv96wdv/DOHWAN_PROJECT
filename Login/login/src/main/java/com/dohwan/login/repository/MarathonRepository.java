package com.dohwan.login.repository;

import com.dohwan.login.entity.Marathon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MarathonRepository extends JpaRepository<Marathon, Long> {

    List<Marathon> findAllByOrderByRaceDateAsc();

    List<Marathon> findAllByOrderByRaceDateDesc();

    List<Marathon> findByRaceDateGreaterThanEqualOrderByRaceDateAsc(LocalDate fromDate);

    Optional<Marathon> findByTitleAndRaceDate(String title, LocalDate raceDate);

    List<Marathon> findByLocationContaining(String location);
}
