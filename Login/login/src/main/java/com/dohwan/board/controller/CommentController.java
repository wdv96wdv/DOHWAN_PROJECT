package com.dohwan.board.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dohwan.board.entity.Comment;
import com.dohwan.board.repository.CommentRepository;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@CrossOrigin("*")
@RestController
@RequestMapping("/boards/{boardId}/comments")
public class CommentController {

    @Autowired
    private CommentRepository commentRepository;

    // 댓글 목록 조회
    @GetMapping
    public ResponseEntity<List<Comment>> getComments(@PathVariable("boardId") String boardId) {
        try {
            List<Comment> comments = commentRepository.findByBoardIdOrderByCreatedAtAsc(boardId);
            return ResponseEntity.ok(comments);
        } catch (Exception e) {
            log.error("댓글 목록 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 댓글 작성
    @PostMapping
    public ResponseEntity<Comment> createComment(
            @PathVariable("boardId") String boardId,
            @RequestBody Map<String, Object> request) {
        try {
            Comment comment = Comment.builder()
                    .boardId(boardId)
                    .userNo(Long.valueOf(request.get("userNo").toString()))
                    .writer(request.get("writer").toString())                    .content(request.get("content").toString())
                    .build();

            Comment savedComment = commentRepository.save(comment);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedComment);
        } catch (Exception e) {
            log.error("댓글 작성 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 댓글 수정
    @PutMapping("/{commentId}")
    public ResponseEntity<Comment> updateComment(
            @PathVariable("boardId") String boardId,
            @PathVariable("commentId") String commentId,
            @RequestBody Map<String, Object> request) {
        try {
            Comment comment = commentRepository.findById(commentId)
                    .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다."));

            // 작성자 확인
            Long userNo = Long.valueOf(request.get("userNo").toString());
            if (!comment.getUserNo().equals(userNo)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            comment.setContent(request.get("content").toString());
            Comment updatedComment = commentRepository.save(comment);
            return ResponseEntity.ok(updatedComment);
        } catch (Exception e) {
            log.error("댓글 수정 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 댓글 삭제
    @DeleteMapping("/{commentId}")
    public ResponseEntity<?> deleteComment(
            @PathVariable("boardId") String boardId,
            @PathVariable("commentId") String commentId,
            @RequestBody(required = false) Map<String, Object> request) {
        try {
            Comment comment = commentRepository.findById(commentId)
                    .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다."));

            // 작성자 확인 (request가 있을 경우)
            if (request != null && request.containsKey("userNo")) {
                Long userNo = Long.valueOf(request.get("userNo").toString());
                if (!comment.getUserNo().equals(userNo)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                }
            }

            commentRepository.delete(comment);
            return ResponseEntity.ok("댓글이 삭제되었습니다.");
        } catch (Exception e) {
            log.error("댓글 삭제 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

