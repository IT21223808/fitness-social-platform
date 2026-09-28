package com.fitness.fitness_api.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class WorkoutPlanResponse {

    private Long id;

    private Long userId;

    private String username;

    private String title;

    private String description;

    private List<WorkoutExerciseResponse> exercises;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @Getter
    @Builder
    public static class WorkoutExerciseResponse {

        private Long id;

        private String exerciseName;

        private Integer sets;

        private Integer reps;

        private Integer duration;
    }
}