package com.fitness.fitness_api.service;

import com.fitness.fitness_api.dto.CreateMealPlanRequest;
import com.fitness.fitness_api.dto.MealPlanResponse;
import com.fitness.fitness_api.entity.Meal;
import com.fitness.fitness_api.entity.MealPlan;
import com.fitness.fitness_api.entity.User;
import com.fitness.fitness_api.repository.MealPlanRepository;
import com.fitness.fitness_api.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MealPlanService {

    private final MealPlanRepository mealPlanRepository;
    private final UserRepository userRepository;

    @Transactional
    public MealPlanResponse createMealPlan(
            CreateMealPlanRequest request,
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        MealPlan plan = MealPlan.builder()
                .user(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .build();

        List<Meal> meals = new ArrayList<>();

        for (CreateMealPlanRequest.MealRequest requestMeal
                : request.getMeals()) {

            Meal meal = Meal.builder()
                    .mealPlan(plan)
                    .mealName(requestMeal.getMealName())
                    .foodName(requestMeal.getFoodName())
                    .calories(requestMeal.getCalories())
                    .protein(requestMeal.getProtein())
                    .carbs(requestMeal.getCarbs())
                    .fats(requestMeal.getFats())
                    .build();

            meals.add(meal);
        }

        plan.setMeals(meals);

        return mapToResponse(
                mealPlanRepository.save(plan)
        );
    }

    @Transactional(readOnly = true)
    public List<MealPlanResponse> getAllMealPlans() {

        return mealPlanRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public MealPlanResponse getMealPlan(Long id) {

        MealPlan plan = mealPlanRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Meal plan not found"));

        return mapToResponse(plan);
    }

    @Transactional(readOnly = true)
    public List<MealPlanResponse> getMyMealPlans(
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return mealPlanRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public MealPlanResponse updateMealPlan(
            Long id,
            CreateMealPlanRequest request,
            String email) {

        MealPlan plan = mealPlanRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Meal plan not found"));

        if (!plan.getUser().getEmail().equals(email)) {
            throw new RuntimeException(
                    "You can only update your own meal plan");
        }

        plan.setTitle(request.getTitle());
        plan.setDescription(request.getDescription());

        plan.getMeals().clear();

        for (CreateMealPlanRequest.MealRequest requestMeal
                : request.getMeals()) {

            Meal meal = Meal.builder()
                    .mealPlan(plan)
                    .mealName(requestMeal.getMealName())
                    .foodName(requestMeal.getFoodName())
                    .calories(requestMeal.getCalories())
                    .protein(requestMeal.getProtein())
                    .carbs(requestMeal.getCarbs())
                    .fats(requestMeal.getFats())
                    .build();

            plan.getMeals().add(meal);
        }

        return mapToResponse(
                mealPlanRepository.save(plan)
        );
    }

    @Transactional
    public void deleteMealPlan(
            Long id,
            String email) {

        MealPlan plan = mealPlanRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Meal plan not found"));

        if (!plan.getUser().getEmail().equals(email)) {
            throw new RuntimeException(
                    "You can only delete your own meal plan");
        }

        mealPlanRepository.delete(plan);
    }

    private MealPlanResponse mapToResponse(
            MealPlan plan) {

        List<MealPlanResponse.MealResponse> meals =
                plan.getMeals()
                        .stream()
                        .map(meal ->
                                MealPlanResponse.MealResponse
                                        .builder()
                                        .id(meal.getId())
                                        .mealName(meal.getMealName())
                                        .foodName(meal.getFoodName())
                                        .calories(meal.getCalories())
                                        .protein(meal.getProtein())
                                        .carbs(meal.getCarbs())
                                        .fats(meal.getFats())
                                        .build()
                        )
                        .toList();

        return MealPlanResponse.builder()
                .id(plan.getId())
                .userId(plan.getUser().getId())
                .username(plan.getUser().getUsername())
                .title(plan.getTitle())
                .description(plan.getDescription())
                .meals(meals)
                .createdAt(plan.getCreatedAt())
                .updatedAt(plan.getUpdatedAt())
                .build();
    }
}