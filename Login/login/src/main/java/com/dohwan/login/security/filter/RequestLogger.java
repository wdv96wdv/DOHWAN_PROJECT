package com.dohwan.login.security.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Slf4j
public class RequestLogger extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        log.info(">>>> [Request] {} {} from {}", request.getMethod(), request.getRequestURI(), request.getRemoteAddr());
        log.info("Origin Header: {}", request.getHeader("Origin"));
        log.info("Authorization Header: {}", request.getHeader("Authorization"));
        
        filterChain.doFilter(request, response);
        
        log.info("<<<< [Response] status: {}", response.getStatus());
    }
}
