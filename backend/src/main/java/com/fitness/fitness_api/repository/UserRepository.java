package com.fitness.fitness_api.repository;

import com.fitness.fitness_api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    @Query(
            value = """
                    SELECT u
                    FROM User u
                    WHERE u.id <> :currentUserId
                      AND NOT EXISTS (
                          SELECT f.id
                          FROM Follow f
                          WHERE f.follower.id = :currentUserId
                            AND f.following.id = u.id)
                      AND (:hasSearch = false
                          OR LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%'))
                          OR LOWER(COALESCE(u.firstName, '')) LIKE LOWER(CONCAT('%', :search, '%'))
                          OR LOWER(COALESCE(u.lastName, '')) LIKE LOWER(CONCAT('%', :search, '%'))
                          OR LOWER(COALESCE(u.bio, '')) LIKE LOWER(CONCAT('%', :search, '%')))
                    ORDER BY u.id DESC
                    """,
            countQuery = """
                    SELECT COUNT(u)
                    FROM User u
                    WHERE u.id <> :currentUserId
                      AND NOT EXISTS (
                          SELECT f.id
                          FROM Follow f
                          WHERE f.follower.id = :currentUserId
                            AND f.following.id = u.id)
                      AND (:hasSearch = false
                          OR LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%'))
                          OR LOWER(COALESCE(u.firstName, '')) LIKE LOWER(CONCAT('%', :search, '%'))
                          OR LOWER(COALESCE(u.lastName, '')) LIKE LOWER(CONCAT('%', :search, '%'))
                          OR LOWER(COALESCE(u.bio, '')) LIKE LOWER(CONCAT('%', :search, '%')))
                    """)
    Page<User> findCommunityUsers(
            @Param("currentUserId") Long currentUserId,
            @Param("hasSearch") boolean hasSearch,
            @Param("search") String search,
            Pageable pageable);
}