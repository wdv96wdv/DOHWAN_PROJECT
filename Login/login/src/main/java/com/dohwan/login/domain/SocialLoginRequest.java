package com.dohwan.login.domain;

import lombok.Data;

@Data
public class SocialLoginRequest {
    private String username;
    private String name;
    private String email;
    private String avatar_url;
}
