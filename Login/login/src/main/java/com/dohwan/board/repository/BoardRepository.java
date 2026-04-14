package com.dohwan.board.repository;

import com.dohwan.board.entity.BoardEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BoardRepository extends JpaRepository<BoardEntity, Long> {
    @Query("SELECT b FROM BoardEntity b WHERE b.id = :id")
    Optional<BoardEntity> findByIdentifier(@Param("id") String id);

    @Modifying
    @Query("DELETE FROM BoardEntity b WHERE b.id = :id")
    void deleteByIdentifier(@Param("id") String id);

    Page<BoardEntity> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT b FROM BoardEntity b WHERE " +
           "(:type = '전체' OR b.type = :type) AND " +
           "(LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(b.content) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(b.writer) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<BoardEntity> search(@Param("type") String type, @Param("keyword") String keyword, Pageable pageable);
}
