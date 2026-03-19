package com.dohwan.login.dto;

import java.util.Date;
import java.util.List;
import java.util.UUID;

import lombok.Data;


@Data
public class Users {
    private Long no;
    private String id;
    private String username;
    private String password;
    private String name;
    private String email;
    private Date createdAt;
    private Date updatedAt;
    private Boolean enabled;
    private String bio;
    private String avatarUrl;
    private String provider; // "traditional", "google" 등 로그인 제공자

    private List<UserAuth> authList;

    public Users() {
        this.id = UUID.randomUUID().toString();
    }

}
