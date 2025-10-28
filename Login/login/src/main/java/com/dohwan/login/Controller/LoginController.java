package com.dohwan.login.controller;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import com.dohwan.login.domain.AuthenticationRequest;
import com.dohwan.login.domain.SocialLoginRequest;
import com.dohwan.login.domain.UserAuth;
import com.dohwan.login.domain.Users;
import com.dohwan.login.mapper.UserMapper;
import com.dohwan.login.security.constants.SecurityConstants;
import com.dohwan.login.security.props.JwtProps;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
public class LoginController {

    @Autowired
    private JwtProps jwtProps;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * 로그인 요청 → JWT 토큰 생성
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthenticationRequest authReq) {
        try {
            String username = authReq.getUsername();
            String rawPassword = authReq.getPassword();

            log.info("username : {}", username);
            log.info("password : {}", rawPassword);

            // 사용자 조회
            Users user = userMapper.findByUsername(username);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("존재하지 않는 사용자입니다.");
            }

            // 비밀번호 검증
            if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("비밀번호가 일치하지 않습니다.");
            }

            // 권한 정보 추출
            List<String> roles = new ArrayList<>();
            for (UserAuth auth : user.getAuthList()) {
                roles.add(auth.getAuth());
            }

            // JWT 생성
            String secretKey = jwtProps.getSecretKey();
            byte[] signingKey = secretKey.getBytes();
            int day5 = 1000 * 60 * 60 * 24 * 5;

            String jwt = Jwts.builder()
                    .signWith(Keys.hmacShaKeyFor(signingKey), Jwts.SIG.HS512)
                    .header().add("typ", SecurityConstants.TOKEN_TYPE).and()
                    .claim("uid", username)
                    .claim("rol", roles)
                    .expiration(new Date(System.currentTimeMillis() + day5))
                    .compact();

            log.info("JWT 생성 완료 : {}", jwt);
            return ResponseEntity.ok(jwt);

        } catch (Exception e) {
            log.error("로그인 중 예외 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류");
        }
    }

    /**
     * JWT 토큰 해석
     */
    @GetMapping("/user")
    public ResponseEntity<?> user(@RequestHeader(name = "Authorization") String authorization) {
        try {
            log.info("Authorization 헤더 : {}", authorization);

            String jwt = authorization.substring(7);
            String secretKey = jwtProps.getSecretKey();
            byte[] signingKey = secretKey.getBytes();

            Jws<Claims> parsedToken = Jwts.parser()
                    .verifyWith(Keys.hmacShaKeyFor(signingKey))
                    .build()
                    .parseSignedClaims(jwt);

            String username = parsedToken.getPayload().get("uid").toString();
            List<String> roleList = (List<String>) parsedToken.getPayload().get("rol");

            log.info("username : {}", username);
            log.info("roles : {}", roleList);

            return ResponseEntity.ok(parsedToken.toString());

        } catch (Exception e) {
            log.error("토큰 해석 중 예외 발생", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("잘못된 토큰입니다.");
        }
    }

    @PostMapping("/api/auth/social-login")
    public ResponseEntity<?> socialLogin(@RequestBody SocialLoginRequest request) {
        try {
            String username = request.getUsername();
            String email = request.getEmail();
            String name = request.getName();

            log.info("소셜 로그인 요청 - username: {}, email: {}, name: {}", username, email, name);

            // 사용자 조회 (이메일 기준)
            Users user = userMapper.findByEmail(email);

            // 없으면 회원가입 처리
            if (user == null) {
                user = new Users();
                user.setUsername(username);
                user.setName(name);
                user.setEmail(email);
                user.setPassword(null); // 소셜 로그인은 비밀번호 없음
                user.setEnabled(true);
                userMapper.insertUser(user); // INSERT 처리

                // 권한 기본값 설정
                UserAuth auth = new UserAuth();
                auth.setUsername(username);
                auth.setAuth("ROLE_USER");
                userMapper.insertUserAuth(auth); // 권한 INSERT
                List<UserAuth> authList = new ArrayList<>();
                authList.add(auth);
                user.setAuthList(authList);
            } else {
                // 기존 사용자 권한 조회
                List<UserAuth> authList = userMapper.findAuthListByUsername(user.getUsername());
                user.setAuthList(authList);
            }

            // JWT 생성
            List<String> roles = new ArrayList<>();
            for (UserAuth auth : user.getAuthList()) {
                roles.add(auth.getAuth());
            }

            String secretKey = jwtProps.getSecretKey();
            byte[] signingKey = secretKey.getBytes();
            int day5 = 1000 * 60 * 60 * 24 * 5;

            String jwt = Jwts.builder()
                    .signWith(Keys.hmacShaKeyFor(signingKey), Jwts.SIG.HS512)
                    .header().add("typ", SecurityConstants.TOKEN_TYPE).and()
                    .claim("uid", user.getUsername())
                    .claim("rol", roles)
                    .expiration(new Date(System.currentTimeMillis() + day5))
                    .compact();

            log.info("소셜 로그인 JWT 생성 완료 : {}", jwt);

            // 응답 구성
            Map<String, Object> response = new HashMap<>();
            response.put("token", jwt);
            response.put("userInfo", user);

            return ResponseEntity.ok(response); // ✅ 여기!

        } catch (Exception e) {
            log.error("소셜 로그인 중 예외 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류");
        }
    }
}