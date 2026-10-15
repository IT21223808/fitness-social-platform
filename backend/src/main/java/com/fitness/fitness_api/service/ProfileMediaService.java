
package com.fitness.fitness_api.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;

@Service
public class ProfileMediaService {

    @Value("${app.upload.dir}")
    private String uploadDirectory;

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
    );

    public String saveImage(MultipartFile file) throws IOException {

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Please select an image");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException(
                    "Image size cannot exceed 10 MB"
            );
        }

        String contentType = file.getContentType();

        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new RuntimeException(
                    "Only JPG, PNG, WEBP and GIF images are allowed"
            );
        }

        String extension;

        switch (contentType) {
            case "image/jpeg" -> extension = ".jpg";
            case "image/png" -> extension = ".png";
            case "image/webp" -> extension = ".webp";
            case "image/gif" -> extension = ".gif";
            default -> throw new RuntimeException("Invalid image type");
        }

        Path uploadPath = Paths.get(uploadDirectory)
                .toAbsolutePath()
                .normalize();

        Files.createDirectories(uploadPath);

        String filename = UUID.randomUUID() + extension;
        Path destination = uploadPath.resolve(filename).normalize();

        if (!destination.startsWith(uploadPath)) {
            throw new RuntimeException("Invalid file path");
        }

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, destination);
        }

        return "/uploads/" + filename;
    }
}
