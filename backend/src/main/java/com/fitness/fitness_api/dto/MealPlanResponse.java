package com.fitness.fitness_api.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class MealPlanResponse {

    private Long id;

    private Long userId;

    private String username;

    private String title;

    private String description;

    private String imageUrl;

    private List<MealResponse> meals;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @Getter
    @Builder
    public static class MealResponse {

        private Long id;

        private String mealName;

        private String foodName;

        private Integer calories;

        private Double protein;

        private Double carbs;

        private Double fats;
    }
}