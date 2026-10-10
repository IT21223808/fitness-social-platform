package com.fitness.fitness_api.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UpdateProfileRequest {

    private String firstName;

    private String lastName;

    private String profileImageUrl;
}
