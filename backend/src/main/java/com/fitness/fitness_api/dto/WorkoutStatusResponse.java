package com.fitness.fitness_api.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class WorkoutStatusResponse {

    private Long id;

    private Long postId;

    private Long userId;

    private String username;

    private Double distance;

    private Integer pushUps;

    private Double weight;

    private Integer duration;

    private LocalDate workoutDate;

    private LocalDateTime createdAt;
}