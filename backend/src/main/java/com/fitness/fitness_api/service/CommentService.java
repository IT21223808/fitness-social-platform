package com.fitness.fitness_api.service;

import com.fitness.fitness_api.dto.CommentResponse;
import com.fitness.fitness_api.dto.CreateCommentRequest;
import com.fitness.fitness_api.entity.Comment;
import com.fitness.fitness_api.entity.Notification;
import com.fitness.fitness_api.entity.Post;
import com.fitness.fitness_api.entity.User;
import com.fitness.fitness_api.repository.CommentRepository;
import com.fitness.fitness_api.repository.PostRepository;
import com.fitness.fitness_api.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public CommentResponse createComment(
            Long postId,
            CreateCommentRequest request,
            String email) {

        User user = getUser(email);

        Post post = postRepository.findById(postId)
                .orElseThrow(() ->
                        new RuntimeException("Post not found"));

        Comment comment = Comment.builder()
                .post(post)
                .user(user)
                .content(request.getContent())
                .build();

        Comment savedComment = commentRepository.save(comment);

        // Notify post owner
        // Do not notify when user comments on their own post
        if (!post.getUser().getId().equals(user.getId())) {

            notificationService.createNotification(
                    post.getUser(),
                    user,
                    Notification.NotificationType.COMMENT,
                    user.getUsername() + " commented on your post",
                    post.getId()
            );
        }

        return mapToResponse(savedComment);
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getComments(Long postId) {

        Post post = postRepository.findById(postId)
                .orElseThrow(() ->
                        new RuntimeException("Post not found"));

        return commentRepository
                .findByPostOrderByCreatedAtAsc(post)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }
    @Transactional(readOnly = true)
public long getCommentCount(Long postId) {

    Post post = postRepository.findById(postId)
            .orElseThrow(() ->
                    new RuntimeException("Post not found"));

    return commentRepository.countByPost(post);
}

    @Transactional
    public CommentResponse updateComment(
            Long commentId,
            CreateCommentRequest request,
            String email) {

        User user = getUser(email);

        Comment comment = commentRepository
                .findByIdAndUser(commentId, user)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Comment not found or you are not the owner"));

        comment.setContent(request.getContent());

        return mapToResponse(
                commentRepository.save(comment));
    }

    @Transactional
    public void deleteComment(
            Long commentId,
            String email) {

        User user = getUser(email);

        Comment comment = commentRepository
                .findById(commentId)
                .orElseThrow(() ->
                        new RuntimeException("Comment not found"));

        boolean isCommentOwner =
                comment.getUser().getId()
                        .equals(user.getId());

        boolean isPostOwner =
                comment.getPost().getUser().getId()
                        .equals(user.getId());

        if (!isCommentOwner && !isPostOwner) {
            throw new RuntimeException(
                    "You are not allowed to delete this comment");
        }

        commentRepository.delete(comment);
    }

    private User getUser(String email) {

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));
    }

    private CommentResponse mapToResponse(Comment comment) {

        return CommentResponse.builder()
                .id(comment.getId())
                .postId(comment.getPost().getId())
                .userId(comment.getUser().getId())
                .username(comment.getUser().getUsername())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }
}