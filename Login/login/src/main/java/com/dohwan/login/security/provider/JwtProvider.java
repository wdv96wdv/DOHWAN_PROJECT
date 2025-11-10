package com.dohwan.login.security.provider;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import com.dohwan.login.domain.CustomUser;
import com.dohwan.login.domain.UserAuth;
import com.dohwan.login.domain.Users;
import com.dohwan.login.mapper.UserMapper;
import com.dohwan.login.security.constants.SecurityConstants;
import com.dohwan.login.security.props.JwtProps;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import net.sf.jsqlparser.expression.LongValue;

/**
 * 💍 JWT 토큰 관련 기능을 제공하는 클래스
 * ✅ 토큰 생성
 * ✅ 토큰 해석
 * ✅ 토큰 검증
 */
@Slf4j
@Component
public class JwtProvider {

    @Autowired
    private JwtProps jwtProps;

    @Autowired
    private UserMapper userMapper;

    /**
     * 👩‍💼 ➡ 💍 토큰 생성
     * 
     * @param id
     * @param username
     * @param roles
     * @return
     */
    public String createToken(String id, String username, List<String> roles, Long no) {

        SecretKey shaKey = getShaKey();

        int exp = 1000 * 60 * 60 * 24 * 5; // 토큰 만료시간 설정 (5일)
        // JWT 토큰 생성
        String jwt = Jwts.builder()
                .signWith(shaKey, Jwts.SIG.HS512) // 시그니처 비밀키, 알고리즘 설정
                .header()
                .add("typ", SecurityConstants.TOKEN_TYPE) // typ: jwt
                .and()
                .expiration(new Date(System.currentTimeMillis() + exp)) // 토큰만료시간설정 (5일)
                .claim("id", id) // id : 사용자 식별키
                .claim("username", username) // username : 사용자 아이디
                .claim("rol", roles) // rol : 회원 권한 목록
                .claim("no", no) // no : 사용자 no(pk)
                .compact();

        return jwt;
    }

    /**
     * 💍 ➡ 🔐🍩 토큰 해석
     * 
     * @param authorization
     * @return
     */
    public UsernamePasswordAuthenticationToken getAuthenticationToken(String authorization) {
        if (authorization == null || authorization.length() == 0)
            return null;

        // Authorizaion : "Bearer {jwt}"
        try {
            // jwt 추출
            String jwt = authorization.replace(SecurityConstants.TOKEN_PREFIX, "");

            SecretKey shaKey = getShaKey();

            // 💍 ➡ 👩‍💼 JWT 파싱
            Jws<Claims> parsedToken = Jwts.parser()
                    .verifyWith(shaKey)
                    .build()
                    .parseSignedClaims(jwt);

            // 사용자 식별키(id)
            String id = parsedToken.getPayload().get("id") != null ? parsedToken.getPayload().get("id").toString() : null;
            // 사용자 아이디
            String username = parsedToken.getPayload().get("username") != null ? parsedToken.getPayload().get("username").toString() : null;
            // 회원 권한
            Object roles = parsedToken.getPayload().get("rol");
            // 회원 no
            Object noObj = parsedToken.getPayload().get("no");

            // 필수 클레임(id 또는 username)이 누락된 경우 처리
            if (id == null || username == null) {
                log.warn("JWT에 필수 클레임(id 또는 username)이 누락되었습니다.");
                return null;
            }
            Long no = null;
            if (noObj != null) { // noObj에 대한 null 체크 추가
                if (noObj instanceof Number) {
                    no = ((Number) noObj).longValue();
                } else if (noObj instanceof String) {
                    try {
                        no = Long.parseLong((String) noObj);
                    } catch (NumberFormatException e) {
                        log.warn("JWT 'no' claim is not a valid number string: {}", noObj);
                    }
                }
            }
            
            Users user = new Users();
            user.setId(id);
            user.setUsername(username);
            user.setNo(no); // pk 세팅

            List<UserAuth> authList = null;
            List<SimpleGrantedAuthority> authorities = null;

            if (roles instanceof List) { // roles가 List인지 확인
                authList = ((List<?>) roles)
                        .stream()
                        .map(auth -> UserAuth.builder()
                                .username(username)
                                .auth(auth != null ? auth.toString() : null) // auth 요소에 대한 null 체크
                                .build())
                        .collect(Collectors.toList());
                user.setAuthList(authList);

                // 시큐리티 권한 목록
                authorities = ((List<?>) roles)
                        .stream()
                        .map(auth -> new SimpleGrantedAuthority(auth != null ? auth.toString() : null)) // auth 요소에 대한 null 체크
                        .collect(Collectors.toList());
            } else {
                log.warn("JWT 'rol' claim is null or not a List: {}", roles);
                authList = List.of(); // 빈 리스트로 초기화
                authorities = List.of(); // 빈 리스트로 초기화
            }

            // 추가 유저정보 가져오기
            try {
                Users userInfo = userMapper.select(username);
                if (userInfo != null) {
                    user.setName(userInfo.getName());
                    user.setEmail(userInfo.getEmail());
                    user.setProvider(userInfo.getProvider());
                    user.setBio(userInfo.getBio()); // 이 줄 추가
                    user.setAvatarUrl(userInfo.getAvatarUrl()); // 이 줄 추가
                }
            } catch (Exception e) {
                log.error(e.getMessage());
                log.error("토큰 해석 중, 회원 추가 정보 조회시 에러 발생");
            }

            UserDetails userDetails = new CustomUser(user);

            // new UsernamePasswordAuthenticationToken( 사용자정보객체, 비밀번호, 권한목록 )
            return new UsernamePasswordAuthenticationToken(userDetails, null, authorities);

        } catch (ExpiredJwtException exception) {
            log.warn("Request to parse expired JWT : {} failed : {}", authorization, exception.getMessage());
        } catch (UnsupportedJwtException exception) {
            log.warn("Request to parse unsupported JWT : {} failed : {}", authorization, exception.getMessage());
        } catch (MalformedJwtException exception) {
            log.warn("Request to parse invalid JWT : {} failed : {}", authorization, exception.getMessage());
        } catch (IllegalArgumentException exception) {
            log.warn("Request to parse empty or null JWT : {} failed : {}", authorization, exception.getMessage());
        }

        return null;

    }

    /**
     * 💍❓ 토큰 검증
     * 
     * @param jwt
     * @return
     */
    public boolean validateToken(String jwt) {
        try {
            // 💍 ➡ 👩‍💼 토큰 파싱
            Jws<Claims> claims = Jwts.parser()
                    .verifyWith(getShaKey())
                    .build()
                    .parseSignedClaims(jwt);
            // 만료기한 추출
            Date expiration = claims.getPayload().getExpiration();

            // 날짜A.after( 날짜B )
            // : 날짜A가 날짜B 보다 더 뒤에 있으면 true
            boolean result = expiration.after(new Date());
            return result;
        } catch (ExpiredJwtException e) {
            log.error("토큰 만료");
        } catch (JwtException e) {
            log.error("토큰 손상");
        } catch (NullPointerException e) {
            log.error("토큰 없음");
        } catch (Exception e) {
            log.error("토큰 검증 시 예외");
        }
        return false;
    }

    /**
     * "secret-key" ➡ byte[] ➡ SecretKey
     * 
     * @return
     */
    public SecretKey getShaKey() {
        String secretKey = jwtProps.getSecretKey();
        byte[] signingKey = secretKey.getBytes();
        SecretKey shaKey = Keys.hmacShaKeyFor(signingKey);
        return shaKey;
    }

}