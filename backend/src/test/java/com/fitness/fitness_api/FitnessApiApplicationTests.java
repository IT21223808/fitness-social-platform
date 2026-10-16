package com.fitness.fitness_api;

import com.fitness.fitness_api.repository.PostRepository;
import com.fitness.fitness_api.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
class FitnessApiApplicationTests {

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private PostRepository postRepository;

	@Test
	void contextLoads() {
	}

	@Test
	void exploreSearchQueriesAcceptTypedSearchParameters() {
		PageRequest page = PageRequest.of(0, 1);
		String search = "explore-search-regression-no-match";

		assertNotNull(userRepository.findCommunityUsers(
				0L, false, "", page));
		assertNotNull(userRepository.findCommunityUsers(
				0L, true, search, page));
		assertNotNull(postRepository.findRecentExplorePosts(
				false, "", null, page));
		assertNotNull(postRepository.findRecentExplorePosts(
				true, search, null, page));
		assertNotNull(postRepository.findTrendingExplorePosts(
				false, "", null, page));
		assertNotNull(postRepository.findTrendingExplorePosts(
				true, search, null, page));
	}
}
