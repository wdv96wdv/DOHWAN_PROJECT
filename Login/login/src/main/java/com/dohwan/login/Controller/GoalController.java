package com.dohwan.login.Controller;

import com.dohwan.login.dto.GoalDto;
import com.dohwan.login.entity.Goal;
import com.dohwan.login.service.GoalService;
import com.dohwan.login.common.ApiResponse;
import com.dohwan.login.dto.CustomUser;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/run/goal")
public class GoalController {

    private final GoalService service;

    public GoalController(GoalService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Goal>> saveGoal(
            @AuthenticationPrincipal CustomUser user,
            @RequestBody GoalDto dto) {
        return ResponseEntity.ok(ApiResponse.success(service.saveGoal(dto, user.getUserNo())));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Goal>>> getGoals(@AuthenticationPrincipal CustomUser user) {
        return ResponseEntity.ok(ApiResponse.success(service.getGoals(user.getUserNo())));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Goal>> updateGoal(
            @AuthenticationPrincipal CustomUser user,
            @PathVariable Long id,
            @RequestBody GoalDto dto) {
        return ResponseEntity.ok(ApiResponse.success(service.updateGoal(id, dto, user.getUserNo())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteGoal(
            @AuthenticationPrincipal CustomUser user,
            @PathVariable Long id) {
        service.deleteGoal(id, user.getUserNo());
        return ResponseEntity.ok(ApiResponse.success("목표가 삭제되었습니다."));
    }
}
