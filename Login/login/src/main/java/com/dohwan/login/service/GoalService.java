package com.dohwan.login.service;

import com.dohwan.login.domain.GoalDto;
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

    public Goal saveGoal(GoalDto dto) {
        Goal goal = new Goal();
        goal.setTitle(dto.getTitle());
        goal.setTargetValue(dto.getTargetValue());
        goal.setUnit(dto.getUnit());
        return repository.save(goal);
    }

    public List<Goal> getGoals() {
        return repository.findAll();
    }
}