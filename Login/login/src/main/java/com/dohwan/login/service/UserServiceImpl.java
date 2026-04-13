package com.dohwan.login.service;

import com.dohwan.login.dto.UserAuth;
import com.dohwan.login.dto.UserUpdateRequest;
import com.dohwan.login.dto.Users;
import com.dohwan.login.entity.UserAuthEntity;
import com.dohwan.login.entity.UserEntity;
import com.dohwan.login.repository.UserAuthRepository;
import com.dohwan.login.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserAuthRepository userAuthRepository;
    private final PasswordEncoder passwordEncoder;

    // ─── Users 도메인 ↔ UserEntity 변환 헬퍼 ──────────────────────────

    private Users toDto(UserEntity entity) {
        if (entity == null) return null;
        Users dto = new Users();
        dto.setNo(entity.getNo());
        dto.setId(entity.getId());
        dto.setUsername(entity.getUsername());
        dto.setPassword(entity.getPassword());
        dto.setName(entity.getName());
        dto.setEmail(entity.getEmail());
        dto.setEnabled(true);
        dto.setProvider(entity.getProvider());
        dto.setBio(entity.getBio());
        dto.setAvatarUrl(entity.getAvatarUrl());

        List<UserAuth> authList = entity.getAuthList().stream()
                .map(a -> UserAuth.builder().username(a.getUsername()).auth(a.getAuth()).build())
                .collect(Collectors.toList());
        dto.setAuthList(authList);
        return dto;
    }

    // ─── 회원 등록 ─────────────────────────────────────────────────────

    @Override
    @Transactional
    public boolean insert(Users user) throws Exception {
        // 아이디 중복 체크
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new IllegalArgumentException("이미 존재하는 아이디입니다.");
        }
        // 이메일 중복 체크 (이메일이 제공된 경우에만)
        if (user.getEmail() != null && !user.getEmail().isEmpty() && userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("이미 존재하는 이메일입니다.");
        }

        UserEntity entity = new UserEntity();
        entity.setUsername(user.getUsername());
        entity.setPassword(passwordEncoder.encode(user.getPassword()));
        entity.setName(user.getName());
        entity.setEmail(user.getEmail());
        entity.setProvider("traditional");
        UserEntity saved = userRepository.save(entity);

        UserAuthEntity authEntity = UserAuthEntity.builder()
                .username(saved.getUsername())
                .auth("ROLE_USER")
                .build();
        userAuthRepository.save(authEntity);
        return true;
    }

    // ─── 회원 조회 ─────────────────────────────────────────────────────

    @Override
    public Users select(String username) throws Exception {
        return userRepository.findByUsernameWithAuth(username)
                .map(this::toDto)
                .orElse(null);
    }

    @Override
    public UserEntity findEntityByUsername(String username) {
        return userRepository.findByUsernameWithAuth(username).orElse(null);
    }

    @Override
    public Users findByUsername(String username) throws Exception {
        return select(username);
    }

    // ─── 회원 수정 ─────────────────────────────────────────────────────

    @Override
    @Transactional
    public boolean update(Users user) throws Exception {
        UserEntity entity = userRepository.findByUsername(user.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            entity.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        entity.setName(user.getName());
        entity.setEmail(user.getEmail());
        userRepository.save(entity);
        return true;
    }

    @Override
    @Transactional
    public boolean updateUser(UserUpdateRequest request) throws Exception {
        UserEntity entity = userRepository.findByUsernameWithAuth(request.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        boolean passwordChanged = false;

        // 비밀번호 변경 (일반 로그인 사용자만)
        if ("traditional".equals(entity.getProvider())) {
            if (request.getNewPassword() != null && !request.getNewPassword().isEmpty()) {
                if (request.getCurrentPassword() == null ||
                        !passwordEncoder.matches(request.getCurrentPassword(), entity.getPassword())) {
                    throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
                }
                if (!request.getNewPassword().equals(request.getConfirmPassword())) {
                    throw new IllegalArgumentException("새 비밀번호가 일치하지 않습니다.");
                }
                entity.setPassword(passwordEncoder.encode(request.getNewPassword()));
                passwordChanged = true;
            }
        } else {
            log.info("소셜 로그인 사용자이므로 비밀번호 변경 요청을 무시합니다.");
        }

        entity.setName(request.getName());
        entity.setEmail(request.getEmail());
        entity.setBio(request.getBio());
        entity.setAvatarUrl(request.getAvatarUrl());
        userRepository.save(entity);
        return passwordChanged;
    }

    // ─── 회원 삭제 ─────────────────────────────────────────────────────

    @Override
    @Transactional
    public boolean delete(String username) throws Exception {
        UserEntity entity = userRepository.findByUsername(username)
                .orElse(null);
        if (entity == null) return false;

        userAuthRepository.deleteByUsername(username);
        userRepository.delete(entity);
        return true;
    }
}
