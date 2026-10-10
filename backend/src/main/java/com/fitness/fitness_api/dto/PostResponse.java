package com.fitness.fitness_api.dto;

import com.fitness.fitness_api.entity.Post.PostType;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class PostResponse {

    private Long id;
    private Long userId;
    private String username;
    private String description;
    private PostType type;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<MediaResponse> media;

    private WorkoutPlanResponse workoutPlan;
    private MealPlanResponse mealPlan;
}