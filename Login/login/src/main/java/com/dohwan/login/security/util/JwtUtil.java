package com.dohwan.login.security.util;

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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtUtil {

    private final JwtProps jwtProps;

    public String createToken(String id, String username, List<String> roles, Long no) {
        SecretKey shaKey = getShaKey();
        int exp = 1000 * 60 * 60 * 24 * 5; // 5 days
        return Jwts.builder()
                .signWith(shaKey, Jwts.SIG.HS512)
                .header()
                .add("typ", SecurityConstants.TOKEN_TYPE)
                .and()
                .expiration(new Date(System.currentTimeMillis() + exp))
                .claim("id", id)
                .claim("username", username)
                .claim("rol", roles)
                .claim("no", no)
                .compact();
    }

    public Jws<Claims> parseToken(String jwt) {
        try {
            return Jwts.parser()
                    .verifyWith(getShaKey())
                    .build()
                    .parseSignedClaims(jwt);
        } catch (ExpiredJwtException exception) {
            log.warn("Request to parse expired JWT : {} failed : {}", jwt, exception.getMessage());
        } catch (UnsupportedJwtException exception) {
            log.warn("Request to parse unsupported JWT : {} failed : {}", jwt, exception.getMessage());
        } catch (MalformedJwtException exception) {
            log.warn("Request to parse invalid JWT : {} failed : {}", jwt, exception.getMessage());
        } catch (IllegalArgumentException exception) {
            log.warn("Request to parse empty or null JWT : {} failed : {}", jwt, exception.getMessage());
        }
        return null;
    }

    public boolean validateToken(String jwt) {
        try {
            Jws<Claims> claims = Jwts.parser()
                    .verifyWith(getShaKey())
                    .build()
                    .parseSignedClaims(jwt);
            return claims.getPayload().getExpiration().after(new Date());
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

    public SecretKey getShaKey() {
        return Keys.hmacShaKeyFor(jwtProps.getSecretKey().getBytes());
    }
}
