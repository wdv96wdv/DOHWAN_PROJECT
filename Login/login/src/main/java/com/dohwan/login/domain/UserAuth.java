package com.dohwan.login.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// 회원 권한

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserAuth {
    private Long no;
    private String username;
    private String auth;
}