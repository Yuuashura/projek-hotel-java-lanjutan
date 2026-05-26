package com.ngninep.hotel.service;

import com.ngninep.hotel.util.Message;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final long MAX_IMAGE_SIZE = 5 * 1024 * 1024;
    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of("image/jpeg", "image/png", "image/webp");

    private final Path rootPath;

    public FileStorageService(@Value("${app.file.upload-path:uploads/hotel-service}") String uploadPath) {
        this.rootPath = Paths.get(uploadPath).toAbsolutePath().normalize();
    }

    public String saveHotelImage(MultipartFile file) {
        return saveImage(file, "hotel-images", "/api/hotels/uploads/");
    }

    public String saveRoomTypeImage(MultipartFile file) {
        return saveImage(file, "room-type-images", "/api/room-types/uploads/");
    }

    public Path getHotelImageRoot() {
        return rootPath.resolve("hotel-images").normalize();
    }

    public Path getRoomTypeImageRoot() {
        return rootPath.resolve("room-type-images").normalize();
    }

    private String saveImage(MultipartFile file, String folder, String publicPath) {
        validateImage(file);
        String extension = getExtension(file.getOriginalFilename());
        String fileName = UUID.randomUUID() + extension;
        Path targetDir = rootPath.resolve(folder).normalize();
        Path targetFile = targetDir.resolve(fileName).normalize();

        try {
            Files.createDirectories(targetDir);
            Files.copy(file.getInputStream(), targetFile, StandardCopyOption.REPLACE_EXISTING);
            return publicPath + fileName;
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, Message.FILE_SAVE_FAILED);
        }
    }

    private void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, Message.IMAGE_FILE_EMPTY);
        }
        if (file.getSize() > MAX_IMAGE_SIZE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, Message.IMAGE_FILE_MAX_SIZE);
        }
        if (!ALLOWED_IMAGE_TYPES.contains(file.getContentType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, Message.IMAGE_FILE_INVALID_FORMAT);
        }
    }

    private String getExtension(String originalFilename) {
        if (originalFilename == null || !originalFilename.contains(".")) {
            return ".jpg";
        }
        String extension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
        if (!Set.of(".jpg", ".jpeg", ".png", ".webp").contains(extension)) {
            return ".jpg";
        }
        return extension;
    }
}
