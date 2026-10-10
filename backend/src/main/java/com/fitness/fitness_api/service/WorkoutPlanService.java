package com.fitness.fitness_api.service;

import com.fitness.fitness_api.dto.CreateWorkoutPlanRequest;
import com.fitness.fitness_api.dto.WorkoutPlanResponse;
import com.fitness.fitness_api.entity.Post;
import com.fitness.fitness_api.entity.User;
import com.fitness.fitness_api.entity.WorkoutExercise;
import com.fitness.fitness_api.entity.WorkoutPlan;
import com.fitness.fitness_api.repository.PostRepository;
import com.fitness.fitness_api.repository.UserRepository;
import com.fitness.fitness_api.repository.WorkoutPlanRepository;

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
public class WorkoutPlanService {

    private final WorkoutPlanRepository workoutPlanRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final MediaService mediaService;

    @Value("${app.upload.dir}")
    private String uploadDirectory;

    private static final long MAX_IMAGE_SIZE = 5 * 1024 * 1024;

    @Transactional
    public WorkoutPlanResponse createWorkoutPlan(
            CreateWorkoutPlanRequest request,
            MultipartFile image,
            List<MultipartFile> media,
            String email) throws IOException {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        WorkoutPlan plan = WorkoutPlan.builder()
                .user(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .build();

        /*
         * This image belongs to the workout plan itself.
         * Existing Workout Plan page can still use this image.
         */
        if (image != null && !image.isEmpty()) {
            String imageUrl = saveImage(image);
            plan.setImageUrl(imageUrl);
        }

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

        WorkoutPlan savedPlan =
                workoutPlanRepository.save(plan);

        /*
         * Create the social post for the workout plan.
         */
        Post post = Post.builder()
                .user(user)
                .description(savedPlan.getDescription())
                .type(Post.PostType.WORKOUT_PLAN)
                .workoutPlan(savedPlan)
                .build();

        Post savedPost = postRepository.save(post);

        /*
         * Media uploaded from Home Create Post
         * belongs to this social post.
         *
         * Maximum 3 image/video files are supported.
         */
        if (media != null && !media.isEmpty()) {

            int displayOrder = 1;

            for (MultipartFile file : media) {

                if (file == null || file.isEmpty()) {
                    continue;
                }

                mediaService.saveMedia(
                        savedPost,
                        file,
                        displayOrder
                );

                displayOrder++;

                if (displayOrder > 3) {
                    break;
                }
            }
        }

        return mapToResponse(savedPlan);
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
            MultipartFile image,
            String email) throws IOException {

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

        if (image != null && !image.isEmpty()) {

            deleteImage(plan.getImageUrl());

            String imageUrl = saveImage(image);

            plan.setImageUrl(imageUrl);
        }

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

        WorkoutPlan updatedPlan =
                workoutPlanRepository.save(plan);

        /*
         * Update the related social post description.
         */
        postRepository
                .findByWorkoutPlan(plan)
                .ifPresent(post -> {

                    post.setDescription(
                            updatedPlan.getDescription());

                    postRepository.save(post);
                });

        return mapToResponse(updatedPlan);
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

        deleteImage(plan.getImageUrl());

        /*
         * Delete related social post first.
         */
        postRepository
                .findByWorkoutPlan(plan)
                .ifPresent(post -> {

                    postRepository.delete(post);
                });

        workoutPlanRepository.delete(plan);
    }

    private String saveImage(
            MultipartFile image) throws IOException {

        if (image.getSize() > MAX_IMAGE_SIZE) {
            throw new RuntimeException(
                    "Image size cannot exceed 5 MB");
        }

        String contentType = image.getContentType();

        if (contentType == null
                || !contentType.startsWith("image/")) {

            throw new RuntimeException(
                    "Only image files are allowed");
        }

        Path uploadPath = Paths.get(uploadDirectory);

        Files.createDirectories(uploadPath);

        String originalFilename =
                image.getOriginalFilename();

        String extension = "";

        if (originalFilename != null
                && originalFilename.contains(".")) {

            extension = originalFilename.substring(
                    originalFilename.lastIndexOf(".")
            );
        }

        String filename =
                UUID.randomUUID() + extension;

        Path filePath =
                uploadPath.resolve(filename);

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
        }
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
                .imageUrl(plan.getImageUrl())
                .exercises(exercises)
                .createdAt(plan.getCreatedAt())
                .updatedAt(plan.getUpdatedAt())
                .build();
    }
}