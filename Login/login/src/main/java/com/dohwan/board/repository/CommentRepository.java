package com.dohwan.board.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.dohwan.board.entity.Comment;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    
    // 게시글 ID로 댓글 목록 조회 (생성일 오름차순)
    List<Comment> findByBoardIdOrderByCreatedAtAsc(String boardId);
    
    // 게시글 ID로 댓글 목록 조회 (생성일 내림차순)
    List<Comment> findByBoardIdOrderByCreatedAtDesc(String boardId);
    
    // 게시글 ID로 댓글 개수 조회
    long countByBoardId(String boardId);
    
    // ID로 댓글 조회
    @Query("SELECT c FROM Comment c WHERE c.id = :id")
    Optional<Comment> findByIdentifier(@Param("id") String id);
    
    // 게시글 ID로 모든 댓글 삭제
    void deleteByBoardId(String boardId);
}

