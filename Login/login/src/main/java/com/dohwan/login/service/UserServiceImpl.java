package com.dohwan.login.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.dohwan.login.domain.UserAuth;
import com.dohwan.login.domain.UserUpdateRequest;
import com.dohwan.login.domain.Users;
import com.dohwan.login.mapper.UserMapper;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class UserServiceImpl implements UserService {

  @Autowired
  private UserMapper userMapper;

  @Autowired
  private PasswordEncoder passwordEncoder;

  @Autowired
  private AuthenticationManager authenticationManager;

  @Override
  public boolean insert(Users user) throws Exception {
    // 비밀번호 암호화
    String password = user.getPassword();
    String encodedPassword = passwordEncoder.encode(password);
    user.setPassword(encodedPassword);
    // 회원 등록
    int result = userMapper.join(user);

    // 권한 등록
    if (result > 0) {
      UserAuth userAuth = UserAuth.builder()
          .username(user.getUsername())
          .auth("ROLE_USER")
          .build();
      result += userMapper.insertAuth(userAuth);
    }
    return result > 0;
  }

  @Override
  public Users select(String username) throws Exception {
    return userMapper.select(username);
  }

  @Override
  public void login(Users user, HttpServletRequest request) throws Exception {
    // TODO
  }

  @Override
  public boolean update(Users user) throws Exception {
    // 비밀번호 암호화
    String password = user.getPassword();
    String encodedPassword = passwordEncoder.encode(password);
    user.setPassword(encodedPassword);
    int reuslt = userMapper.update(user);
    return reuslt > 0;
  }

  @Override
  public boolean updateWithPassword(UserUpdateRequest request) throws Exception {
    Users existingUser = userMapper.findByUsername(request.getUsername());
    if (existingUser == null) {
      throw new IllegalArgumentException("사용자를 찾을 수 없습니다.");
    }

    // 비밀번호 변경 로직
    if (request.getNewPassword() != null && !request.getNewPassword().isEmpty()) {
      log.info("🔐 비밀번호 변경 요청: " + request.getNewPassword());

      if (request.getCurrentPassword() == null ||
          !passwordEncoder.matches(request.getCurrentPassword(), existingUser.getPassword())) {
        log.info("❌ 현재 비밀번호 불일치");
        throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
      }

      if (!request.getNewPassword().equals(request.getConfirmPassword())) {
        log.info("❌ 새 비밀번호 불일치");
        throw new IllegalArgumentException("새 비밀번호가 일치하지 않습니다.");
      }

      String encoded = passwordEncoder.encode(request.getNewPassword());
      log.info("🔒 암호화된 비밀번호: " + encoded);
      existingUser.setPassword(encoded);
    } else {
      log.info("⚠️ 비밀번호 변경 없음 → null로 설정");
      existingUser.setPassword(null);
    }

    // 일반 정보 수정
    existingUser.setName(request.getName());
    existingUser.setEmail(request.getEmail());

    // bio, avatarUrl은 profiles 테이블에서 처리됨 (트리거 또는 별도 API)
    log.info("🧾 최종 저장될 비밀번호: " + existingUser.getPassword());
    return userMapper.update(existingUser) > 0;
  }

  @Override
  public Users findByUsername(String username) throws Exception {
    return userMapper.findByUsername(username);
  }

  @Override
  public boolean delete(String username) throws Exception {
    // 1. 권한 삭제
    UserAuth userAuth = UserAuth.builder()
        .username(username)
        .build();
    userMapper.deleteAuth(userAuth);

    // 2. 회원 삭제
    int userResult = userMapper.delete(username);

    return userResult > 0; // 회원 삭제가 성공하면 true
  }

}