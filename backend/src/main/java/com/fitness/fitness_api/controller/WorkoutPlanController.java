package com.fitness.fitness_api.controller;

import com.fitness.fitness_api.dto.CreateWorkoutPlanRequest;
import com.fitness.fitness_api.dto.WorkoutPlanResponse;
import com.fitness.fitness_api.service.WorkoutPlanService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/workout-plans")
@RequiredArgsConstructor
public class WorkoutPlanController {

    private final WorkoutPlanService workoutPlanService;

    @PostMapping(
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<WorkoutPlanResponse> createWorkoutPlan(
            @RequestPart("data")
            @Valid CreateWorkoutPlanRequest request,

            @RequestPart(
                    value = "image",
                    required = false
            )
            MultipartFile image,

            @RequestPart(
                    value = "media",
                    required = false
            )
            List<MultipartFile> media,

            Authentication authentication) throws IOException {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        workoutPlanService.createWorkoutPlan(
                                request,
                                image,
                                media,
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

    @PutMapping(
            value = "/{id}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<WorkoutPlanResponse>
    updateWorkoutPlan(
            @PathVariable Long id,

            @RequestPart("data")
            @Valid CreateWorkoutPlanRequest request,

            @RequestPart(
                    value = "image",
                    required = false
            )
            MultipartFile image,

            Authentication authentication) throws IOException {

        return ResponseEntity.ok(
                workoutPlanService.updateWorkoutPlan(
                        id,
                        request,
                        image,
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