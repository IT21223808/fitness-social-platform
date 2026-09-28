package com.fitness.fitness_api.dto;

import lombok.Getter;
import lombok.Builder;

@Getter
@Builder
public class LoginResponse {
    private String token;
    private UserResponse user;
    private String tokenType;
}
