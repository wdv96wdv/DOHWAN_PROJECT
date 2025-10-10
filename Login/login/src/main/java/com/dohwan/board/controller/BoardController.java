
package com.dohwan.board.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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

import com.dohwan.board.domain.Boards;
import com.dohwan.board.domain.Files;
import com.dohwan.board.domain.Pagination;
import com.dohwan.board.service.BoardService;
import com.dohwan.board.service.FileService;
import com.github.pagehelper.PageInfo;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;     

@Slf4j
@CrossOrigin("*")
@Tag(name="게시판", description="두환이 게시판입니다.") // 태그 설정
@RestController 
@RequestMapping("/boards")


public class BoardController {

    @Autowired
    private BoardService boardService;
    @Autowired
    private FileService fileService;

    // 전체 목록 조회
    @GetMapping
    public ResponseEntity<?> findAll(
        @RequestParam(value = "page", required = false, defaultValue = "1") int page,
        @RequestParam(value = "size", required = false, defaultValue = "10") int size
        ){
        try {
            PageInfo<Boards> pageInfo = boardService.page(page, size);
            Pagination pagination = new Pagination();
            pagination.setPage(page);
            pagination.setSize(size);
            pagination.setTotal(pageInfo.getTotal());
            Map<String, Object> response = new HashMap<>();
            response.put("list", pageInfo.getList());
            response.put("pagination", pagination);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
        e.printStackTrace(); // 추가
        log.error("findAll error", e); // 추가
        return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

    // 단건 조회 (PK)
    @GetMapping("/{id}")
    public ResponseEntity<?> find(@PathVariable("id") String id) {
        try {
            Boards board = boardService.selectById(id);
            Map<String, Object> response = new HashMap<>();
            // 게시글
            response.put("board", board);
            // 파일 목록
            Files file = new Files();
            file.setPTable("boards");
            file.setPNo(board.getNo());
            List<Files> fileList = fileService.listByParent(file);
            response.put("fileList", fileList);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @RequsetBody 붙일 떄 안 붙일 때 차이
     * - @ RequestBody ⭕ : application/jason, application/x-www-form-urlencoded
     * - @ RequestBody ❌ : multipart/form-data, application/x-www-form-urlencoded
     */
    // 등록
    @PostMapping(value = "", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createFormData(Boards dto) {
        try {
            boolean result = boardService.insert(dto);
            if(result){
                return new ResponseEntity<>("SUCCESS", HttpStatus.CREATED);
            }else{
                return new ResponseEntity<>("FAIL",HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping(value = "", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> createJSON(@RequestBody Boards dto) {
        try {
            boolean result = boardService.insert(dto);
            if(result){
                return new ResponseEntity<>("SUCCESS", HttpStatus.CREATED);
            }else{
                return new ResponseEntity<>("FAIL",HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
// 수정
@PutMapping(value = "", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<?> updateForm(Boards dto) {
    try {
        boolean result = boardService.updateById(dto);
        if(result){
            return new ResponseEntity<>("SUCCESS", HttpStatus.CREATED);
        }else{
            return new ResponseEntity<>("FAIL",HttpStatus.BAD_REQUEST);
        }
    } catch (Exception e) {
        return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

@PutMapping(value = "", consumes = MediaType.APPLICATION_JSON_VALUE)
public ResponseEntity<?> updateJSON(@RequestBody Boards dto) {
    try {
        boolean result = boardService.updateById(dto);
        if(result){
            return new ResponseEntity<>("SUCCESS", HttpStatus.CREATED);
        }else{
            return new ResponseEntity<>("FAIL",HttpStatus.BAD_REQUEST);
        }
    } catch (Exception e) {
        return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

    // 삭제 (PK)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable("id") String id) {
        try {
            boolean result = boardService.deleteById(id);
            if(result){
                return new ResponseEntity<>("SUCCESS", HttpStatus.CREATED);
            }else{
                return new ResponseEntity<>("FAIL",HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}