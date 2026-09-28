package com.fitness.fitness_api.dto;

import com.fitness.fitness_api.entity.PostMedia.MediaType;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MediaResponse {

    private Long id;
    private String mediaUrl;
    private MediaType mediaType;
    private Integer displayOrder;
}