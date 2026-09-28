package com.fitness.fitness_api.repository;

import com.fitness.fitness_api.entity.WorkoutStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WorkoutStatusRepository
        extends JpaRepository<WorkoutStatus, Long> {

    Optional<WorkoutStatus> findByPostId(Long postId);
}