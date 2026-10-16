package com.fitness.fitness_api.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;
import com.fitness.fitness_api.dto.FollowUserResponse;

@Getter
@Builder
public class FollowUserResponse {

    private Long id;
    private String username;
    private String firstName;
    private String lastName;
    private String profileImageUrl;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String bio;
}