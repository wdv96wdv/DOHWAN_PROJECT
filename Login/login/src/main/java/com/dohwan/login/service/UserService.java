package com.dohwan.login.service;

import com.dohwan.login.domain.UserUpdateRequest;
import com.dohwan.login.domain.Users;

import jakarta.servlet.http.HttpServletRequest;


public interface UserService {

    // 회원 등록
    public boolean insert(Users user) throws Exception;

    // 회원 조회
    public Users select(String username) throws Exception;
    
    // 로그인
    public void login(Users user, HttpServletRequest request) throws Exception;

    // 회원 수정
    public boolean update(Users user) throws Exception;

    // 회원 비밀번호 수정
    boolean updateWithPassword(UserUpdateRequest request) throws Exception;
    // 회원 정보 수정 (비밀번호 변경 여부 반환)
    boolean updateUser(UserUpdateRequest request) throws Exception;
    Users findByUsername(String username) throws Exception;

    // 회원 삭제
    public boolean delete(String username) throws Exception;
    

  
}