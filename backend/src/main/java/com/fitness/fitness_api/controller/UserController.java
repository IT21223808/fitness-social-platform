
package com.fitness.fitness_api.controller;

import com.fitness.fitness_api.dto.FollowUserResponse;
import com.fitness.fitness_api.dto.UpdateProfileRequest;
import com.fitness.fitness_api.dto.UserResponse;
import com.fitness.fitness_api.entity.User;
import com.fitness.fitness_api.repository.UserRepository;
import com.fitness.fitness_api.service.FollowService;
import com.fitness.fitness_api.service.ProfileMediaService;

import lombok.RequiredArgsConstructor;

import java.io.IOException;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final FollowService followService;
    private final ProfileMediaService profileMediaService;

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {

        List<UserResponse> users = userRepository.findAll()
                .stream()
                .map(user -> UserResponse.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .profileImageUrl(user.getProfileImageUrl())
                        .bio(user.getBio())
                        .coverImageUrl(user.getCoverImageUrl())
                        .build())
                .toList();

        return ResponseEntity.ok(users);
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(
            Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return ResponseEntity.ok(toUserResponse(user));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateProfile(
            @RequestBody UpdateProfileRequest request,
            Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setProfileImageUrl(request.getProfileImageUrl());
        user.setBio(request.getBio());
        user.setCoverImageUrl(request.getCoverImageUrl());

        User updatedUser = userRepository.save(user);

        return ResponseEntity.ok(toUserResponse(updatedUser));
    }

    @PostMapping("/me/profile-image")
    public ResponseEntity<String> uploadProfileImage(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) throws IOException {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        String imageUrl = profileMediaService.saveImage(file);

        user.setProfileImageUrl(imageUrl);
        userRepository.save(user);

        return ResponseEntity.ok(imageUrl);
    }

    @PostMapping("/me/cover-image")
    public ResponseEntity<String> uploadCoverImage(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) throws IOException {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        String imageUrl = profileMediaService.saveImage(file);

        user.setCoverImageUrl(imageUrl);
        userRepository.save(user);

        return ResponseEntity.ok(imageUrl);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(
            @PathVariable Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return ResponseEntity.ok(toUserResponse(user));
    }

    @PostMapping("/{id}/follow")
    public ResponseEntity<String> followUser(
            @PathVariable Long id,
            Authentication authentication) {

        followService.follow(id, authentication.getName());

        return ResponseEntity.ok("User followed successfully");
    }

    @DeleteMapping("/{id}/follow")
    public ResponseEntity<String> unfollowUser(
            @PathVariable Long id,
            Authentication authentication) {

        followService.unfollow(id, authentication.getName());

        return ResponseEntity.ok("User unfollowed successfully");
    }

    @GetMapping("/{id}/followers")
    public ResponseEntity<List<FollowUserResponse>> getFollowers(
            @PathVariable Long id) {

        return ResponseEntity.ok(followService.getFollowers(id));
    }

    @GetMapping("/{id}/following")
    public ResponseEntity<List<FollowUserResponse>> getFollowing(
            @PathVariable Long id) {

        return ResponseEntity.ok(followService.getFollowing(id));
    }

    @GetMapping("/{id}/followers/count")
    public ResponseEntity<Long> getFollowersCount(
            @PathVariable Long id) {

        return ResponseEntity.ok(followService.getFollowersCount(id));
    }

    @GetMapping("/{id}/following/count")
    public ResponseEntity<Long> getFollowingCount(
            @PathVariable Long id) {

        return ResponseEntity.ok(followService.getFollowingCount(id));
    }

    private UserResponse toUserResponse(User user) {

        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .profileImageUrl(user.getProfileImageUrl())
                .bio(user.getBio())
                .coverImageUrl(user.getCoverImageUrl())
                .build();
    }
}
