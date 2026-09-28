package com.fitness.fitness_api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CreateMealPlanRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotEmpty(message = "At least one meal is required")
    @Valid
    private List<MealRequest> meals;

    @Getter
    @Setter
    public static class MealRequest {

        @NotBlank(message = "Meal name is required")
        private String mealName;

        @NotBlank(message = "Food name is required")
        private String foodName;

        @Min(value = 0, message = "Calories cannot be negative")
        private Integer calories;

        @Min(value = 0, message = "Protein cannot be negative")
        private Double protein;

        @Min(value = 0, message = "Carbs cannot be negative")
        private Double carbs;

        @Min(value = 0, message = "Fats cannot be negative")
        private Double fats;
    }
}