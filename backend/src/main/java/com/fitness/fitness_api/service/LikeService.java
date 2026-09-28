package com.fitness.fitness_api.service;

import com.fitness.fitness_api.entity.Post;
import com.fitness.fitness_api.entity.PostLike;
import com.fitness.fitness_api.entity.User;
import com.fitness.fitness_api.entity.Notification;
import com.fitness.fitness_api.repository.PostLikeRepository;
import com.fitness.fitness_api.repository.PostRepository;
import com.fitness.fitness_api.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LikeService {

    private final PostLikeRepository postLikeRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public String likePost(Long postId, String email) {

        Post post = postRepository.findById(postId)
                .orElseThrow(() ->
                        new RuntimeException("Post not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (postLikeRepository.existsByPostAndUser(post, user)) {
            return "Post already liked";
        }

        PostLike postLike = PostLike.builder()
                .post(post)
                .user(user)
                .build();

        postLikeRepository.save(postLike);

        // Create notification for the post owner
        // Do not notify the user when they like their own post
        if (!post.getUser().getId().equals(user.getId())) {

            notificationService.createNotification(
                    post.getUser(),
                    user,
                    Notification.NotificationType.LIKE,
                    user.getUsername() + " liked your post",
                    post.getId()
            );
        }

        return "Post liked successfully";
    }

    @Transactional
    public String unlikePost(Long postId, String email) {

        Post post = postRepository.findById(postId)
                .orElseThrow(() ->
                        new RuntimeException("Post not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        PostLike postLike = postLikeRepository
                .findByPostAndUser(post, user)
                .orElseThrow(() ->
                        new RuntimeException("Post is not liked"));

        postLikeRepository.delete(postLike);

        return "Post unliked successfully";
    }

    @Transactional(readOnly = true)
    public long getLikeCount(Long postId) {

        Post post = postRepository.findById(postId)
                .orElseThrow(() ->
                        new RuntimeException("Post not found"));

        return postLikeRepository.countByPost(post);
    }

    @Transactional(readOnly = true)
    public boolean isLikedByUser(
            Long postId,
            String email) {

        Post post = postRepository.findById(postId)
                .orElseThrow(() ->
                        new RuntimeException("Post not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return postLikeRepository.existsByPostAndUser(
                post,
                user
        );
    }
}
