package com.dohwan.login.Controller;

import com.dohwan.login.common.ApiResponse;
import com.dohwan.login.dto.SocialLoginRequest;
import com.dohwan.login.dto.UserAuth;
import com.dohwan.login.dto.Users;
import com.dohwan.login.entity.UserAuthEntity;
import com.dohwan.login.entity.UserEntity;
import com.dohwan.login.repository.UserAuthRepository;
import com.dohwan.login.repository.UserRepository;
import com.dohwan.login.security.constants.SecurityConstants;
import com.dohwan.login.security.props.JwtProps;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequiredArgsConstructor
public class LoginController {

    private final JwtProps jwtProps;
    private final UserRepository userRepository;
    private final UserAuthRepository userAuthRepository;

    // ─── 아이디 중복 확인 ──────────────────────────────────────────────

    @GetMapping("/auth/check-username")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkUsername(@RequestParam String username) {
        log.info("아이디 중복 확인 요청: {}", username);
        boolean exists = userRepository.existsByUsername(username);
        return ResponseEntity.ok(ApiResponse.success(Map.of("exists", exists)));
    }

    // ─── 일반 로그인 ───────────────────────────────────────────────────
    // (Spring Security Filter에서 처리 중)


    // ─── 소셜 로그인 ───────────────────────────────────────────────────

    @PostMapping("/auth/social-login")
    public ResponseEntity<ApiResponse<?>> socialLogin(@RequestBody SocialLoginRequest request) {
        log.info("소셜 로그인 요청 - email: {}", request.getEmail());

        UserEntity user = userRepository.findByEmailWithAuth(request.getEmail())
                .orElse(null);

        if (user == null) {
            // 신규 소셜 회원 등록
            user = new UserEntity();
            user.setUsername(request.getUsername());
            user.setName(request.getName());
            user.setEmail(request.getEmail());
            user.setPassword("SOCIAL_LOGIN_NO_PASSWORD");
            user.setProvider("google");
            user.setAvatarUrl(request.getAvatar_url());
            UserEntity saved = userRepository.save(user);

            UserAuthEntity authEntity = UserAuthEntity.builder()
                    .username(saved.getUsername())
                    .auth("ROLE_USER")
                    .build();
            userAuthRepository.save(authEntity);

            // 권한 포함 재조회
            user = userRepository.findByEmailWithAuth(request.getEmail()).orElse(saved);
        } else {
            // 기존 사용자 provider 업데이트
            if (!"google".equals(user.getProvider())) {
                user.setProvider("google");
                userRepository.save(user);
                user = userRepository.findByEmailWithAuth(request.getEmail()).orElse(user);
            }
        }

        String jwt = buildJwt(user);

        // Users DTO 변환 (프론트 호환)
        Users userDto = entityToDto(user);

        return ResponseEntity.ok(ApiResponse.success(Map.of("token", jwt, "userInfo", userDto)));
    }

    // ─── JWT 파싱 (내부 디버깅용) ──────────────────────────────────────

    @GetMapping("/user")
    public ResponseEntity<ApiResponse<?>> user(@RequestHeader("Authorization") String authorization) {
        try {
            String jwt = authorization.substring(7);
            byte[] key = jwtProps.getSecretKey().getBytes();
            Jws<Claims> parsed = Jwts.parser()
                    .verifyWith(Keys.hmacShaKeyFor(key))
                    .build()
                    .parseSignedClaims(jwt);
            return ResponseEntity.ok(ApiResponse.success(parsed.getPayload()));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(ApiResponse.error(401, "잘못된 토큰입니다."));
        }
    }

    // ─── JWT 생성 헬퍼 ─────────────────────────────────────────────────

    private String buildJwt(UserEntity user) {
        List<String> roles = user.getAuthList().stream()
                .map(UserAuthEntity::getAuth)
                .collect(Collectors.toList());

        byte[] signingKey = jwtProps.getSecretKey().getBytes();
        long day5Ms = 1000L * 60 * 60 * 24 * 5;

        return Jwts.builder()
                .signWith(Keys.hmacShaKeyFor(signingKey), Jwts.SIG.HS512)
                .header().add("typ", SecurityConstants.TOKEN_TYPE).and()
                .claim("username", user.getUsername())
                .claim("id", user.getId())
                .claim("rol", roles)
                .claim("no", user.getNo())
                .expiration(new Date(System.currentTimeMillis() + day5Ms))
                .compact();
    }

    // ─── Entity → DTO 변환 ─────────────────────────────────────────────

    private Users entityToDto(UserEntity entity) {
        Users dto = new Users();
        dto.setNo(entity.getNo());
        dto.setId(entity.getId());
        dto.setUsername(entity.getUsername());
        dto.setName(entity.getName());
        dto.setEmail(entity.getEmail());
        dto.setEnabled(true);
        dto.setProvider(entity.getProvider());
        List<UserAuth> authList = entity.getAuthList().stream()
                .map(a -> UserAuth.builder().username(a.getUsername()).auth(a.getAuth()).build())
                .collect(Collectors.toList());
        dto.setAuthList(authList);
        return dto;
    }
}
