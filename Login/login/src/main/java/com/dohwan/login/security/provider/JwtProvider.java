package com.dohwan.login.security.provider;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import com.dohwan.login.dto.CustomUser;
import com.dohwan.login.dto.UserAuth;
import com.dohwan.login.dto.Users;
import com.dohwan.login.security.constants.SecurityConstants;
import com.dohwan.login.security.util.JwtUtil;
import com.dohwan.login.service.UserService;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class JwtProvider {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    public String createToken(String id, String username, List<String> roles, Long no) {
        return jwtUtil.createToken(id, username, roles, no);
    }

    public UsernamePasswordAuthenticationToken getAuthenticationToken(String jwt) {
        if (jwt == null || jwt.isEmpty())
            return null;

        Jws<Claims> parsedToken = jwtUtil.parseToken(jwt);
        if (parsedToken == null) return null;

        String id = parsedToken.getPayload().get("id") != null ? parsedToken.getPayload().get("id").toString() : null;
        String username = parsedToken.getPayload().get("username") != null ? parsedToken.getPayload().get("username").toString() : null;
        Object roles = parsedToken.getPayload().get("rol");
        Object noObj = parsedToken.getPayload().get("no");

        if (id == null || username == null) {
            log.warn("JWT에 필수 클레임(id 또는 username)이 누락되었습니다.");
            return null;
        }

        Long no = null;
        if (noObj != null) {
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
        user.setNo(no);

        List<UserAuth> authList = null;
        List<SimpleGrantedAuthority> authorities = null;

        if (roles instanceof List) {
            authList = ((List<?>) roles).stream()
                    .map(auth -> UserAuth.builder()
                            .username(username)
                            .auth(auth != null ? auth.toString() : null)
                            .build())
                    .collect(Collectors.toList());
            user.setAuthList(authList);

            authorities = ((List<?>) roles).stream()
                    .map(auth -> new SimpleGrantedAuthority(auth != null ? auth.toString() : null))
                    .collect(Collectors.toList());
        } else {
            log.warn("JWT 'rol' claim is null or not a List: {}", roles);
            authList = List.of();
            authorities = List.of();
        }

        try {
            Users userInfo = userService.select(username);
            if (userInfo != null) {
                user.setName(userInfo.getName());
                user.setEmail(userInfo.getEmail());
                user.setProvider(userInfo.getProvider());
                user.setBio(userInfo.getBio());
                user.setAvatarUrl(userInfo.getAvatarUrl());
            }
        } catch (Exception e) {
            log.error("토큰 해석 중, 회원 추가 정보 조회시 에러 발생", e);
        }

        CustomUser userDetails = new CustomUser(user);
        return new UsernamePasswordAuthenticationToken(userDetails, null, authorities);
    }

    public boolean validateToken(String jwt) {
        return jwtUtil.validateToken(jwt);
    }
}
