package com.fitness.fitness_api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir}")
    private String uploadDirectory;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        String uploadPath = Paths
                .get(uploadDirectory)
                .toAbsolutePath()
                .normalize()
                .toUri()
                .toString();

        System.out.println("UPLOAD RESOURCE PATH: " + uploadPath);

        registry
                .addResourceHandler("/uploads/**")
                .addResourceLocations(uploadPath);
    }
}