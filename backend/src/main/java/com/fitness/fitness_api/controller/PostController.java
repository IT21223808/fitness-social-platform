package com.fitness.fitness_api.controller;

import com.fitness.fitness_api.dto.CreatePostRequest;
import com.fitness.fitness_api.dto.PostResponse;
import com.fitness.fitness_api.entity.Post;
import com.fitness.fitness_api.repository.PostRepository;
import com.fitness.fitness_api.service.MediaService;
import com.fitness.fitness_api.service.PostService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;
    private final MediaService mediaService;
    private final PostRepository postRepository;

    @PostMapping
    public ResponseEntity<PostResponse> createPost(
            @Valid @RequestBody CreatePostRequest request,
            Authentication authentication) {

        PostResponse response = postService.createPost(
                request,
                authentication.getName());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<PostResponse>> getAllPosts() {

        return ResponseEntity.ok(
                postService.getAllPosts());
    }

    @PutMapping("/{id}")
    public ResponseEntity<PostResponse> updatePost(
            @PathVariable Long id,
            @Valid @RequestBody CreatePostRequest request,
            Authentication authentication) {

        PostResponse response = postService.updatePost(
                id,
                request,
                authentication.getName());

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(
            @PathVariable Long id,
            Authentication authentication) {

        postService.deletePost(
                id,
                authentication.getName());

        return ResponseEntity.noContent().build();
    }

   @PostMapping("/{postId}/media")
public ResponseEntity<String> uploadMedia(
        @PathVariable Long postId,
        @RequestParam("file") MultipartFile file,
        @RequestParam("displayOrder") int displayOrder,
        Authentication authentication) throws Exception {

    Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));

    if (!post.getUser().getEmail()
            .equals(authentication.getName())) {

        return ResponseEntity.status(403)
                .body("You can only upload media to your own post");
    }

    mediaService.saveMedia(
            post,
            file,
            displayOrder);

    return ResponseEntity.ok(
            "Media uploaded successfully");
}
}