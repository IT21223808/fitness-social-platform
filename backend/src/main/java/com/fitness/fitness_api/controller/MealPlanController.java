package com.fitness.fitness_api.controller;

import com.fitness.fitness_api.dto.CreateMealPlanRequest;
import com.fitness.fitness_api.dto.MealPlanResponse;
import com.fitness.fitness_api.service.MealPlanService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/meal-plans")
@RequiredArgsConstructor
public class MealPlanController {

    private final MealPlanService mealPlanService;

    @PostMapping
    public ResponseEntity<MealPlanResponse> createMealPlan(
            @Valid @RequestBody CreateMealPlanRequest request,
            Authentication authentication) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        mealPlanService.createMealPlan(
                                request,
                                authentication.getName()
                        )
                );
    }

    @GetMapping
    public ResponseEntity<List<MealPlanResponse>>
    getAllMealPlans() {

        return ResponseEntity.ok(
                mealPlanService.getAllMealPlans()
        );
    }

    @GetMapping("/my")
    public ResponseEntity<List<MealPlanResponse>>
    getMyMealPlans(
            Authentication authentication) {

        return ResponseEntity.ok(
                mealPlanService.getMyMealPlans(
                        authentication.getName()
                )
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<MealPlanResponse>
    getMealPlan(@PathVariable Long id) {

        return ResponseEntity.ok(
                mealPlanService.getMealPlan(id)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<MealPlanResponse>
    updateMealPlan(
            @PathVariable Long id,
            @Valid @RequestBody CreateMealPlanRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                mealPlanService.updateMealPlan(
                        id,
                        request,
                        authentication.getName()
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMealPlan(
            @PathVariable Long id,
            Authentication authentication) {

        mealPlanService.deleteMealPlan(
                id,
                authentication.getName()
        );

        return ResponseEntity.noContent().build();
    }
}