package com.dohwan.board.domain;

import java.util.Date;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import lombok.Data;

@Data
public class Boards {
    private Long no; // PK
    private String id; // UK
    private String title; // 제목
    private String writer; // 작성자
    private String content; // 내용
    private Date createdAt; // 등록일자
    private Date updatedAt; // 수정일자
    private Long userNo; //user(FK)
    private int commentCount; // 댓글 개수

    // 🗒️ 파일
    // private MultipartFile mainFile;
    // private List<MultipartFile> files;
    private FileInfo mainFile; // 파일 정보 객체
    private List<FileInfo> files; // 파일 정보 객체 리스트

    @Data
    public static class FileInfo {
        private String url;
        private String name;
        private String originName;
        private Long size;
    }

    // 파일
    private Files File;

    public Boards() {
        this.id = java.util.UUID.randomUUID().toString();
    }
    // MyBatis가 찾을 수 있는 getter
    public Long getUserNo() {
        return userNo;
    }

    public void setUserNo(Long userNo) {
        this.userNo = userNo;
    }

}
