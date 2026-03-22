package com.dohwan.login.security.filter;

import java.io.IOException;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import com.dohwan.login.security.constants.SecurityConstants;
import com.dohwan.login.security.provider.JwtProvider;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class JwtRequestFilter extends OncePerRequestFilter {

  private final AuthenticationManager authenticationManager;
  private final JwtProvider jwtProvider;

  public JwtRequestFilter(AuthenticationManager authenticationManager, JwtProvider jwtProvider) {
      this.authenticationManager = authenticationManager;
      this.jwtProvider = jwtProvider;
  }

  /**
   * 요청 필터 작업
   * 1. JWT 추출
   * 2. 인증 시도
   * 3. JWT 검증
   *      ⭕ 토큰이 유효하면, 인증 처리 완료
   *      ❌ 토큰이 만료되면, (-)
   * 4. 다음 필터로 진행
  */
  @Override
  protected void doFilterInternal(HttpServletRequest request, 
                                  HttpServletResponse response, 
                                  FilterChain filterChain)
      throws ServletException, IOException {
    
    log.info("::::: JwtRequestFilter.doFilterInternal 시작 :::::");
    log.info("Request URI: {}", request.getRequestURI());
    log.info("Request Method: {}", request.getMethod());
    
    // CORS 관련 로그 추가
    String origin = request.getHeader("Origin");
    String method = request.getHeader("Access-Control-Request-Method");
    String requestHeaders = request.getHeader("Access-Control-Request-Headers");
    
    if (origin != null) {
        log.info("CORS Origin: {}", origin);
    }
    if (method != null) {
        log.info("CORS Request Method: {}", method);
    }
    if (requestHeaders != null) {
        log.info("CORS Request Headers: {}", requestHeaders);
    }

    // 1. JWT 추출
    String authorization = request.getHeader(SecurityConstants.TOKEN_HEADER); // Authorization
    log.info("Authorization Header: {}", authorization);

    // 💍 "Bearer {jwt}" 체크
    // 헤더가 없거나 올바르지 않으면 다음 필터로 진행
    if (authorization == null || authorization.length() == 0 || !authorization.startsWith(SecurityConstants.TOKEN_PREFIX)) {
        filterChain.doFilter(request, response);
        return;
    }

    // 💍 JWT 
    // : "Bearer {jwt}" ➡ "Bearer " 제거 = JWT
    String jwt = authorization.replace(SecurityConstants.TOKEN_PREFIX, "");
    
    // 1. JWT 유효성 검증
    if (jwtProvider.validateToken(jwt)) {
        // 2. 검증 성공 시 인증 객체 생성
        Authentication authentication = jwtProvider.getAuthenticationToken(jwt);
        
        if (authentication != null) {
            SecurityContextHolder.getContext().setAuthentication(authentication);
            log.info("유효한 JWT 토큰, 인증 처리 완료. 사용자: {}, 권한: {}", 
                     authentication.getName(), authentication.getAuthorities());
        } else {
            log.warn("JWT 토큰은 유효하지만 인증 객체 생성 실패");
        }
    } else {
        log.warn("유효하지 않은 JWT 토큰");
    }

    // 4. 다음 필터로 진행
    filterChain.doFilter(request, response);
  }
}
