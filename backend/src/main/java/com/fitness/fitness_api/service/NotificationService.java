package com.fitness.fitness_api.service;

import com.fitness.fitness_api.dto.NotificationResponse;
import com.fitness.fitness_api.entity.Notification;
import com.fitness.fitness_api.entity.User;
import com.fitness.fitness_api.repository.NotificationRepository;
import com.fitness.fitness_api.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional
    public void createNotification(
            User user,
            User actor,
            Notification.NotificationType type,
            String message,
            Long postId) {

        Notification notification = Notification.builder()
                .user(user)
                .actor(actor)
                .type(type)
                .message(message)
                .postId(postId)
                .read(false)
                .build();

        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications(
            String email) {

        User user = getUser(email);

        return notificationRepository
                .findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(String email) {

        User user = getUser(email);

        return notificationRepository
                .countByUserAndReadFalse(user);
    }

    @Transactional
    public void markAsRead(
            Long notificationId,
            String email) {

        User user = getUser(email);

        Notification notification =
                notificationRepository
                        .findById(notificationId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Notification not found"));

        if (!notification.getUser()
                .getId()
                .equals(user.getId())) {

            throw new RuntimeException(
                    "You can only update your own notifications");
        }

        notification.setRead(true);

        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(String email) {

        User user = getUser(email);

        List<Notification> notifications =
                notificationRepository
                        .findByUserOrderByCreatedAtDesc(user);

        notifications.forEach(
                notification -> notification.setRead(true)
        );

        notificationRepository.saveAll(notifications);
    }

    @Transactional
    public void deleteNotification(
            Long notificationId,
            String email) {

        User user = getUser(email);

        Notification notification =
                notificationRepository
                        .findById(notificationId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Notification not found"));

        if (!notification.getUser()
                .getId()
                .equals(user.getId())) {

            throw new RuntimeException(
                    "You can only delete your own notifications");
        }

        notificationRepository.delete(notification);
    }

    private User getUser(String email) {

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));
    }

    private NotificationResponse mapToResponse(
            Notification notification) {

        User actor = notification.getActor();

        return NotificationResponse.builder()
                .id(notification.getId())
                .actorId(
                        actor != null
                                ? actor.getId()
                                : null
                )
                .actorUsername(
                        actor != null
                                ? actor.getUsername()
                                : null
                )
                .actorProfileImageUrl(
                        actor != null
                                ? actor.getProfileImageUrl()
                                : null
                )
                .type(notification.getType())
                .message(notification.getMessage())
                .postId(notification.getPostId())
                .read(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}