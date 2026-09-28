package com.fitness.fitness_api.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class CommentResponse {

    private Long id;

    private Long postId;

    private Long userId;

    private String username;

    private String content;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}