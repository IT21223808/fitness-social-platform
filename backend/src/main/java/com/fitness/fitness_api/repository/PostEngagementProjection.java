package com.fitness.fitness_api.repository;

public interface PostEngagementProjection {

    Long getPostId();

    Long getLikeCount();

    Long getCommentCount();

    Boolean getLikedByCurrentUser();
}
