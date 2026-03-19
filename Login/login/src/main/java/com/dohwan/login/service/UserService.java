package com.dohwan.login.service;

import com.dohwan.login.dto.UserUpdateRequest;
import com.dohwan.login.dto.Users;
import com.dohwan.login.entity.UserEntity;

public interface UserService {

    // 회원 등록
    boolean insert(Users user) throws Exception;

    // 회원 조회 (MyBatis 호환 - 내부에서 UserEntity 변환)
    Users select(String username) throws Exception;

    // 회원 수정
    boolean update(Users user) throws Exception;

    // 회원 정보 수정 (비밀번호 변경 여부 반환)
    boolean updateUser(UserUpdateRequest request) throws Exception;

    // 회원 삭제
    boolean delete(String username) throws Exception;

    // 회원 조회 (JPA 직접 반환)
    UserEntity findEntityByUsername(String username);

    // 회원 조회 (레거시 호환용)
    Users findByUsername(String username) throws Exception;
}
