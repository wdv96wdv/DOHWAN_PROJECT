package com.dohwan.login.Controller;

import com.dohwan.login.common.ApiResponse;
import com.dohwan.login.dto.CustomUser;
import com.dohwan.login.dto.UserUpdateRequest;
import com.dohwan.login.dto.Users;
import com.dohwan.login.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * 사용자 정보 조회
     */
    @GetMapping("/info")
    public ResponseEntity<ApiResponse<?>> userInfo(@AuthenticationPrincipal CustomUser customUser) {
        log.info("::::: 사용자 정보 조회 :::::");
        if (customUser == null) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error(401, "UNAUTHORIZED"));
        }
        Users user = customUser.getUser();
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    /**
     * 회원가입
     */
    @PostMapping("")
    public ResponseEntity<ApiResponse<String>> join(@RequestBody Users user) throws Exception {
        log.info("회원가입 요청: {}", user.getUsername());
        boolean result = userService.insert(user);
        if (result) {
            log.info("회원가입 성공: {}", user.getUsername());
            return ResponseEntity.ok(ApiResponse.success("회원가입이 완료되었습니다.", "SUCCESS"));
        }
        return ResponseEntity.badRequest()
                .body(ApiResponse.error(400, "회원가입에 실패했습니다."));
    }

    /**
     * 회원 정보 수정
     */
    @PutMapping("")
    @PreAuthorize("hasRole('ROLE_ADMIN') or #request.username == authentication.name")
    public ResponseEntity<ApiResponse<String>> update(
            @RequestBody UserUpdateRequest request,
            Authentication authentication) throws Exception {
        boolean passwordChanged = userService.updateUser(request);
        String msg = passwordChanged ? "비밀번호가 변경되었습니다." : "회원 정보가 수정되었습니다.";
        return ResponseEntity.ok(ApiResponse.success(msg));
    }

    /**
     * 회원 탈퇴
     */
    @PreAuthorize("hasRole('ROLE_ADMIN') or #username == authentication.name")
    @DeleteMapping("/{username}")
    public ResponseEntity<ApiResponse<String>> delete(@PathVariable("username") String username) throws Exception {
        boolean result = userService.delete(username);
        if (result) {
            return ResponseEntity.ok(ApiResponse.success("회원탈퇴가 완료되었습니다."));
        }
        return ResponseEntity.badRequest()
                .body(ApiResponse.error(400, "회원탈퇴에 실패했습니다."));
    }
}
