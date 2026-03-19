package com.dohwan.login.service;

import com.dohwan.login.dto.GoalDto;
import com.dohwan.login.entity.Goal;
import com.dohwan.login.repository.GoalRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GoalService {

    private final GoalRepository repository;

    public GoalService(GoalRepository repository) {
        this.repository = repository;
    }

    public Goal saveGoal(GoalDto dto, Long userNo) {
        Goal goal = new Goal();
        goal.setTitle(dto.getTitle());
        goal.setTargetValue(dto.getTargetValue());
        goal.setUnit(dto.getUnit());
        goal.setUserNo(userNo);
        return repository.save(goal);
    }

    public List<Goal> getGoals(Long userNo) {
        return repository.findByUserNo(userNo);
    }

    public Goal updateGoal(Long id, GoalDto dto, Long userNo) {
        Goal goal = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("목표를 찾을 수 없습니다."));
        if (!goal.getUserNo().equals(userNo)) {
            throw new RuntimeException("권한이 없습니다.");
        }
        goal.setTitle(dto.getTitle());
        goal.setTargetValue(dto.getTargetValue());
        goal.setUnit(dto.getUnit());
        return repository.save(goal);
    }

    public void deleteGoal(Long id, Long userNo) {
        Goal goal = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("목표를 찾을 수 없습니다."));
        if (!goal.getUserNo().equals(userNo)) {
            throw new RuntimeException("권한이 없습니다.");
        }
        repository.delete(goal);
    }
}
