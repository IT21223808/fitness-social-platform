package com.fitness.fitness_api.controller;

import com.fitness.fitness_api.dto.CommentResponse;
import com.fitness.fitness_api.dto.CreateCommentRequest;
import com.fitness.fitness_api.service.CommentService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts/{postId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping
    public ResponseEntity<CommentResponse> createComment(
            @PathVariable Long postId,
            @Valid @RequestBody CreateCommentRequest request,
            Authentication authentication) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        commentService.createComment(
                                postId,
                                request,
                                authentication.getName()
                        )
                );
    }

    @GetMapping
    public ResponseEntity<List<CommentResponse>> getComments(
            @PathVariable Long postId) {

        return ResponseEntity.ok(
                commentService.getComments(postId)
        );
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<CommentResponse> updateComment(
            @PathVariable Long postId,
            @PathVariable Long commentId,
            @Valid @RequestBody CreateCommentRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                commentService.updateComment(
                        commentId,
                        request,
                        authentication.getName()
                )
        );
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long postId,
            @PathVariable Long commentId,
            Authentication authentication) {

        commentService.deleteComment(
                commentId,
                authentication.getName()
        );

        return ResponseEntity.noContent().build();
    }
    @GetMapping("/count")
public ResponseEntity<Long> getCommentCount(
        @PathVariable Long postId) {

    return ResponseEntity.ok(
            commentService.getCommentCount(postId)
    );
}
}