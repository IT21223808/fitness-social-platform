package com.fitness.fitness_api.service;

import com.fitness.fitness_api.dto.CreatePostRequest;
import com.fitness.fitness_api.dto.MediaResponse;
import com.fitness.fitness_api.dto.PostResponse;
import com.fitness.fitness_api.entity.Comment;
import com.fitness.fitness_api.entity.Post;
import com.fitness.fitness_api.entity.PostLike;
import com.fitness.fitness_api.entity.PostMedia;
import com.fitness.fitness_api.entity.User;
import com.fitness.fitness_api.repository.CommentRepository;
import com.fitness.fitness_api.repository.PostLikeRepository;
import com.fitness.fitness_api.repository.PostMediaRepository;
import com.fitness.fitness_api.repository.PostRepository;
import com.fitness.fitness_api.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final PostMediaRepository postMediaRepository;
    private final CommentRepository commentRepository;
    private final PostLikeRepository postLikeRepository;

    public PostResponse createPost(
            CreatePostRequest request,
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Post post = Post.builder()
                .user(user)
                .description(request.getDescription())
                .type(request.getType())
                .build();

        Post savedPost = postRepository.save(post);

        return mapToResponse(savedPost);
    }

    public List<PostResponse> getAllPosts() {

        return postRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private PostResponse mapToResponse(Post post) {

        List<MediaResponse> media = postMediaRepository
                .findByPostOrderByDisplayOrderAsc(post)
                .stream()
                .map(this::mapMediaToResponse)
                .toList();

        return PostResponse.builder()
                .id(post.getId())
                .userId(post.getUser().getId())
                .username(post.getUser().getUsername())
                .description(post.getDescription())
                .type(post.getType())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .media(media)
                .build();
    }

    private MediaResponse mapMediaToResponse(PostMedia media) {

        return MediaResponse.builder()
                .id(media.getId())
                .mediaUrl(media.getMediaUrl())
                .mediaType(media.getMediaType())
                .displayOrder(media.getDisplayOrder())
                .build();
    }

    public PostResponse updatePost(
            Long postId,
            CreatePostRequest request,
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Post post = postRepository.findByIdAndUser(postId, user)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Post not found or you are not the owner"
                        ));

        post.setDescription(request.getDescription());
        post.setType(request.getType());

        Post updatedPost = postRepository.save(post);

        return mapToResponse(updatedPost);
    }

    @Transactional
    public void deletePost(
            Long postId,
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Post post = postRepository.findByIdAndUser(postId, user)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Post not found or you are not the owner"
                        ));

        // 1. Delete comments
        List<Comment> comments =
                commentRepository.findByPostOrderByCreatedAtAsc(post);

        commentRepository.deleteAll(comments);

        // 2. Delete likes
        List<PostLike> likes = postLikeRepository.findAll()
                .stream()
                .filter(like ->
                        like.getPost().getId().equals(post.getId()))
                .toList();

        postLikeRepository.deleteAll(likes);

        // 3. Delete media records
        List<PostMedia> mediaList =
                postMediaRepository.findByPostOrderByDisplayOrderAsc(post);

        postMediaRepository.deleteAll(mediaList);

        // 4. Delete post
        postRepository.delete(post);
    }
}