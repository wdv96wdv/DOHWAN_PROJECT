package com.dohwan.board.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
import com.dohwan.login.common.ApiResponse;
import com.dohwan.login.dto.CustomUser;

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
    public ResponseEntity<ApiResponse<List<Comment>>> getComments(@PathVariable("boardId") String boardId) {
        try {
            List<Comment> comments = commentRepository.findByBoardIdOrderByCreatedAtAsc(boardId);
            return ResponseEntity.ok(ApiResponse.success(comments));
        } catch (Exception e) {
            log.error("댓글 목록 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "서버 에러가 발생했습니다."));
        }
    }

    // 댓글 작성
    @PostMapping
    public ResponseEntity<ApiResponse<Comment>> createComment(
            @AuthenticationPrincipal CustomUser user,
            @PathVariable("boardId") String boardId,
            @RequestBody Map<String, Object> request) {
        try {
            Comment comment = Comment.builder()
                    .boardId(boardId)
                    .userNo(user.getUserNo())
                    .writer(user.getUser().getName())
                    .content(request.get("content").toString())
                    .build();

            Comment savedComment = commentRepository.save(comment);
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(savedComment));
        } catch (Exception e) {
            log.error("댓글 작성 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "서버 에러가 발생했습니다."));
        }
    }

    // 댓글 수정
    @PutMapping("/{commentId}")
    public ResponseEntity<ApiResponse<Comment>> updateComment(
            @AuthenticationPrincipal CustomUser user,
            @PathVariable("boardId") String boardId,
            @PathVariable("commentId") String commentId,
            @RequestBody Map<String, Object> request) {
        try {
            Comment comment = commentRepository.findByIdentifier(commentId)
                    .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다."));

            // 작성자 확인
            if (!comment.getUserNo().equals(user.getUserNo())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error(403, "권한이 없습니다."));
            }

            comment.setContent(request.get("content").toString());
            Comment updatedComment = commentRepository.save(comment);
            return ResponseEntity.ok(ApiResponse.success(updatedComment));
        } catch (Exception e) {
            log.error("댓글 수정 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "서버 에러가 발생했습니다."));
        }
    }

    // 댓글 삭제
    @DeleteMapping("/{commentId}")
    public ResponseEntity<ApiResponse<String>> deleteComment(
            @AuthenticationPrincipal CustomUser user,
            @PathVariable("boardId") String boardId,
            @PathVariable("commentId") String commentId) {
        try {
            Comment comment = commentRepository.findByIdentifier(commentId)
                    .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다."));

            // 작성자 확인
            if (!comment.getUserNo().equals(user.getUserNo())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error(403, "권한이 없습니다."));
            }

            commentRepository.delete(comment);
            return ResponseEntity.ok(ApiResponse.success("댓글이 삭제되었습니다."));
        } catch (Exception e) {
            log.error("댓글 삭제 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "서버 에러가 발생했습니다."));
        }
    }
}
