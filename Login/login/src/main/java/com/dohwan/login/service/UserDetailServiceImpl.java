package com.dohwan.login.service;

import com.dohwan.login.dto.CustomUser;
import com.dohwan.login.dto.UserAuth;
import com.dohwan.login.dto.Users;
import com.dohwan.login.entity.UserEntity;
import com.dohwan.login.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Spring Security 인증용 사용자 상세 서비스 (JPA 기반)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserDetailServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.info("::::: UserDetailServiceImpl.loadUserByUsername 시작 - username: {} :::::", username);
        
        UserEntity entity = userRepository.findByUsernameWithAuth(username)
                .orElseThrow(() -> {
                    log.warn("::::: 사용자 찾을 수 없음: {} :::::", username);
                    return new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + username);
                });

        log.info("::::: 사용자 발견: {}, 권한 개수: {} :::::", entity.getUsername(), entity.getAuthList().size());

        // UserEntity → Users DTO (CustomUser용)
        Users user = new Users();
        user.setNo(entity.getNo());
        user.setId(entity.getId());
        user.setUsername(entity.getUsername());
        user.setPassword(entity.getPassword());
        user.setName(entity.getName());
        user.setEmail(entity.getEmail());
        user.setEnabled(true);
        user.setProvider(entity.getProvider());

        List<UserAuth> authList = entity.getAuthList().stream()
                .map(a -> UserAuth.builder()
                        .username(a.getUsername())
                        .auth(a.getAuth())
                        .build())
                .collect(Collectors.toList());
        user.setAuthList(authList);

        return new CustomUser(user);
    }
}
