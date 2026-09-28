package com.fitness.fitness_api.controller;

import com.fitness.fitness_api.dto.CreateWorkoutPlanRequest;
import com.fitness.fitness_api.dto.WorkoutPlanResponse;
import com.fitness.fitness_api.service.WorkoutPlanService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workout-plans")
@RequiredArgsConstructor
public class WorkoutPlanController {

    private final WorkoutPlanService workoutPlanService;

    @PostMapping
    public ResponseEntity<WorkoutPlanResponse> createWorkoutPlan(
            @Valid @RequestBody CreateWorkoutPlanRequest request,
            Authentication authentication) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        workoutPlanService.createWorkoutPlan(
                                request,
                                authentication.getName()
                        )
                );
    }

    @GetMapping
    public ResponseEntity<List<WorkoutPlanResponse>>
    getAllWorkoutPlans() {

        return ResponseEntity.ok(
                workoutPlanService.getAllWorkoutPlans()
        );
    }

    @GetMapping("/my")
    public ResponseEntity<List<WorkoutPlanResponse>>
    getMyWorkoutPlans(
            Authentication authentication) {

        return ResponseEntity.ok(
                workoutPlanService.getMyWorkoutPlans(
                        authentication.getName()
                )
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkoutPlanResponse>
    getWorkoutPlan(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                workoutPlanService.getWorkoutPlan(id)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkoutPlanResponse>
    updateWorkoutPlan(
            @PathVariable Long id,
            @Valid @RequestBody CreateWorkoutPlanRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                workoutPlanService.updateWorkoutPlan(
                        id,
                        request,
                        authentication.getName()
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkoutPlan(
            @PathVariable Long id,
            Authentication authentication) {

        workoutPlanService.deleteWorkoutPlan(
                id,
                authentication.getName()
        );

        return ResponseEntity.noContent().build();
    }
}