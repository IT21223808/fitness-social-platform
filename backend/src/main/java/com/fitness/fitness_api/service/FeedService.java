
package com.fitness.fitness_api.service;

import com.fitness.fitness_api.dto.MediaResponse;
import com.fitness.fitness_api.dto.PostResponse;
import com.fitness.fitness_api.entity.Post;
import com.fitness.fitness_api.entity.PostMedia;
import com.fitness.fitness_api.entity.User;
import com.fitness.fitness_api.repository.PostMediaRepository;
import com.fitness.fitness_api.repository.PostRepository;
import com.fitness.fitness_api.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FeedService {

    private final PostRepository postRepository;
    private final PostMediaRepository postMediaRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public PostResponse mapToResponse(Post post) {

        List<MediaResponse> media = postMediaRepository
                .findByPostOrderByDisplayOrderAsc(post)
                .stream()
                .map(item -> MediaResponse.builder()
                        .id(item.getId())
                        .mediaUrl(item.getMediaUrl())
                        .mediaType(item.getMediaType())
                        .displayOrder(item.getDisplayOrder())
                        .build())
                .toList();

        return PostResponse.builder()
                .id(post.getId())
                .userId(post.getUser().getId())
                .username(post.getUser().getUsername())
                .description(post.getDescription())
                .type(post.getType())
                .media(media)
                .createdAt(post.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public List<PostResponse> getFeed(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        List<Post> posts =
                postRepository.findFeedPosts(user.getId());

        return posts.stream()
                .map(this::mapToResponse)
                .toList();
    }
}