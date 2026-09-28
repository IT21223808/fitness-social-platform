package com.fitness.fitness_api.controller;

import com.fitness.fitness_api.dto.PostResponse;
import com.fitness.fitness_api.service.FeedService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feed")
@RequiredArgsConstructor
public class FeedController {

    private final FeedService feedService;

    @GetMapping
    public ResponseEntity<List<PostResponse>> getFeed(
            Authentication authentication) {

        return ResponseEntity.ok(
                feedService.getFeed(
                        authentication.getName()
                )
        );
    }
}