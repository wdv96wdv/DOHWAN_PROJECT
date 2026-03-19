package com.dohwan.login.dto;

import lombok.Data;
import jakarta.validation.constraints.Size; // 이 줄 추가

@Data
public class UserUpdateRequest {
  private String username;
  private String name;
  private String email;
  @Size(max = 300, message = "자기소개는 300자를 초과할 수 없습니다.")
  private String bio;
  private String avatarUrl;

  private String currentPassword;
  private String newPassword;
  private String confirmPassword;
}
