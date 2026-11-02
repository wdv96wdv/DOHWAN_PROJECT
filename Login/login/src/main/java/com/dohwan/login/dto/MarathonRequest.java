package com.dohwan.login.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

/**
 * 관리자 마라톤 등록/수정 요청 DTO.
 * 엔티티를 직접 받지 않고 허용할 필드만 받는다 (id, created_at, source_type 등 조작 방지).
 */
@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class MarathonRequest {

    private String title;

    private String location;

    /** 종목: Full, Half, 10Km, 5Km 중 선택 */
    private List<String> type;

    /** 접수/공식 홈페이지 링크 (https) */
    private String link;

    /** 대회일 (yyyy-MM-dd) */
    @JsonProperty("race_date")
    private String raceDate;

    /** 접수 시작일 (yyyy-MM-dd, 선택) */
    @JsonProperty("start_date")
    private String startDate;

    /** 접수 마감일 (yyyy-MM-dd, 선택) */
    @JsonProperty("end_date")
    private String endDate;

    @JsonProperty("is_first_come")
    private boolean firstCome;

    /** 직접 업로드한 포스터 URL (선택) */
    @JsonProperty("poster_url")
    private String posterUrl;
}
