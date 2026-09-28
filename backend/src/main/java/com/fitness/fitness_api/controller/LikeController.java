package com.fitness.fitness_api.controller;

import com.fitness.fitness_api.service.LikeService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class LikeController {

    private final LikeService likeService;

    @PostMapping("/{postId}/like")
    public ResponseEntity<String> likePost(
            @PathVariable Long postId,
            Authentication authentication) {

        return ResponseEntity.ok(
                likeService.likePost(
                        postId,
                        authentication.getName()
                )
        );
    }

    @DeleteMapping("/{postId}/like")
    public ResponseEntity<String> unlikePost(
            @PathVariable Long postId,
            Authentication authentication) {

        return ResponseEntity.ok(
                likeService.unlikePost(
                        postId,
                        authentication.getName()
                )
        );
    }

    @GetMapping("/{postId}/likes/count")
    public ResponseEntity<Long> getLikeCount(
            @PathVariable Long postId) {

        return ResponseEntity.ok(
                likeService.getLikeCount(postId)
        );
    }

    @GetMapping("/{postId}/likes/me")
    public ResponseEntity<Boolean> isLikedByMe(
            @PathVariable Long postId,
            Authentication authentication) {

        return ResponseEntity.ok(
                likeService.isLikedByUser(
                        postId,
                        authentication.getName()
                )
        );
    }
}