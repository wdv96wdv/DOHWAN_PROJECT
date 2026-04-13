package com.dohwan.login.repository;

import com.dohwan.login.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * JPA 사용자 레포지토리 (MyBatis UserMapper 대체)
 */
public interface UserRepository extends JpaRepository<UserEntity, Long> {

    Optional<UserEntity> findByUsername(String username);

    Optional<UserEntity> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    @Query("SELECT u FROM UserEntity u LEFT JOIN FETCH u.authList WHERE u.username = :username")
    Optional<UserEntity> findByUsernameWithAuth(@Param("username") String username);

    @Query("SELECT u FROM UserEntity u LEFT JOIN FETCH u.authList WHERE u.email = :email")
    Optional<UserEntity> findByEmailWithAuth(@Param("email") String email);

}
