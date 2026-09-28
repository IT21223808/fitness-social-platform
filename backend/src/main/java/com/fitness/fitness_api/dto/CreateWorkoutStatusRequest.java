package com.fitness.fitness_api.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CreateWorkoutStatusRequest {

    @DecimalMin(
            value = "0.0",
            inclusive = true,
            message = "Distance cannot be negative"
    )
    private Double distance;

    @Min(
            value = 0,
            message = "Push-ups cannot be negative"
    )
    private Integer pushUps;

    @DecimalMin(
            value = "0.0",
            inclusive = true,
            message = "Weight cannot be negative"
    )
    private Double weight;

    @Min(
            value = 0,
            message = "Duration cannot be negative"
    )
    private Integer duration;

    @NotNull(message = "Workout date is required")
    private LocalDate workoutDate;
}