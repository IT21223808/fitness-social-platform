package com.fitness.fitness_api.service;

import com.fitness.fitness_api.dto.FollowUserResponse;
import com.fitness.fitness_api.entity.Follow;
import com.fitness.fitness_api.entity.User;
import com.fitness.fitness_api.repository.FollowRepository;
import com.fitness.fitness_api.repository.UserRepository;
import com.fitness.fitness_api.entity.Notification;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
public void follow(Long targetUserId, String currentUserEmail) {

    User follower = userRepository.findByEmail(currentUserEmail)
            .orElseThrow(() ->
                    new RuntimeException("Current user not found"));

    User following = userRepository.findById(targetUserId)
            .orElseThrow(() ->
                    new RuntimeException("User not found"));

    if (follower.getId().equals(following.getId())) {
        throw new RuntimeException("You cannot follow yourself");
    }

    if (followRepository.existsByFollowerAndFollowing(
            follower, following)) {

        throw new RuntimeException(
                "Already following this user");
    }

    Follow follow = Follow.builder()
            .follower(follower)
            .following(following)
            .build();

    followRepository.save(follow);

    notificationService.createNotification(
            following,
            follower,
            Notification.NotificationType.FOLLOW,
            follower.getUsername() + " started following you",
            null
    );
}

    @Transactional
    public void unfollow(Long targetUserId, String currentUserEmail) {

        User follower = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() ->
                        new RuntimeException("Current user not found"));

        User following = userRepository.findById(targetUserId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (!followRepository.existsByFollowerAndFollowing(
                follower, following)) {

            throw new RuntimeException(
                    "You are not following this user");
        }

        followRepository.deleteByFollowerAndFollowing(
                follower,
                following
        );
    }

    @Transactional(readOnly = true)
    public List<FollowUserResponse> getFollowers(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return followRepository.findByFollowing(user)
                .stream()
                .map(follow -> mapUser(follow.getFollower()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<FollowUserResponse> getFollowing(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return followRepository.findByFollower(user)
                .stream()
                .map(follow -> mapUser(follow.getFollowing()))
                .toList();
    }

    @Transactional(readOnly = true)
    public long getFollowersCount(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return followRepository.countByFollowing(user);
    }

    @Transactional(readOnly = true)
    public long getFollowingCount(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return followRepository.countByFollower(user);
    }

    private FollowUserResponse mapUser(User user) {

        return FollowUserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .profileImageUrl(user.getProfileImageUrl())
                .build();
    }
}