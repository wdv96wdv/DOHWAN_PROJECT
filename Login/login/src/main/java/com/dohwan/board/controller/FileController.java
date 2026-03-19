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

import com.dohwan.board.dto.Files;
import com.dohwan.board.service.FileService;
import com.dohwan.login.common.ApiResponse;

import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/files")
public class FileController {

    @Autowired
    private FileService fileService;

    @Autowired
    ResourceLoader resourceLoader;

    @GetMapping()
    public ResponseEntity<ApiResponse<List<Files>>> getAll() {
        try {
            List<Files> list = fileService.list();
            return ResponseEntity.ok(ApiResponse.success(list));
        } catch (Exception e) {
            log.error("getAll error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "서버 에러가 발생했습니다."));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Files>> getOne(@PathVariable("id") String id) {
        try {
            Files file = fileService.selectById(id);
            if (file == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error(404, "파일을 찾을 수 없습니다."));
            }
            return ResponseEntity.ok(ApiResponse.success(file));
        } catch (Exception e) {
            log.error("getOne error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "서버 에러가 발생했습니다."));
        }
    }

    @PostMapping(value = "", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Files>> createForm(Files files) {
        try {
            boolean result = fileService.upload(files);
            if (result) {
                return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(files));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(400, "FAIL"));
            }
        } catch (Exception e) {
            log.error("upload error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "서버 에러가 발생했습니다."));
        }
    }

    @PostMapping(value = "", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<Files>> createJSON(@RequestBody Files files) {
        try {
            boolean result = fileService.upload(files);
            if (result) {
                return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(files));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(400, "FAIL"));
            }
        } catch (Exception e) {
            log.error("upload error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "서버 에러가 발생했습니다."));
        }
    }

    @PutMapping()
    public ResponseEntity<ApiResponse<Files>> update(@RequestBody Files file) {
        try {
            boolean result = fileService.update(file);
            if (result) {
                return ResponseEntity.ok(ApiResponse.success(file));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(400, "FAIL"));
            }
        } catch (Exception e) {
            log.error("update error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "서버 에러가 발생했습니다."));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> destroy(@PathVariable("id") String id) {
        try {
            boolean result = fileService.deleteById(id);
            if (result) {
                return ResponseEntity.ok(ApiResponse.success("SUCCESS"));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(400, "FAIL"));
            }
        } catch (Exception e) {
            log.error("delete error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "서버 에러가 발생했습니다."));
        }
    }

    @DeleteMapping("")
    public ResponseEntity<ApiResponse<String>> deleteFiles(
            @RequestParam(value = "noList", required = false) List<Long> noList,
            @RequestParam(value = "idList", required = false) List<String> idList) {
        try {
            int result = 0;
            if (noList != null) {
                result = fileService.deleteFileList(noList);
            }
            if (idList != null) {
                result = fileService.deleteFileListById(idList);
            }
            if (result > 0) {
                return ResponseEntity.ok(ApiResponse.success("SUCCESS"));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(400, "FAIL"));
        } catch (Exception e) {
            log.error("delete list error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "서버 에러가 발생했습니다."));
        }
    }

    // 파일 다운로드 (바이너리 스트리밍은 ApiResponse를 사용하지 않음)
    @GetMapping("/download/{id}")
    public void fileDownload(
            @PathVariable("id") String id,
            HttpServletResponse response) throws Exception {
        fileService.download(id, response);
    }

    @GetMapping("/img/{id}")
    public void thumbnailImg(@PathVariable("id") String id,
            HttpServletResponse response) throws IOException {
        Files file = fileService.selectById(id);
        String filePath = (file != null) ? file.getFilePath() : null;

        File imgFile;
        Resource resource = resourceLoader.getResource("classpath:static/img/no-image.png");

        if (filePath == null || !(imgFile = new File(filePath)).exists()) {
            imgFile = resource.getFile();
            filePath = imgFile.getPath();
        }

        String ext = filePath.substring(filePath.lastIndexOf(".") + 1);
        String mimeType = "image/" + ext;
        try {
            MediaType mType = MediaType.valueOf(mimeType);
            response.setContentType(mType.toString());
        } catch (Exception e) {
            imgFile = resource.getFile();
            response.setContentType(MediaType.IMAGE_PNG_VALUE);
        }

        try (FileInputStream fis = new FileInputStream(imgFile);
                ServletOutputStream sos = response.getOutputStream()) {
            FileCopyUtils.copy(fis, sos);
        }
    }

    @GetMapping("/{pTable}/{pNo}")
    public ResponseEntity<ApiResponse<?>> getAllFile(
            @PathVariable("pTable") String pTable,
            @PathVariable("pNo") Long pNo,
            @RequestParam(value = "type", required = false) String typeParam) {
        try {
            Files file = new Files();
            file.setPTable(pTable);
            file.setPNo(pNo);

            Files.FileType fileType = null;
            if (typeParam != null) {
                try {
                    fileType = Files.FileType.valueOf(typeParam.toUpperCase());
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(400, "Invalid file type"));
                }
            }
            file.setType(fileType);

            if (fileType == null) {
                List<Files> list = fileService.listByParent(file);
                return ResponseEntity.ok(ApiResponse.success(list));
            }

            if (fileType == Files.FileType.MAIN) {
                Files mainFile = fileService.selectByType(file);
                return ResponseEntity.ok(ApiResponse.success(mainFile));
            } else {
                List<Files> list = fileService.listByType(file);
                return ResponseEntity.ok(ApiResponse.success(list));
            }
        } catch (Exception e) {
            log.error("getAllFile error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "서버 에러가 발생했습니다."));
        }
    }
}
