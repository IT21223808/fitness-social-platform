package com.fitness.fitness_api.config;

import com.fitness.fitness_api.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthenticationFilter;

        @Bean
        public SecurityFilterChain securityFilterChain(
                        HttpSecurity http) throws Exception {

                http
                                .csrf(csrf -> csrf.disable())

                                .sessionManagement(session -> session.sessionCreationPolicy(
                                                SessionCreationPolicy.STATELESS))

                                .authorizeHttpRequests(auth -> auth

                                                // Public endpoints
                                                .requestMatchers(
                                                                "/api/health",
                                                                "/api/auth/**",
                                                                "/error")
                                                .permitAll()

                                                // Authenticated endpoints
                                                .requestMatchers("/api/users/me")
                                                .authenticated()

                                                .requestMatchers(
                                                                "/api/users/*/follow",
                                                                "/api/users/*/followers",
                                                                "/api/users/*/following",
                                                                "/api/users/*/followers/count",
                                                                "/api/users/*/following/count")
                                                .authenticated()

                                                .requestMatchers("/api/posts/**")
                                                .authenticated()

                                                .requestMatchers("/api/workout-status/**")
                                                .authenticated()

                                                .requestMatchers("/api/workout-plans/**")
                                                .authenticated()

                                                .requestMatchers("/api/meal-plans/**")
                                                .authenticated()

                                                .requestMatchers("/api/feed/**")
                                                .authenticated()

                                                // Public profile viewing
                                                .requestMatchers("/api/users/*")
                                                .permitAll()

                                                .requestMatchers("/api/notifications/**")
                                                .authenticated()

                                                .anyRequest()
                                                .authenticated())

                                .addFilterBefore(
                                                jwtAuthenticationFilter,
                                                UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }
}