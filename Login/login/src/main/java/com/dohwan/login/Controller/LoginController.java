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
import reactor.core.publisher.Mono;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

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
        return processSocialLogin(request);
    }

    // ─── 카카오 로그인 (인가 코드 처리) ──────────────────────────────────
    @PostMapping("/auth/kakao-login")
    public ResponseEntity<ApiResponse<?>> kakaoLogin(@RequestBody Map<String, String> body) {
        String code = body.get("code");
        log.info("카카오 로그인 요청 - code: {}", code);

        try {
            // 1. 카카오 토큰 발급
            String tokenUrl = "https://kauth.kakao.com/oauth/token";
            String clientId = jwtProps.getKakaoClientId();
            String redirectUri = jwtProps.getKakaoRedirectUri();
            
            log.info("카카오 설정 확인 - ClientId exists: {}, RedirectUri: {}", 
                     clientId != null && !clientId.isEmpty(), redirectUri);

            if (clientId == null || redirectUri == null) {
                throw new RuntimeException("카카오 설정값(ClientId/RedirectUri)이 비어있습니다. application.properties를 확인하세요.");
            }

            // WebClient를 사용한 동기 요청 (간편화)
            org.springframework.web.reactive.function.client.WebClient webClient = org.springframework.web.reactive.function.client.WebClient.create();
            
            // 폼 데이터를 MultiValueMap 형식으로 준비
            MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
            formData.add("grant_type", "authorization_code");
            formData.add("client_id", clientId.trim());
            formData.add("redirect_uri", redirectUri.trim());
            formData.add("code", code.trim());

            // Client Secret이 설정된 경우 추가 (카카오 보안 설정에 따라 필수)
            String clientSecret = jwtProps.getKakaoClientSecret();
            if (clientSecret != null && !clientSecret.isEmpty()) {
                formData.add("client_secret", clientSecret.trim());
                log.info("카카오 Client Secret 포함하여 요청");
            }

            Map<String, Object> tokenResponse = webClient.post()
                .uri(tokenUrl)
                .header("Content-Type", "application/x-www-form-urlencoded;charset=utf-8")
                .body(BodyInserters.fromFormData(formData))
                .retrieve()
                .onStatus(status -> status.isError(), clientResponse -> {
                    return clientResponse.bodyToMono(String.class)
                            .flatMap(errorBody -> {
                                log.error("카카오 토큰 발급 실패 상세 응답: {}", errorBody);
                                return Mono.error(new RuntimeException("카카오 토큰 발급 실패: " + errorBody));
                            });
                })
                .bodyToMono(Map.class)
                .block();

            String accessToken = (String) tokenResponse.get("access_token");

            // 2. 카카오 사용자 정보 가져오기
            Map<String, Object> userInfoResponse = webClient.get()
                .uri("https://kapi.kakao.com/v2/user/me")
                .header("Authorization", "Bearer " + accessToken)
                .retrieve()
                .onStatus(status -> status.isError(), clientResponse -> {
                    return clientResponse.bodyToMono(String.class)
                            .flatMap(errorBody -> {
                                log.error("카카오 사용자 정보 조회 실패 응답: {}", errorBody);
                                return Mono.error(new RuntimeException("카카오 사용자 정보 조회 실패: " + errorBody));
                            });
                })
                .bodyToMono(Map.class)
                .block();

            // 3. 우리 서비스 형식으로 변환
            Map<String, Object> kakaoAccount = (Map<String, Object>) userInfoResponse.get("kakao_account");
            Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");

            String email = (String) kakaoAccount.get("email");
            if (email == null) {
                // 이메일이 없는 경우 임시 이메일 생성
                email = userInfoResponse.get("id").toString() + "@kakao.com";
            }

            SocialLoginRequest socialRequest = new SocialLoginRequest();
            socialRequest.setUsername("kakao_" + userInfoResponse.get("id").toString());
            socialRequest.setName(profile != null ? (String) profile.get("nickname") : "KakaoUser");
            socialRequest.setEmail(email);
            socialRequest.setAvatar_url(profile != null ? (String) profile.get("thumbnail_image_url") : null);
            socialRequest.setProvider("kakao");

            log.info("카카오 프로필 변환 완료 - Email: {}", email);

            return processSocialLogin(socialRequest);
        } catch (Exception e) {
            log.error("카카오 로그인 도중 에러 발생: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(ApiResponse.error(500, "카카오 로그인 실패: " + e.getMessage()));
        }
    }

    private ResponseEntity<ApiResponse<?>> processSocialLogin(SocialLoginRequest request) {
        log.info("소셜 로그인 처리 - email: {}, provider: {}", request.getEmail(), request.getProvider());

        UserEntity user = userRepository.findByEmailWithAuth(request.getEmail())
                .orElse(null);

        if (user == null) {
            // 신규 소셜 회원 등록
            user = new UserEntity();
            user.setUsername(request.getUsername());
            user.setName(request.getName());
            user.setEmail(request.getEmail());
            user.setPassword("SOCIAL_LOGIN_NO_PASSWORD");
            user.setProvider(request.getProvider() != null ? request.getProvider() : "google");
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
            // 기존 사용자 provider 업데이트 (필요시)
            String requestProvider = request.getProvider() != null ? request.getProvider() : "google";
            if (!requestProvider.equals(user.getProvider())) {
                user.setProvider(requestProvider);
                userRepository.save(user);
                user = userRepository.findByEmailWithAuth(request.getEmail()).orElse(user);
            }
        }

        String jwt = buildJwt(user);
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
