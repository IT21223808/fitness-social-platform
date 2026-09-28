package com.fitness.fitness_api.repository;

import com.fitness.fitness_api.entity.Follow;
import com.fitness.fitness_api.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FollowRepository
        extends JpaRepository<Follow, Long> {

    boolean existsByFollowerAndFollowing(
            User follower,
            User following
    );

    void deleteByFollowerAndFollowing(
            User follower,
            User following
    );

    Optional<Follow> findByFollowerAndFollowing(
            User follower,
            User following
    );

    List<Follow> findByFollowing(User following);

    List<Follow> findByFollower(User follower);

    long countByFollowing(User following);

    long countByFollower(User follower);
}