package com.dohwan.login.repository;

import com.dohwan.login.entity.Marathon; // 마라톤 엔티티
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MarathonRepository extends JpaRepository<Marathon, Long> {

    // 개최일 순으로 전체 목록을 가져오는 메서드 (쿼리 메서드 방식)
    List<Marathon> findAllByOrderByRaceDateDesc();

    // 특정 지역(location)을 포함하는 마라톤만 검색하고 싶을 때
    List<Marathon> findByLocationContaining(String location);
}
