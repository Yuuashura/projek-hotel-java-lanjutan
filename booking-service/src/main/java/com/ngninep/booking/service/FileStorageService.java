package com.ngninep.booking.service;

import com.ngninep.booking.util.Message;
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

    public FileStorageService(@Value("${app.file.upload-path:uploads/booking-service}") String uploadPath) {
        this.rootPath = Paths.get(uploadPath).toAbsolutePath().normalize();
    }

    public String savePaymentProof(MultipartFile file) {
        return saveImage(file, "payment-proofs", "/api/bookings/uploads/payment-proofs/");
    }

    public Path getPaymentProofRoot() {
        return rootPath.resolve("payment-proofs").normalize();
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
