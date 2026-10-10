package com.fitness.fitness_api.service;

import com.fitness.fitness_api.dto.MealPlanResponse;
import com.fitness.fitness_api.dto.MediaResponse;
import com.fitness.fitness_api.dto.PostResponse;
import com.fitness.fitness_api.dto.WorkoutPlanResponse;
import com.fitness.fitness_api.entity.Post;
import com.fitness.fitness_api.entity.PostMedia;
import com.fitness.fitness_api.entity.User;
import com.fitness.fitness_api.entity.MealPlan;
import com.fitness.fitness_api.entity.WorkoutPlan;
import com.fitness.fitness_api.repository.PostMediaRepository;
import com.fitness.fitness_api.repository.PostRepository;
import com.fitness.fitness_api.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FeedService {

    private final PostRepository postRepository;
    private final PostMediaRepository postMediaRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public PostResponse mapToResponse(Post post) {

        List<MediaResponse> media = postMediaRepository
                .findByPostOrderByDisplayOrderAsc(post)
                .stream()
                .map(item -> MediaResponse.builder()
                        .id(item.getId())
                        .mediaUrl(item.getMediaUrl())
                        .mediaType(item.getMediaType())
                        .displayOrder(item.getDisplayOrder())
                        .build())
                .toList();

        WorkoutPlanResponse workoutPlan = null;

        if (post.getWorkoutPlan() != null) {
            workoutPlan = mapWorkoutPlanToResponse(
                    post.getWorkoutPlan()
            );
        }

        MealPlanResponse mealPlan = null;

        if (post.getMealPlan() != null) {
            mealPlan = mapMealPlanToResponse(
                    post.getMealPlan()
            );
        }

        return PostResponse.builder()
                .id(post.getId())
                .userId(post.getUser().getId())
                .username(post.getUser().getUsername())
                .description(post.getDescription())
                .type(post.getType())
                .media(media)
                .workoutPlan(workoutPlan)
                .mealPlan(mealPlan)
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public List<PostResponse> getFeed(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        List<Post> posts =
                postRepository.findFeedPosts(user.getId());

        return posts.stream()
                .map(this::mapToResponse)
                .toList();
    }

    private WorkoutPlanResponse mapWorkoutPlanToResponse(
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
                .imageUrl(plan.getImageUrl())
                .exercises(exercises)
                .createdAt(plan.getCreatedAt())
                .updatedAt(plan.getUpdatedAt())
                .build();
    }

    private MealPlanResponse mapMealPlanToResponse(
            MealPlan plan) {

        List<MealPlanResponse.MealResponse> meals =
                plan.getMeals()
                        .stream()
                        .map(meal ->
                                MealPlanResponse.MealResponse
                                        .builder()
                                        .id(meal.getId())
                                        .mealName(
                                                meal.getMealName())
                                        .foodName(
                                                meal.getFoodName())
                                        .calories(
                                                meal.getCalories())
                                        .protein(
                                                meal.getProtein())
                                        .carbs(
                                                meal.getCarbs())
                                        .fats(
                                                meal.getFats())
                                        .build()
                        )
                        .toList();

        return MealPlanResponse.builder()
                .id(plan.getId())
                .userId(plan.getUser().getId())
                .username(plan.getUser().getUsername())
                .title(plan.getTitle())
                .description(plan.getDescription())
                .imageUrl(plan.getImageUrl())
                .meals(meals)
                .createdAt(plan.getCreatedAt())
                .updatedAt(plan.getUpdatedAt())
                .build();
    }
}