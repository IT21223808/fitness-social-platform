package com.fitness.fitness_api.service;

import com.fitness.fitness_api.dto.CreateMealPlanRequest;
import com.fitness.fitness_api.dto.MealPlanResponse;
import com.fitness.fitness_api.entity.Meal;
import com.fitness.fitness_api.entity.MealPlan;
import com.fitness.fitness_api.entity.Post;
import com.fitness.fitness_api.entity.User;
import com.fitness.fitness_api.repository.MealPlanRepository;
import com.fitness.fitness_api.repository.PostRepository;
import com.fitness.fitness_api.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MealPlanService {

    private final MealPlanRepository mealPlanRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final MediaService mediaService;

    @Value("${app.upload.dir}")
    private String uploadDirectory;

    private static final long MAX_IMAGE_SIZE =
            5 * 1024 * 1024;

    @Transactional
    public MealPlanResponse createMealPlan(
            CreateMealPlanRequest request,
            MultipartFile image,
            List<MultipartFile> media,
            String email) throws IOException {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        MealPlan plan = MealPlan.builder()
                .user(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .build();

        // Save meal plan image
        if (image != null && !image.isEmpty()) {
            String imageUrl = saveImage(image);
            plan.setImageUrl(imageUrl);
        }

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

        MealPlan savedPlan =
                mealPlanRepository.save(plan);

        // Create social post for the meal plan
        Post post = Post.builder()
                .user(user)
                .description(savedPlan.getDescription())
                .type(Post.PostType.MEAL_PLAN)
                .mealPlan(savedPlan)
                .build();

        Post savedPost = postRepository.save(post);

        // Save social post image/video media
        if (media != null && !media.isEmpty()) {

            int displayOrder = 1;

            for (MultipartFile file : media) {

                if (displayOrder > 3) {
                    break;
                }

                if (file != null && !file.isEmpty()) {

                    mediaService.saveMedia(
                            savedPost,
                            file,
                            displayOrder
                    );

                    displayOrder++;
                }
            }
        }

        return mapToResponse(savedPlan);
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
                        new RuntimeException(
                                "Meal plan not found"));

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
            MultipartFile image,
            String email) throws IOException {

        MealPlan plan = mealPlanRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Meal plan not found"));

        if (!plan.getUser().getEmail().equals(email)) {
            throw new RuntimeException(
                    "You can only update your own meal plan");
        }

        plan.setTitle(request.getTitle());
        plan.setDescription(request.getDescription());

        // Replace image if a new image is uploaded
        if (image != null && !image.isEmpty()) {

            deleteImage(plan.getImageUrl());

            String imageUrl = saveImage(image);

            plan.setImageUrl(imageUrl);
        }

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

        MealPlan updatedPlan =
                mealPlanRepository.save(plan);

        // Update related social post
        postRepository
                .findByMealPlan(plan)
                .ifPresent(post -> {

                    post.setDescription(
                            updatedPlan.getDescription());

                    postRepository.save(post);
                });

        return mapToResponse(updatedPlan);
    }

    @Transactional
    public void deleteMealPlan(
            Long id,
            String email) {

        MealPlan plan = mealPlanRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Meal plan not found"));

        if (!plan.getUser().getEmail().equals(email)) {
            throw new RuntimeException(
                    "You can only delete your own meal plan");
        }

        deleteImage(plan.getImageUrl());

        // Delete related social post first
        postRepository
                .findByMealPlan(plan)
                .ifPresent(post -> {

                    postRepository.delete(post);
                });

        mealPlanRepository.delete(plan);
    }

    private String saveImage(
            MultipartFile image) throws IOException {

        // Check file size
        if (image.getSize() > MAX_IMAGE_SIZE) {
            throw new RuntimeException(
                    "Image size cannot exceed 5 MB");
        }

        // Check image type
        String contentType = image.getContentType();

        if (contentType == null
                || !contentType.startsWith("image/")) {

            throw new RuntimeException(
                    "Only image files are allowed");
        }

        // Create uploads directory
        Path uploadPath = Paths.get(uploadDirectory);

        Files.createDirectories(uploadPath);

        // Get file extension
        String originalFilename =
                image.getOriginalFilename();

        String extension = "";

        if (originalFilename != null
                && originalFilename.contains(".")) {

            extension = originalFilename.substring(
                    originalFilename.lastIndexOf(".")
            );
        }

        // Generate unique filename
        String filename =
                UUID.randomUUID() + extension;

        Path filePath =
                uploadPath.resolve(filename);

        // Save image
        try (InputStream inputStream =
                     image.getInputStream()) {

            Files.copy(inputStream, filePath);
        }

        return "/uploads/" + filename;
    }

    private void deleteImage(String imageUrl) {

        if (imageUrl == null
                || !imageUrl.startsWith("/uploads/")) {
            return;
        }

        String filename =
                imageUrl.substring("/uploads/".length());

        Path filePath =
                Paths.get(uploadDirectory)
                        .resolve(filename);

        try {
            Files.deleteIfExists(filePath);
        } catch (IOException ignored) {
            // Ignore file deletion errors
        }
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