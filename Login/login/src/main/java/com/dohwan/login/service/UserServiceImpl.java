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
  public void login(Users user, HttpServletRequest request) throws Exception {
    // 현재 사용하지 않는 기능이라면 빈 구현만 둬도 됨
  }

  @Override
  public boolean insert(Users user) throws Exception {
    String encodedPassword = passwordEncoder.encode(user.getPassword());
    user.setPassword(encodedPassword);
    user.setProvider("traditional"); // 기본값으로 "traditional" 설정

    int result = userMapper.join(user);

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
  public boolean update(Users user) throws Exception {
    String encodedPassword = passwordEncoder.encode(user.getPassword());
    user.setPassword(encodedPassword);
    return userMapper.update(user) > 0;
  }

  /**
   * ✅ 회원 정보 + 비밀번호 변경까지 처리하는 최종 버전
   */
  @Override
  public boolean updateUser(UserUpdateRequest request) throws Exception {

    Users existingUser = userMapper.findByUsername(request.getUsername());
    if (existingUser == null) {
      throw new IllegalArgumentException("사용자를 찾을 수 없습니다.");
    }

        boolean passwordChanged = false;
    
        // ✅ 비밀번호 변경 요청 처리 (traditional 로그인 사용자만 해당)
        // 소셜 로그인 사용자는 비밀번호가 없으므로 이 로직을 건너뛴다.
        if (existingUser.getProvider() != null && existingUser.getProvider().equals("traditional")) {
          if (request.getNewPassword() != null && !request.getNewPassword().isEmpty()) {
    
            if (request.getCurrentPassword() == null ||
                !passwordEncoder.matches(request.getCurrentPassword(), existingUser.getPassword())) {
              throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
            }
    
            if (!request.getNewPassword().equals(request.getConfirmPassword())) {
              throw new IllegalArgumentException("새 비밀번호가 일치하지 않습니다.");
            }
    
            String encoded = passwordEncoder.encode(request.getNewPassword());
            existingUser.setPassword(encoded);
            passwordChanged = true;
    
          } else {
            // ✅ 비밀번호 변경 없음 → 기존 값 그대로 유지
          }
        } else {
          // 소셜 로그인 사용자: 비밀번호 변경 요청이 있어도 무시
          log.info("소셜 로그인 사용자이므로 비밀번호 변경 요청을 무시합니다.");
        }
    // ✅ 일반 정보 업데이트
    existingUser.setName(request.getName());
    existingUser.setEmail(request.getEmail());

    userMapper.update(existingUser);

    return passwordChanged;
  }

  @Override
  public boolean delete(String username) throws Exception {
    UserAuth userAuth = UserAuth.builder().username(username).build();
    userMapper.deleteAuth(userAuth);

    int userResult = userMapper.delete(username);
    return userResult > 0;
  }

  @Override
  public boolean updateWithPassword(UserUpdateRequest request) throws Exception {
    return updateUser(request);
  }

  @Override
  public Users findByUsername(String username) throws Exception {
    return userMapper.findByUsername(username);
  }
}
