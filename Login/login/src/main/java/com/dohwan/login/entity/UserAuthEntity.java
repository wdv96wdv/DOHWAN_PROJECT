package com.dohwan.login.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * JPA 사용자 권한 엔티티 (MyBatis UserAuth 대체)
 */
@Entity
@Table(name = "user_auth")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserAuthEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long no;

    @Column(nullable = false, name = "username")
    private String username;

    @Column(nullable = false)
    private String auth;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "username", referencedColumnName = "username", insertable = false, updatable = false)
    private UserEntity user;
}
