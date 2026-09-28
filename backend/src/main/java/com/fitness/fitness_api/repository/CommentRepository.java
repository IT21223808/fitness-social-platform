package com.fitness.fitness_api.repository;

import com.fitness.fitness_api.entity.Comment;
import com.fitness.fitness_api.entity.Post;
import com.fitness.fitness_api.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByPostOrderByCreatedAtAsc(Post post);

    Optional<Comment> findByIdAndUser(Long id, User user);

    List<Comment> findByUserOrderByCreatedAtDesc(User user);

        long countByPost(Post post);
}