package com.fitness.fitness_api.controller;

import com.fitness.fitness_api.dto.FollowUserResponse;
import com.fitness.fitness_api.dto.PostResponse;
import com.fitness.fitness_api.entity.Post.PostType;
import com.fitness.fitness_api.service.ExploreService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/explore")
@RequiredArgsConstructor
@Validated
public class ExploreController {

    private final ExploreService exploreService;

    @GetMapping("/posts")
    public ResponseEntity<Page<PostResponse>> getPosts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) PostType type,
            @RequestParam(defaultValue = "RECENT") ExploreService.Sort sort,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(50) int size,
            Authentication authentication) {

        return ResponseEntity.ok(exploreService.getPosts(
                search,
                type,
                sort,
                page,
                size,
                authentication.getName()));
    }

    @GetMapping("/users")
    public ResponseEntity<Page<FollowUserResponse>> getUsers(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "8") @Min(1) @Max(50) int size,
            Authentication authentication) {

        return ResponseEntity.ok(exploreService.getUsers(
                search,
                page,
                size,
                authentication.getName()));
    }
}
