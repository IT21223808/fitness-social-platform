package com.fitness.fitness_api.service;

import com.fitness.fitness_api.dto.CreatePostRequest;
import com.fitness.fitness_api.dto.MediaResponse;
import com.fitness.fitness_api.dto.MealPlanResponse;
import com.fitness.fitness_api.dto.PostResponse;
import com.fitness.fitness_api.dto.WorkoutPlanResponse;
import com.fitness.fitness_api.entity.Comment;
import com.fitness.fitness_api.entity.Meal;
import com.fitness.fitness_api.entity.MealPlan;
import com.fitness.fitness_api.entity.Post;
import com.fitness.fitness_api.entity.PostLike;
import com.fitness.fitness_api.entity.PostMedia;
import com.fitness.fitness_api.entity.User;
import com.fitness.fitness_api.entity.WorkoutExercise;
import com.fitness.fitness_api.entity.WorkoutPlan;
import com.fitness.fitness_api.repository.CommentRepository;
import com.fitness.fitness_api.repository.PostLikeRepository;
import com.fitness.fitness_api.repository.PostMediaRepository;
import com.fitness.fitness_api.repository.PostRepository;
import com.fitness.fitness_api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final PostMediaRepository postMediaRepository;
    private final CommentRepository commentRepository;
    private final PostLikeRepository postLikeRepository;

    @Transactional
    public PostResponse createPost(CreatePostRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = Post.builder()
                .user(user)
                .description(request.getDescription())
                .type(request.getType())
                .build();

        Post savedPost = postRepository.save(post);

        return mapToResponse(savedPost);
    }

    @Transactional(readOnly = true)
    public List<PostResponse> getAllPosts() {
        return postRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private PostResponse mapToResponse(Post post) {

        List<MediaResponse> media = postMediaRepository
                .findByPostOrderByDisplayOrderAsc(post)
                .stream()
                .map(this::mapMediaToResponse)
                .toList();

        WorkoutPlanResponse workoutPlanResponse = null;
        WorkoutPlan workoutPlan = post.getWorkoutPlan();

        if (workoutPlan != null) {
            List<WorkoutPlanResponse.WorkoutExerciseResponse> exercises =
                    workoutPlan.getExercises()
                            .stream()
                            .map(exercise ->
                                    WorkoutPlanResponse.WorkoutExerciseResponse.builder()
                                            .id(exercise.getId())
                                            .exerciseName(exercise.getExerciseName())
                                            .sets(exercise.getSets())
                                            .reps(exercise.getReps())
                                            .duration(exercise.getDuration())
                                            .build()
                            )
                            .toList();

            workoutPlanResponse = WorkoutPlanResponse.builder()
                    .id(workoutPlan.getId())
                    .userId(workoutPlan.getUser().getId())
                    .username(workoutPlan.getUser().getUsername())
                    .title(workoutPlan.getTitle())
                    .description(workoutPlan.getDescription())
                    .imageUrl(workoutPlan.getImageUrl())
                    .exercises(exercises)
                    .createdAt(workoutPlan.getCreatedAt())
                    .updatedAt(workoutPlan.getUpdatedAt())
                    .build();
        }

        MealPlanResponse mealPlanResponse = null;
        MealPlan mealPlan = post.getMealPlan();

        if (mealPlan != null) {
            List<MealPlanResponse.MealResponse> meals =
                    mealPlan.getMeals()
                            .stream()
                            .map(meal ->
                                    MealPlanResponse.MealResponse.builder()
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

            mealPlanResponse = MealPlanResponse.builder()
                    .id(mealPlan.getId())
                    .userId(mealPlan.getUser().getId())
                    .username(mealPlan.getUser().getUsername())
                    .title(mealPlan.getTitle())
                    .description(mealPlan.getDescription())
                    .imageUrl(mealPlan.getImageUrl())
                    .meals(meals)
                    .createdAt(mealPlan.getCreatedAt())
                    .updatedAt(mealPlan.getUpdatedAt())
                    .build();
        }

        return PostResponse.builder()
                .id(post.getId())
                .userId(post.getUser().getId())
                .username(post.getUser().getUsername())
                .description(post.getDescription())
                .type(post.getType())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .media(media)
                .workoutPlan(workoutPlanResponse)
                .mealPlan(mealPlanResponse)
                .build();
    }

    private MediaResponse mapMediaToResponse(PostMedia media) {
        return MediaResponse.builder()
                .id(media.getId())
                .mediaUrl(media.getMediaUrl())
                .mediaType(media.getMediaType())
                .displayOrder(media.getDisplayOrder())
                .build();
    }

    @Transactional
    public PostResponse updatePost(
            Long postId,
            CreatePostRequest request,
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = postRepository.findByIdAndUser(postId, user)
                .orElseThrow(() ->
                        new RuntimeException("Post not found or you are not the owner"));

        post.setDescription(request.getDescription());
        post.setType(request.getType());

        Post updatedPost = postRepository.save(post);

        return mapToResponse(updatedPost);
    }

    @Transactional
    public void deletePost(Long postId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = postRepository.findByIdAndUser(postId, user)
                .orElseThrow(() ->
                        new RuntimeException("Post not found or you are not the owner"));

        deletePostEntity(post);
    }

    @Transactional
    public void deletePostEntity(Post post) {
        List<Comment> comments =
                commentRepository.findByPostOrderByCreatedAtAsc(post);

        commentRepository.deleteAll(comments);

        List<PostLike> likes = postLikeRepository.findAll()
                .stream()
                .filter(like -> like.getPost().getId().equals(post.getId()))
                .toList();

        postLikeRepository.deleteAll(likes);

        List<PostMedia> mediaList =
                postMediaRepository.findByPostOrderByDisplayOrderAsc(post);

        postMediaRepository.deleteAll(mediaList);

        postRepository.delete(post);
    }
}
