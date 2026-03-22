package com.dohwan.login.dto;

import lombok.Data;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class MarathonDto {
    private Long id;
    private String title;
    private String location;
    private String raceDate; // yyyy-MM-dd 형식 추천
    private String startDate; // 접수 시작일
    private String endDate; // 접수 마감일
    private List<String> type; // ["Full", "Half"] 형태
    private String link;
    private boolean firstComeFirstServed;
}
