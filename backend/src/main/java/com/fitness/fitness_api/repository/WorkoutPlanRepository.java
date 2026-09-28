package com.fitness.fitness_api.repository;

import com.fitness.fitness_api.entity.WorkoutPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkoutPlanRepository
        extends JpaRepository<WorkoutPlan, Long> {

    List<WorkoutPlan> findByUserIdOrderByCreatedAtDesc(Long userId);
}