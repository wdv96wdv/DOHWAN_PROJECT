package com.dohwan.board.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "comments", indexes = {
    @Index(name = "idx_comment_board_id_created_at", columnList = "board_id, createdAt")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "no")
    private Long no;
    
    @Column(name = "id", unique = true, updatable = false, nullable = false)
    @Builder.Default
    private String id = UUID.randomUUID().toString();
    
    @Column(name = "board_id", nullable = false)
    private String boardId; // 게시글 ID (FK)
    
    @Column(name = "user_no", nullable = false)
    private Long userNo; // 사용자 번호 (FK)
    
    @Column(name = "writer", nullable = false, length = 50)
    private String writer; // 작성자명
    
    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content; // 댓글 내용
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}

