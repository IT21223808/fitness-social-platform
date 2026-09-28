package com.fitness.fitness_api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CreateWorkoutPlanRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotEmpty(message = "At least one exercise is required")
    @Valid
    private List<WorkoutExerciseRequest> exercises;

    @Getter
    @Setter
    public static class WorkoutExerciseRequest {

        @NotBlank(message = "Exercise name is required")
        private String exerciseName;

        @NotNull(message = "Sets are required")
        @Min(value = 1, message = "Sets must be at least 1")
        private Integer sets;

        @NotNull(message = "Reps are required")
        @Min(value = 1, message = "Reps must be at least 1")
        private Integer reps;

        @Min(value = 0, message = "Duration cannot be negative")
        private Integer duration;
    }
}