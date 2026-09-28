package com.fitness.fitness_api.service;

import com.fitness.fitness_api.dto.CreateWorkoutStatusRequest;
import com.fitness.fitness_api.dto.WorkoutStatusResponse;
import com.fitness.fitness_api.entity.Post;
import com.fitness.fitness_api.entity.User;
import com.fitness.fitness_api.entity.WorkoutStatus;
import com.fitness.fitness_api.repository.PostRepository;
import com.fitness.fitness_api.repository.UserRepository;
import com.fitness.fitness_api.repository.WorkoutStatusRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkoutStatusService {

    private final WorkoutStatusRepository workoutStatusRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    @Transactional
    public WorkoutStatusResponse createWorkoutStatus(
            CreateWorkoutStatusRequest request,
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Post post = Post.builder()
                .user(user)
                .description("Workout Status")
                .type(Post.PostType.WORKOUT_STATUS)
                .build();

        post = postRepository.save(post);

        WorkoutStatus workoutStatus = WorkoutStatus.builder()
                .post(post)
                .distance(request.getDistance())
                .pushUps(request.getPushUps())
                .weight(request.getWeight())
                .duration(request.getDuration())
                .workoutDate(request.getWorkoutDate())
                .build();

        workoutStatus = workoutStatusRepository.save(workoutStatus);

        return mapToResponse(workoutStatus);
    }

    @Transactional(readOnly = true)
    public List<WorkoutStatusResponse> getAllWorkoutStatuses() {

        return workoutStatusRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public WorkoutStatusResponse getWorkoutStatus(Long id) {

        WorkoutStatus workoutStatus =
                workoutStatusRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Workout status not found"));

        return mapToResponse(workoutStatus);
    }

    @Transactional
    public WorkoutStatusResponse updateWorkoutStatus(
            Long id,
            CreateWorkoutStatusRequest request,
            String email) {

        WorkoutStatus workoutStatus =
                workoutStatusRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Workout status not found"));

        if (!workoutStatus.getPost()
                .getUser()
                .getEmail()
                .equals(email)) {

            throw new RuntimeException(
                    "You can only update your own workout status");
        }

        workoutStatus.setDistance(request.getDistance());
        workoutStatus.setPushUps(request.getPushUps());
        workoutStatus.setWeight(request.getWeight());
        workoutStatus.setDuration(request.getDuration());
        workoutStatus.setWorkoutDate(request.getWorkoutDate());

        return mapToResponse(
                workoutStatusRepository.save(workoutStatus));
    }

    @Transactional
    public void deleteWorkoutStatus(
            Long id,
            String email) {

        WorkoutStatus workoutStatus =
                workoutStatusRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Workout status not found"));

        if (!workoutStatus.getPost()
                .getUser()
                .getEmail()
                .equals(email)) {

            throw new RuntimeException(
                    "You can only delete your own workout status");
        }

        Post post = workoutStatus.getPost();

        workoutStatusRepository.delete(workoutStatus);
        postRepository.delete(post);
    }

    private WorkoutStatusResponse mapToResponse(
            WorkoutStatus workoutStatus) {

        Post post = workoutStatus.getPost();
        User user = post.getUser();

        return WorkoutStatusResponse.builder()
                .id(workoutStatus.getId())
                .postId(post.getId())
                .userId(user.getId())
                .username(user.getUsername())
                .distance(workoutStatus.getDistance())
                .pushUps(workoutStatus.getPushUps())
                .weight(workoutStatus.getWeight())
                .duration(workoutStatus.getDuration())
                .workoutDate(workoutStatus.getWorkoutDate())
                .createdAt(workoutStatus.getCreatedAt())
                .build();
    }
}