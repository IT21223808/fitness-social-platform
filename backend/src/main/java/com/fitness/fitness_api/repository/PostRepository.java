package com.fitness.fitness_api.repository;

import com.fitness.fitness_api.entity.MealPlan;
import com.fitness.fitness_api.entity.Post;
import com.fitness.fitness_api.entity.User;
import com.fitness.fitness_api.entity.WorkoutPlan;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PostRepository extends JpaRepository<Post, Long> {

    List<Post> findAllByOrderByCreatedAtDesc();

    List<Post> findByUserOrderByCreatedAtDesc(User user);

    Optional<Post> findByIdAndUser(Long id, User user);

    Optional<Post> findByWorkoutPlan(WorkoutPlan workoutPlan);

    Optional<Post> findByMealPlan(MealPlan mealPlan);

    @Query(
            value = """
                    SELECT p
                    FROM Post p
                    WHERE (:hasSearch = false
                        OR LOWER(COALESCE(p.description, '')) LIKE LOWER(CONCAT('%', :search, '%'))
                        OR LOWER(p.user.username) LIKE LOWER(CONCAT('%', :search, '%'))
                        OR LOWER(CAST(p.type AS string)) LIKE LOWER(CONCAT('%', :search, '%')))
                      AND (:type IS NULL OR p.type = :type)
                    ORDER BY p.createdAt DESC, p.id DESC
                    """,
            countQuery = """
                    SELECT COUNT(p)
                    FROM Post p
                    WHERE (:hasSearch = false
                        OR LOWER(COALESCE(p.description, '')) LIKE LOWER(CONCAT('%', :search, '%'))
                        OR LOWER(p.user.username) LIKE LOWER(CONCAT('%', :search, '%'))
                        OR LOWER(CAST(p.type AS string)) LIKE LOWER(CONCAT('%', :search, '%')))
                      AND (:type IS NULL OR p.type = :type)
                    """)
    Page<Post> findRecentExplorePosts(
            @Param("hasSearch") boolean hasSearch,
            @Param("search") String search,
            @Param("type") Post.PostType type,
            Pageable pageable);

    @Query(
            value = """
                    SELECT p
                    FROM Post p
                    WHERE (:hasSearch = false
                        OR LOWER(COALESCE(p.description, '')) LIKE LOWER(CONCAT('%', :search, '%'))
                        OR LOWER(p.user.username) LIKE LOWER(CONCAT('%', :search, '%'))
                        OR LOWER(CAST(p.type AS string)) LIKE LOWER(CONCAT('%', :search, '%')))
                      AND (:type IS NULL OR p.type = :type)
                    ORDER BY
                        ((SELECT COUNT(l) FROM PostLike l WHERE l.post = p)
                            + 2 * (SELECT COUNT(c) FROM Comment c WHERE c.post = p)) DESC,
                        p.createdAt DESC,
                        p.id DESC
                    """,
            countQuery = """
                    SELECT COUNT(p)
                    FROM Post p
                    WHERE (:hasSearch = false
                        OR LOWER(COALESCE(p.description, '')) LIKE LOWER(CONCAT('%', :search, '%'))
                        OR LOWER(p.user.username) LIKE LOWER(CONCAT('%', :search, '%'))
                        OR LOWER(CAST(p.type AS string)) LIKE LOWER(CONCAT('%', :search, '%')))
                      AND (:type IS NULL OR p.type = :type)
                    """)
    Page<Post> findTrendingExplorePosts(
            @Param("hasSearch") boolean hasSearch,
            @Param("search") String search,
            @Param("type") Post.PostType type,
            Pageable pageable);

    @Query("""
            SELECT p.id AS postId,
                   (SELECT COUNT(l) FROM PostLike l WHERE l.post = p) AS likeCount,
                   (SELECT COUNT(c) FROM Comment c WHERE c.post = p) AS commentCount,
                   (SELECT CASE WHEN COUNT(liked) > 0 THEN TRUE ELSE FALSE END
                    FROM PostLike liked
                    WHERE liked.post = p AND liked.user.id = :currentUserId)
                       AS likedByCurrentUser
            FROM Post p
            WHERE p.id IN :postIds
            """)
    List<PostEngagementProjection> findEngagementForPosts(
            @Param("postIds") List<Long> postIds,
            @Param("currentUserId") Long currentUserId);

    @Query("""
            SELECT p
            FROM Post p
            WHERE p.user.id IN (
                SELECT f.following.id
                FROM Follow f
                WHERE f.follower.id = :userId
            )
            OR p.user.id = :userId
            ORDER BY p.createdAt DESC
            """)
    List<Post> findFeedPosts(@Param("userId") Long userId);
}