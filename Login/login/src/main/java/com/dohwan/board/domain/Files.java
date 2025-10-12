package com.dohwan.board.domain;

import java.util.Date;
import java.util.UUID;

import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.Data;

@Data
public class Files {

    public enum FileType {
        MAIN,
        SUB
    }

    private Long no;
    private String id;
    private String pTable;
    private Long pNo;
    private String fileName;
    private String originName;
    private String filePath;
    private Long fileSize;   // 변수명 소문자로 수정
    private Long seq;        // 순서
    private FileType type;   // enum으로 변경
    private Date createdAt;
    private Date updatedAt;

    // 파일 데이터
    @JsonIgnore
    private MultipartFile data;

    public Files() {
        this.id = UUID.randomUUID().toString();
    }
}
