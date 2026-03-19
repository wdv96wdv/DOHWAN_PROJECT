package com.dohwan.login.repository;

import com.dohwan.login.entity.UserAuthEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * JPA 사용자 권한 레포지토리
 */
public interface UserAuthRepository extends JpaRepository<UserAuthEntity, Long> {

    List<UserAuthEntity> findByUsername(String username);

    void deleteByUsername(String username);
}
