package com.fitness.fitness_api.repository;

import com.fitness.fitness_api.entity.Post;
import com.fitness.fitness_api.entity.PostMedia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostMediaRepository extends JpaRepository<PostMedia, Long> {

    List<PostMedia> findByPostOrderByDisplayOrderAsc(Post post);

    long countByPost(Post post);
}