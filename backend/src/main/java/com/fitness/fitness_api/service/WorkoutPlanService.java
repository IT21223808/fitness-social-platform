package com.fitness.fitness_api.service;

import com.fitness.fitness_api.dto.CreateWorkoutPlanRequest;
import com.fitness.fitness_api.dto.WorkoutPlanResponse;
import com.fitness.fitness_api.entity.User;
import com.fitness.fitness_api.entity.WorkoutExercise;
import com.fitness.fitness_api.entity.WorkoutPlan;
import com.fitness.fitness_api.repository.UserRepository;
import com.fitness.fitness_api.repository.WorkoutPlanRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkoutPlanService {

    private final WorkoutPlanRepository workoutPlanRepository;
    private final UserRepository userRepository;

    @Transactional
    public WorkoutPlanResponse createWorkoutPlan(
            CreateWorkoutPlanRequest request,
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        WorkoutPlan plan = WorkoutPlan.builder()
                .user(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .build();

        List<WorkoutExercise> exercises = new ArrayList<>();

        for (CreateWorkoutPlanRequest.WorkoutExerciseRequest requestExercise
                : request.getExercises()) {

            WorkoutExercise exercise = WorkoutExercise.builder()
                    .workoutPlan(plan)
                    .exerciseName(requestExercise.getExerciseName())
                    .sets(requestExercise.getSets())
                    .reps(requestExercise.getReps())
                    .duration(requestExercise.getDuration())
                    .build();

            exercises.add(exercise);
        }

        plan.setExercises(exercises);

        return mapToResponse(
                workoutPlanRepository.save(plan)
        );
    }

    @Transactional(readOnly = true)
    public List<WorkoutPlanResponse> getAllWorkoutPlans() {

        return workoutPlanRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public WorkoutPlanResponse getWorkoutPlan(Long id) {

        WorkoutPlan plan = workoutPlanRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Workout plan not found"));

        return mapToResponse(plan);
    }

    @Transactional(readOnly = true)
    public List<WorkoutPlanResponse> getMyWorkoutPlans(
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return workoutPlanRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public WorkoutPlanResponse updateWorkoutPlan(
            Long id,
            CreateWorkoutPlanRequest request,
            String email) {

        WorkoutPlan plan = workoutPlanRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Workout plan not found"));

        if (!plan.getUser().getEmail().equals(email)) {
            throw new RuntimeException(
                    "You can only update your own workout plan");
        }

        plan.setTitle(request.getTitle());
        plan.setDescription(request.getDescription());

        plan.getExercises().clear();

        for (CreateWorkoutPlanRequest.WorkoutExerciseRequest requestExercise
                : request.getExercises()) {

            WorkoutExercise exercise = WorkoutExercise.builder()
                    .workoutPlan(plan)
                    .exerciseName(requestExercise.getExerciseName())
                    .sets(requestExercise.getSets())
                    .reps(requestExercise.getReps())
                    .duration(requestExercise.getDuration())
                    .build();

            plan.getExercises().add(exercise);
        }

        return mapToResponse(
                workoutPlanRepository.save(plan)
        );
    }

    @Transactional
    public void deleteWorkoutPlan(
            Long id,
            String email) {

        WorkoutPlan plan = workoutPlanRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Workout plan not found"));

        if (!plan.getUser().getEmail().equals(email)) {
            throw new RuntimeException(
                    "You can only delete your own workout plan");
        }

        workoutPlanRepository.delete(plan);
    }

    private WorkoutPlanResponse mapToResponse(
            WorkoutPlan plan) {

        List<WorkoutPlanResponse.WorkoutExerciseResponse>
                exercises = plan.getExercises()
                .stream()
                .map(exercise ->
                        WorkoutPlanResponse
                                .WorkoutExerciseResponse
                                .builder()
                                .id(exercise.getId())
                                .exerciseName(
                                        exercise.getExerciseName())
                                .sets(exercise.getSets())
                                .reps(exercise.getReps())
                                .duration(exercise.getDuration())
                                .build()
                )
                .toList();

        return WorkoutPlanResponse.builder()
                .id(plan.getId())
                .userId(plan.getUser().getId())
                .username(plan.getUser().getUsername())
                .title(plan.getTitle())
                .description(plan.getDescription())
                .exercises(exercises)
                .createdAt(plan.getCreatedAt())
                .updatedAt(plan.getUpdatedAt())
                .build();
    }
}