package com.fitness.fitness_api.service;

import com.fitness.fitness_api.dto.FollowUserResponse;
import com.fitness.fitness_api.dto.PostResponse;
import com.fitness.fitness_api.entity.Post;
import com.fitness.fitness_api.entity.Post.PostType;
import com.fitness.fitness_api.entity.User;
import com.fitness.fitness_api.repository.PostEngagementProjection;
import com.fitness.fitness_api.repository.PostRepository;
import com.fitness.fitness_api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@Service
@RequiredArgsConstructor
public class ExploreService {

    private static final int MAX_SEARCH_LENGTH = 200;

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final FeedService feedService;

    public enum Sort {
        RECENT,
        TRENDING
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> getPosts(
            String search,
            PostType type,
            Sort sort,
            int page,
            int size,
            String email) {

        String normalizedSearch = normalizeSearch(search);
        boolean hasSearch = !normalizedSearch.isEmpty();
        User currentUser = getCurrentUser(email);
        PageRequest pageRequest = PageRequest.of(page, size);
        Page<Post> posts = sort == Sort.TRENDING
                ? postRepository.findTrendingExplorePosts(
                        hasSearch, normalizedSearch, type, pageRequest)
                : postRepository.findRecentExplorePosts(
                        hasSearch, normalizedSearch, type, pageRequest);

        List<Long> postIds = posts.getContent().stream()
                .map(Post::getId)
                .toList();

        Map<Long, PostEngagementProjection> engagementByPostId =
                postIds.isEmpty()
                        ? Map.of()
                        : postRepository.findEngagementForPosts(
                                        postIds, currentUser.getId())
                                .stream()
                                .collect(Collectors.toMap(
                                        PostEngagementProjection::getPostId,
                                        Function.identity()));

        Map<Long, PostResponse> responseByPostId =
                feedService.mapToResponses(posts.getContent()).stream()
                        .collect(Collectors.toMap(
                                PostResponse::getId,
                                Function.identity()));

        return posts.map(post -> {
            PostResponse response = responseByPostId.get(post.getId());
            PostEngagementProjection engagement =
                    engagementByPostId.get(post.getId());

            return response.toBuilder()
                    .likeCount(engagement.getLikeCount())
                    .commentCount(engagement.getCommentCount())
                    .likedByCurrentUser(engagement.getLikedByCurrentUser())
                    .build();
        });
    }

    @Transactional(readOnly = true)
    public Page<FollowUserResponse> getUsers(
            String search,
            int page,
            int size,
            String email) {

        User currentUser = getCurrentUser(email);
        String normalizedSearch = normalizeSearch(search);

        return userRepository.findCommunityUsers(
                        currentUser.getId(),
                        !normalizedSearch.isEmpty(),
                        normalizedSearch,
                        PageRequest.of(page, size))
                .map(user -> FollowUserResponse.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .profileImageUrl(user.getProfileImageUrl())
                        .bio(user.getBio())
                        .build());
    }

    private User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException(
                        "Authenticated user was not found"));
    }

    private String normalizeSearch(String search) {
        if (search == null || search.isBlank()) {
            return "";
        }

        String normalized = search.trim();
        if (normalized.length() > MAX_SEARCH_LENGTH) {
            throw new ResponseStatusException(
                    BAD_REQUEST,
                    "Search must be 200 characters or fewer");
        }

        return normalized;
    }
}
