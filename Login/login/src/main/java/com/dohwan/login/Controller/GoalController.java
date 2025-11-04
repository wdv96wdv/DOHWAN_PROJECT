package com.dohwan.login.controller;

import com.dohwan.login.domain.GoalDto;
import com.dohwan.login.entity.Goal;
import com.dohwan.login.service.GoalService;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<Goal> saveGoal(@RequestBody GoalDto dto) {
        return ResponseEntity.ok(service.saveGoal(dto));
    }

    @GetMapping
    public ResponseEntity<List<Goal>> getGoals() {
        return ResponseEntity.ok(service.getGoals());
    }
}