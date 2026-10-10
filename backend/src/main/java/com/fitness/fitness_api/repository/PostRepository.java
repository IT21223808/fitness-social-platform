package com.fitness.fitness_api.repository;

import com.fitness.fitness_api.entity.MealPlan;
import com.fitness.fitness_api.entity.Post;
import com.fitness.fitness_api.entity.User;
import com.fitness.fitness_api.entity.WorkoutPlan;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PostRepository extends JpaRepository<Post, Long> {

    List<Post> findAllByOrderByCreatedAtDesc();

    List<Post> findByUserOrderByCreatedAtDesc(User user);

    Optional<Post> findByIdAndUser(Long id, User user);

    Optional<Post> findByWorkoutPlan(WorkoutPlan workoutPlan);

    Optional<Post> findByMealPlan(MealPlan mealPlan);

    @Query("""
            SELECT p
            FROM Post p
            WHERE p.user.id IN (
                SELECT f.following.id
                FROM Follow f
                WHERE f.follower.id = :userId
            )
            OR p.user.id = :userId
            ORDER BY p.createdAt DESC
            """)
    List<Post> findFeedPosts(@Param("userId") Long userId);
}