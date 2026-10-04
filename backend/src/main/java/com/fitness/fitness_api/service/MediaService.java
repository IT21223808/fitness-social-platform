
package com.fitness.fitness_api.service;

import com.fitness.fitness_api.entity.Post;
import com.fitness.fitness_api.entity.PostMedia;
import com.fitness.fitness_api.repository.PostMediaRepository;

import lombok.RequiredArgsConstructor;

import org.jcodec.api.FrameGrab;
import org.jcodec.api.JCodecException;
import org.jcodec.common.io.NIOUtils;
import org.jcodec.common.io.SeekableByteChannel;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MediaService {

    private final PostMediaRepository postMediaRepository;

    @Value("${app.upload.dir}")
    private String uploadDirectory;

    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024;
    private static final int MAX_MEDIA_PER_POST = 3;
    private static final int MAX_VIDEO_DURATION_SECONDS = 30;

    public PostMedia saveMedia(
            Post post,
            MultipartFile file,
            int displayOrder) throws IOException {

        // 1. Check empty file
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        // 2. Check file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException(
                    "File size cannot exceed 50 MB"
            );
        }

        // 3. Check maximum 3 media files
        long mediaCount = postMediaRepository.countByPost(post);

        if (mediaCount >= MAX_MEDIA_PER_POST) {
            throw new RuntimeException(
                    "A post can have maximum 3 media files"
            );
        }

        // 4. Validate display order
        if (displayOrder < 1 || displayOrder > 3) {
            throw new RuntimeException(
                    "Display order must be between 1 and 3"
            );
        }

        // 5. Check content type
        String contentType = file.getContentType();

        if (contentType == null) {
            throw new RuntimeException("Invalid file type");
        }

        PostMedia.MediaType mediaType;

        if (contentType.startsWith("image/")) {
            mediaType = PostMedia.MediaType.IMAGE;

        } else if (contentType.startsWith("video/")) {
            mediaType = PostMedia.MediaType.VIDEO;

            // 6. Validate video duration
            validateVideoDuration(file);

        } else {
            throw new RuntimeException(
                    "Only image and video files are allowed"
            );
        }

        // 7. Create upload directory
        Path uploadPath = Paths.get(uploadDirectory);
        Files.createDirectories(uploadPath);

        // 8. Get file extension
        String originalFilename = file.getOriginalFilename();
        String extension = "";

        if (originalFilename != null
                && originalFilename.contains(".")) {
            extension = originalFilename.substring(
                    originalFilename.lastIndexOf(".")
            );
        }

        // 9. Generate unique filename
        String filename = UUID.randomUUID() + extension;

        // 10. Create file path
        Path filePath = uploadPath.resolve(filename);

        // 11. Save uploaded file
        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, filePath);
        }

        // 12. Save database record
        PostMedia media = PostMedia.builder()
                .post(post)
                .mediaUrl("/uploads/" + filename)
                .mediaType(mediaType)
                .displayOrder(displayOrder)
                .build();

        return postMediaRepository.save(media);
    }
    public void deleteMedia(
        Long mediaId,
        Post post) throws IOException {

    PostMedia media = postMediaRepository.findById(mediaId)
            .orElseThrow(() ->
                    new RuntimeException("Media not found"));

    // Make sure this media belongs to the selected post
    if (!media.getPost().getId().equals(post.getId())) {
        throw new RuntimeException(
                "Media does not belong to this post"
        );
    }

    // Delete physical file
    String mediaUrl = media.getMediaUrl();

    if (mediaUrl != null && mediaUrl.startsWith("/uploads/")) {

        String filename = mediaUrl.substring("/uploads/".length());

        Path filePath = Paths.get(uploadDirectory)
                .resolve(filename);

        Files.deleteIfExists(filePath);
    }

    // Delete database record
    postMediaRepository.delete(media);
}

    private void validateVideoDuration(MultipartFile file) {

        Path tempFile = null;

        try {
            // 1. Get file extension
            String originalFilename = file.getOriginalFilename();
            String extension = ".tmp";

            if (originalFilename != null
                    && originalFilename.contains(".")) {
                extension = originalFilename.substring(
                        originalFilename.lastIndexOf(".")
                );
            }

            // 2. Create temporary file
            tempFile = Files.createTempFile(
                    "fitness-video-",
                    extension
            );

            // 3. Copy uploaded video without moving the original temp file
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(
                        inputStream,
                        tempFile,
                        StandardCopyOption.REPLACE_EXISTING
                );
            }

            // 4. Read video metadata
            try (SeekableByteChannel channel =
                         NIOUtils.readableChannel(tempFile.toFile())) {

                FrameGrab frameGrab =
                        FrameGrab.createFrameGrab(channel);

                double durationSeconds =
                        frameGrab.getVideoTrack()
                                .getMeta()
                                .getTotalDuration();

                if (durationSeconds > MAX_VIDEO_DURATION_SECONDS) {
                    throw new RuntimeException(
                            "Video duration cannot exceed 30 seconds"
                    );
                }
            }

        } catch (IOException | JCodecException e) {
            throw new RuntimeException(
                    "Unable to validate video duration",
                    e
            );

        } finally {
            // 5. Delete temporary file
            if (tempFile != null) {
                try {
                    Files.deleteIfExists(tempFile);
                } catch (IOException ignored) {
                    // Ignore cleanup failure
                }
            }
        }
    }
}