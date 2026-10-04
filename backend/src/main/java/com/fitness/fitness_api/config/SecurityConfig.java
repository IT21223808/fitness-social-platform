package com.fitness.fitness_api.config;

import com.fitness.fitness_api.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                .sessionManagement(session -> session.sessionCreationPolicy(
                        SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth

                        // Public endpoints
                        .requestMatchers(
                                "/api/health",
                                "/api/auth/**",
                                    "/uploads/**",
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
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of("http://localhost:3000"));

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "PATCH",
                        "OPTIONS"));

        configuration.setAllowedHeaders(
                List.of("*"));

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration);

        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}