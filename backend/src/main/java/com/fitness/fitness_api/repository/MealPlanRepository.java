package com.fitness.fitness_api.repository;

import com.fitness.fitness_api.entity.MealPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MealPlanRepository
        extends JpaRepository<MealPlan, Long> {

    List<MealPlan> findByUserIdOrderByCreatedAtDesc(Long userId);
}