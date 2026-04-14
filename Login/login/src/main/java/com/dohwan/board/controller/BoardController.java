package com.dohwan.board.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dohwan.board.dto.Boards;
import com.dohwan.board.dto.Files;
import com.dohwan.board.dto.Pagination;
import com.dohwan.board.service.BoardService;
import com.dohwan.board.service.FileService;
import com.dohwan.login.common.ApiResponse;
import com.dohwan.login.dto.CustomUser;

import org.springframework.data.domain.Page;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@CrossOrigin("*")
@Tag(name="게시판", description="두환이 게시판입니다.")
@RestController 
@RequestMapping("/boards")
public class BoardController {

    @Autowired
    private BoardService boardService;
    @Autowired
    private FileService fileService;

    // 전체 목록 조회
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> findAll(
        @RequestParam(value = "page", required = false, defaultValue = "1") int page,
        @RequestParam(value = "size", required = false, defaultValue = "10") int size,
        @RequestParam(value = "type", required = false, defaultValue = "전체") String type,
        @RequestParam(value = "keyword", required = false, defaultValue = "") String keyword
        ){
        try {
            Page<Boards> pageInfo = boardService.page(page, size, type, keyword);
            Pagination pagination = new Pagination();
            pagination.setPage(page);
            pagination.setSize(size);
            pagination.setTotal(pageInfo.getTotalElements());
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("list", pageInfo.getContent());
            responseData.put("pagination", pagination);
            return ResponseEntity.ok(ApiResponse.success(responseData));
        } catch (Exception e) {
            log.error("findAll error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "서버 에러가 발생했습니다."));
        }
    }

    // 단건 조회 (PK)
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> find(@PathVariable("id") String id) {
        try {
            Boards board = boardService.selectById(id);
            if (board == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error(404, "게시글을 찾을 수 없습니다."));
            }
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("board", board);
            
            Files file = new Files();
            file.setPTable("boards");
            file.setPNo(board.getNo());
            List<Files> fileList = fileService.listByParent(file);
            responseData.put("fileList", fileList);
            
            return ResponseEntity.ok(ApiResponse.success(responseData));
        } catch (Exception e) {
            log.error("find error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "서버 에러가 발생했습니다."));
        }
    }

    // 등록 (FormData)
    @PostMapping(value = "", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<String>> createFormData(
            @AuthenticationPrincipal CustomUser user,
            Boards dto) {
        try {
            if (user != null) {
                dto.setUserNo(user.getUserNo());
                dto.setWriter(user.getNickname());
            }
            boolean result = boardService.insert(dto);
            if(result){
                return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("SUCCESS"));
            }else{
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(400, "FAIL"));
            }
        } catch (Exception e) {
            log.error("create error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "서버 에러가 발생했습니다."));
        }
    }

    // 등록 (JSON)
    @PostMapping(value = "", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<String>> createJSON(
            @AuthenticationPrincipal CustomUser user,
            @RequestBody Boards dto) {
        try {
            if (user != null) {
                dto.setUserNo(user.getUserNo());
                dto.setWriter(user.getNickname());
            }
            boolean result = boardService.insert(dto);
            if(result){
                return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("SUCCESS"));
            }else{
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(400, "FAIL"));
            }
        } catch (Exception e) {
            log.error("create error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "서버 에러가 발생했습니다."));
        }
    }

    // 수정
    @PutMapping(value = "", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<String>> updateJSON(
            @AuthenticationPrincipal CustomUser user,
            @RequestBody Boards dto) {
        try {
            Boards origin = boardService.selectById(dto.getId());
            if (origin != null && user != null && !origin.getUserNo().equals(user.getUserNo())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error(403, "권한이 없습니다."));
            }
            
            boolean result = boardService.updateById(dto);
            if(result){
                return ResponseEntity.ok(ApiResponse.success("SUCCESS"));
            }else{
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(400, "FAIL"));
            }
        } catch (Exception e) {
            log.error("update error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "서버 에러가 발생했습니다."));
        }
    }

    // 삭제 (PK)
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> delete(
            @AuthenticationPrincipal CustomUser user,
            @PathVariable("id") String id) {
        try {
            Boards origin = boardService.selectById(id);
            if (origin != null && user != null && !origin.getUserNo().equals(user.getUserNo())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error(403, "권한이 없습니다."));
            }

            boolean result = boardService.deleteById(id);
            if(result){
                return ResponseEntity.ok(ApiResponse.success("SUCCESS"));
            }else{
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(400, "FAIL"));
            }
        } catch (Exception e) {
            log.error("delete error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "서버 에러가 발생했습니다."));
        }
    }
}
