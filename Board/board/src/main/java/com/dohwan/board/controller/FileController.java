package com.dohwan.board.controller;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dohwan.board.domain.Files;
import com.dohwan.board.service.FileService;

import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/files")
public class FileController {

    @Autowired private FileService fileService;

    @Autowired ResourceLoader resourceLoader;   // resources 자원 가져오는 객체
    
    // sp-crud
    
    @GetMapping()
    public ResponseEntity<?> getAll() {
        try {
            List<Files> list = fileService.list();
            return new ResponseEntity<>(list, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable("id") String id) {
        try {
            Files file = fileService.selectById(id);
            return new ResponseEntity<>(file, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping(value = "", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createForm(Files files) {
        try {
            boolean result = fileService.upload(files);
            if(result)
                return new ResponseEntity<>(files, HttpStatus.OK);
            else
                return new ResponseEntity<>("FAILE", HttpStatus.BAD_REQUEST); 
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping(value = "", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> createJSON(@RequestBody Files files) {
        try {
            boolean result = fileService.upload(files);
            if(result)
                return new ResponseEntity<>(files, HttpStatus.OK);
            else
                return new ResponseEntity<>("FAILE", HttpStatus.BAD_REQUEST); 
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @PutMapping()
    public ResponseEntity<?> update(@RequestBody Files file) {
        try {
            boolean result = fileService.update(file);
            if(result)
                return new ResponseEntity<>(file, HttpStatus.OK);
            else
                return new ResponseEntity<>("FAILE", HttpStatus.BAD_REQUEST); 
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> destroy(@PathVariable("id") String id) {
        try {
           boolean result = fileService.deleteById(id);
            if(result)
                return new ResponseEntity<>("SUCCESS", HttpStatus.OK);
            else
                return new ResponseEntity<>("FAILE", HttpStatus.BAD_REQUEST); 
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // 파일 선택 삭제
    @DeleteMapping("")
    public ResponseEntity<?> deleteFiles(
        @RequestParam(value = "noList", required = false) List<Long> noList,
        @RequestParam(value = "idList", required = false) List<String> idList
    ){
        log.info("noList[] : " + noList);
        log.info("idList : " + idList);
        int result = 0;
        if( noList != null){
            result = fileService.deleteFileList(noList);
        }
        if( idList != null){
            result = fileService.deleteFileListById(idList);
        }
        if (result > 0)
            return new ResponseEntity<>(HttpStatus.OK);

            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    }

    // 파일 다운로드
    @GetMapping("/download/{id}")
    public void fileDownload(
        @PathVariable("id") String id,
        HttpServletResponse response
    ) throws Exception{
        fileService.download(id, response);
    }

    @GetMapping("/img/{id}")
public void thumbnailImg(@PathVariable("id") String id,
                         HttpServletResponse response) throws IOException {
    Files file = fileService.selectById(id);
    String filePath = (file != null) ? file.getFilePath() : null;

    File imgFile;
    Resource resource = resourceLoader.getResource("classpath:static/img/no-image.png");

    // 파일이 없거나 경로가 잘못된 경우 → no-image
    if (filePath == null || !(imgFile = new File(filePath)).exists()) {
        imgFile = resource.getFile();
        filePath = imgFile.getPath();
    }

    // 확장자 기반 MIME 결정
    String ext = filePath.substring(filePath.lastIndexOf(".") + 1);
    String mimeType = "image/" + ext; // "imgae" 오타 수정

    try {
        MediaType mType = MediaType.valueOf(mimeType);
        response.setContentType(mType.toString());
    } catch (Exception e) {
        // 잘못된 MIME → no-image 강제 적용
        imgFile = resource.getFile();
        response.setContentType(MediaType.IMAGE_PNG_VALUE);
    }

    // 파일 복사 (try-with-resources로 자동 닫기)
    try (FileInputStream fis = new FileInputStream(imgFile);
         ServletOutputStream sos = response.getOutputStream()) {
        FileCopyUtils.copy(fis, sos);
    }
}


    // 파일 타입별 조회
    @GetMapping("/{pTable}/{pNo}")
    public ResponseEntity<?> getAllFile(
        @PathVariable("pTable") String pTable,
        @PathVariable("pNo") Long pNo,
        @RequestParam(value ="type", required = false) String type
        ){
        try{
            Files file = new Files();
            file.setPTable(pTable);
            file.setPNo(pNo);
            file.setType(type);
            // type이 없을때 ➡️ 부모기준 모든 파일
            if( type == null){
                List<Files> list = fileService.listByParent(file);
                return new ResponseEntity<>(list, HttpStatus.OK);
            }
            // type : "MAIN" ➡️ 메인 파일 1개
            if( type.equals("MAIN")){
                Files mainFile = fileService.selectByType(file);
                return new ResponseEntity<>(mainFile, HttpStatus.OK);
            }
            // type: "SUB" , "?" ➡️ 타입별 파일 목록
            else{
                List<Files> list = fileService.listByType(file);
                return new ResponseEntity<>(list,HttpStatus.OK);
            }
        }catch(Exception e){
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

}
