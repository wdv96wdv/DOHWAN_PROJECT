package com.dohwan.board.domain;

import java.util.Date;
import java.util.UUID;

import org.springframework.web.multipart.MultipartFile;

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
    private Long fileSize; // 변수명 소문자로 수정
    private Long seq; // 순서
    private FileType type; // enum으로 변경
    private Date createdAt;
    private Date updatedAt;

    // 파일 데이터
    // private MultipartFile data;

    // 기존 MultipartFile을 String으로 수정
    private String data; // 파일 URL을 저장할 필드로 수정

    public Files() {
        this.id = UUID.randomUUID().toString();
    }

    // setData 메서드 수정: MultipartFile을 String URL로 변경
    public void setData(String fileUrl) {
        this.data = fileUrl;  // 파일 URL을 저장
    }
}
