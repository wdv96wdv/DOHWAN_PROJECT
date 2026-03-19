package com.dohwan.login.dto;

import lombok.Data;

@Data
public class SocialLoginRequest {
    private String username;
    private String name;
    private String email;
    private String avatar_url;
}
