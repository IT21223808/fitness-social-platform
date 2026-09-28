package com.fitness.fitness_api.controller;

import com.fitness.fitness_api.dto.FollowUserResponse;
import com.fitness.fitness_api.dto.UserResponse;
import com.fitness.fitness_api.entity.User;
import com.fitness.fitness_api.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.fitness.fitness_api.service.FollowService;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final FollowService followService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        UserResponse response = UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .profileImageUrl(user.getProfileImageUrl())
                .build();

        return ResponseEntity.ok(response);
    }
    @GetMapping("/{id}")
public ResponseEntity<UserResponse> getUserById(
        @PathVariable Long id) {

    User user = userRepository.findById(id)
            .orElseThrow(() ->
                    new RuntimeException("User not found"));

    UserResponse response = UserResponse.builder()
            .id(user.getId())
            .username(user.getUsername())
            .email(user.getEmail())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .profileImageUrl(user.getProfileImageUrl())
            .build();

    return ResponseEntity.ok(response);
}
@PostMapping("/{id}/follow")
public ResponseEntity<String> followUser(
        @PathVariable Long id,
        Authentication authentication) {

    followService.follow(
            id,
            authentication.getName()
    );

    return ResponseEntity.ok("User followed successfully");
}

@DeleteMapping("/{id}/follow")
public ResponseEntity<String> unfollowUser(
        @PathVariable Long id,
        Authentication authentication) {

    followService.unfollow(
            id,
            authentication.getName()
    );

    return ResponseEntity.ok("User unfollowed successfully");
}
@GetMapping("/{id}/followers")
public ResponseEntity<List<FollowUserResponse>> getFollowers(
        @PathVariable Long id) {

    return ResponseEntity.ok(
            followService.getFollowers(id)
    );
}

@GetMapping("/{id}/following")
public ResponseEntity<List<FollowUserResponse>> getFollowing(
        @PathVariable Long id) {

    return ResponseEntity.ok(
            followService.getFollowing(id)
    );
}

@GetMapping("/{id}/followers/count")
public ResponseEntity<Long> getFollowersCount(
        @PathVariable Long id) {

    return ResponseEntity.ok(
            followService.getFollowersCount(id)
    );
}

@GetMapping("/{id}/following/count")
public ResponseEntity<Long> getFollowingCount(
        @PathVariable Long id) {

    return ResponseEntity.ok(
            followService.getFollowingCount(id)
    );
}
}