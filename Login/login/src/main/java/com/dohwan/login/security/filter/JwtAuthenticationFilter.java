package com.dohwan.login.security.filter;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

import com.dohwan.login.common.ApiResponse;
import com.dohwan.login.dto.AuthenticationRequest;
import com.dohwan.login.dto.CustomUser;
import com.dohwan.login.dto.Users;
import com.dohwan.login.security.constants.SecurityConstants;
import com.dohwan.login.security.provider.JwtProvider;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

/**
 * 🔐 JWT 인증 필터
 */
@Slf4j
public class JwtAuthenticationFilter extends UsernamePasswordAuthenticationFilter {

  private final JwtProvider jwtProvider;

  public JwtAuthenticationFilter(AuthenticationManager authenticationManager, JwtProvider jwtProvider) {
    // 부모 클래스(UsernamePasswordAuthenticationFilter)의 AuthenticationManager 설정
    super.setAuthenticationManager(authenticationManager);
    this.jwtProvider = jwtProvider;
    
    // 필터 URL 경로 설정 : /login (POST 전용)
    setRequiresAuthenticationRequestMatcher(new AntPathRequestMatcher(SecurityConstants.LOGIN_URL, "POST"));
  }

  /**
   * 🔐 인증 시도 메소드
   * : /login 경로로 (username, password) 요청하면 이 필터에서 로그인 인증을 시도합니다.
   */
  @Override
  public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response)
      throws AuthenticationException {

    log.info("::::: JwtAuthenticationFilter.attemptAuthentication 시작 :::::");
    log.info("Request URI: {}", request.getRequestURI());
    log.info("Request Method: {}", request.getMethod());

    // CORS 관련 로그
    String origin = request.getHeader("Origin");
    if (origin != null) log.info("CORS Origin: {}", origin);

    try {
      // 요청 JSON 파싱
      ObjectMapper mapper = new ObjectMapper();
      AuthenticationRequest authReq = mapper.readValue(request.getInputStream(), AuthenticationRequest.class);

      String username = authReq.getUsername();
      String password = authReq.getPassword();

      log.info("로그인 시도 아이디 : " + username);

      // 인증토큰 객체 생성
      UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(username, password);

      // 인증 시도 (부모 클래스의 AuthenticationManager 사용)
      AuthenticationManager manager = getAuthenticationManager();
      if (manager == null) {
          log.error("::::: AuthenticationManager가 NULL입니다! :::::");
          throw new RuntimeException("AuthenticationManager is not properly initialized.");
      }
      return manager.authenticate(authToken);

    } catch (IOException e) {
      log.error("Login request parsing failed", e);
      throw new RuntimeException(e);
    }
  }

  /**
   * ✅ 인증 성공 메소드
   * : 로그인 인증에 성공하면 JWT 토큰을 생성하여 응답 헤더에 담습니다.
   */
  @Override
  protected void successfulAuthentication(
      HttpServletRequest request, HttpServletResponse response, FilterChain chain,
      Authentication authentication) throws IOException, ServletException {

    log.info("::::: JwtAuthenticationFilter.successfulAuthentication - 인증 성공! :::::");
    CustomUser customUser = (CustomUser) authentication.getPrincipal();

    Users user = customUser.getUser();
    String id = user.getId();
    String username = user.getUsername();
    Long no = user.getNo();
    List<String> roles = customUser.getAuthorities()
        .stream()
        .map(GrantedAuthority::getAuthority)
        .collect(Collectors.toList());
        
    // 💍 JWT 생성
    String jwt = jwtProvider.createToken(id, username, roles, no);

    // Authorization 응답 헤더 세팅
    response.addHeader("Authorization", SecurityConstants.TOKEN_PREFIX + jwt);
    response.setStatus(200);

    // 👩‍💼 사용자 정보 body 세팅 (ApiResponse 포맷)
    ApiResponse<Users> apiResponse = ApiResponse.success(user);
    ObjectMapper objectMapper = new ObjectMapper();
    String jsonString = objectMapper.writeValueAsString(apiResponse);
    
    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");
    PrintWriter printWriter = response.getWriter();
    printWriter.write(jsonString);
    printWriter.flush();
    
    log.info("::::: JWT 발급 완료 및 응답 전송 :::::");
  }

  @Override
  protected void unsuccessfulAuthentication(HttpServletRequest request, HttpServletResponse response,
      AuthenticationException failed) throws IOException, ServletException {
      log.warn("::::: JwtAuthenticationFilter.unsuccessfulAuthentication - 인증 실패 : {} :::::", failed.getMessage());
      super.unsuccessfulAuthentication(request, response, failed);
  }

}
