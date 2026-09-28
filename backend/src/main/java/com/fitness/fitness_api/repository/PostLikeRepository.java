package com.fitness.fitness_api.repository;

import com.fitness.fitness_api.entity.Post;
import com.fitness.fitness_api.entity.PostLike;
import com.fitness.fitness_api.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PostLikeRepository
        extends JpaRepository<PostLike, Long> {

    boolean existsByPostAndUser(
            Post post,
            User user
    );

    Optional<PostLike> findByPostAndUser(
            Post post,
            User user
    );

    long countByPost(Post post);
}