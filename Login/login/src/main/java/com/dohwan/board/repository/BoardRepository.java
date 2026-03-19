package com.dohwan.board.repository;

import com.dohwan.board.entity.BoardEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BoardRepository extends JpaRepository<BoardEntity, Long> {
    Optional<BoardEntity> findByIdentifier(String id);
    void deleteByIdentifier(String id);

    Page<BoardEntity> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
