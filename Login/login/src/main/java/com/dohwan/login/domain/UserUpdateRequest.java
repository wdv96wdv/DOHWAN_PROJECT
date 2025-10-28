package com.dohwan.login.domain;

import lombok.Data;

@Data
public class UserUpdateRequest {
  private String username;
  private String name;
  private String email;
  private String bio;
  private String avatarUrl;

  private String currentPassword;
  private String newPassword;
  private String confirmPassword;
}