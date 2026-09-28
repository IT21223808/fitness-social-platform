package com.fitness.fitness_api.dto;

import com.fitness.fitness_api.entity.Notification.NotificationType;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class NotificationResponse {

    private Long id;

    private Long actorId;

    private String actorUsername;

    private String actorProfileImageUrl;

    private NotificationType type;

    private String message;

    private Long postId;

    private boolean read;

    private LocalDateTime createdAt;
}