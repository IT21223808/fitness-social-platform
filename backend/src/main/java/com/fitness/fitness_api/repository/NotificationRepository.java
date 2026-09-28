package com.fitness.fitness_api.repository;

import com.fitness.fitness_api.entity.Notification;
import com.fitness.fitness_api.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    List<Notification> findByUserOrderByCreatedAtDesc(
            User user
    );

    long countByUserAndReadFalse(
            User user
    );
}