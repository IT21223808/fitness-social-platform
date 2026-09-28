package com.fitness.fitness_api.controller;

import com.fitness.fitness_api.dto.CreateWorkoutStatusRequest;
import com.fitness.fitness_api.dto.WorkoutStatusResponse;
import com.fitness.fitness_api.service.WorkoutStatusService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workout-status")
@RequiredArgsConstructor
public class WorkoutStatusController {

    private final WorkoutStatusService workoutStatusService;

    @PostMapping
    public ResponseEntity<WorkoutStatusResponse> createWorkoutStatus(
            @Valid @RequestBody CreateWorkoutStatusRequest request,
            Authentication authentication) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        workoutStatusService.createWorkoutStatus(
                                request,
                                authentication.getName()
                        )
                );
    }

    @GetMapping
    public ResponseEntity<List<WorkoutStatusResponse>>
    getAllWorkoutStatuses() {

        return ResponseEntity.ok(
                workoutStatusService.getAllWorkoutStatuses()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkoutStatusResponse>
    getWorkoutStatus(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                workoutStatusService.getWorkoutStatus(id)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkoutStatusResponse>
    updateWorkoutStatus(
            @PathVariable Long id,
            @Valid @RequestBody CreateWorkoutStatusRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                workoutStatusService.updateWorkoutStatus(
                        id,
                        request,
                        authentication.getName()
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkoutStatus(
            @PathVariable Long id,
            Authentication authentication) {

        workoutStatusService.deleteWorkoutStatus(
                id,
                authentication.getName()
        );

        return ResponseEntity.noContent().build();
    }
}