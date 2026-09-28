package com.fitness.fitness_api.dto;

import com.fitness.fitness_api.entity.Post.PostType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreatePostRequest {

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Post type is required")
    private PostType type;
}