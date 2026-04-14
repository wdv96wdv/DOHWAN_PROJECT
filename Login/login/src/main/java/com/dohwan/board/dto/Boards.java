package com.dohwan.board.dto;

import java.util.Date;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class Boards {
    private Long no; // PK
    private String id; // UK
    private String title; // 제목
    private String writer; // 작성자
    private String content; // 내용
    private String type; // 카테고리
    private Date createdAt; // 등록일자
    private Date updatedAt; // 수정일자
    private Long userNo; //user(FK)
    private int commentCount; // 댓글 개수

    // 🗒️ 파일
    private FileInfo mainFile; // 파일 정보 객체
    private List<FileInfo> files; // 파일 정보 객체 리스트

    private List<String> deleteFiles; // 삭제할 파일 ID 목록

    // 파일
    @JsonProperty("file") // JSON 직렬화 시 lowercase 'file'로 보장
    private Files file;

    @Data
    public static class FileInfo {
        private String url;
        private String name;
        private String originName;
        private Long size;
    }

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
