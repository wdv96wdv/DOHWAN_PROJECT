package com.dohwan.login.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardDto {
    private String username;
    private String avatarUrl;
    private Double totalDistance;
    private Long runCount;
}
