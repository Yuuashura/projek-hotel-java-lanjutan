package com.ngninep.user.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;
import java.util.LinkedHashMap;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(LoginRateLimitException.class)
    public ResponseEntity<Map<String, Object>> handleLoginRateLimitException(LoginRateLimitException ex) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", ex.getMessage());
        response.put("retry_after_seconds", ex.getRetryAfterSeconds());
        return ResponseEntity.status(429)
                .header(HttpHeaders.RETRY_AFTER, String.valueOf(ex.getRetryAfterSeconds()))
                .body(response);
    }

    // Menangani error dari ResponseStatusException (misal: throw new ResponseStatusException(...))
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handleResponseStatusException(ResponseStatusException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("message", ex.getReason()); // Ambil custom message yang kita definisikan
        return ResponseEntity.status(ex.getStatusCode()).body(response);
    }

    // Menangani error dari anotasi validasi DTO (seperti @NotBlank, @Email)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        
        // Ambil pesan error validasi pertama yang gagal
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        // Bikin respons satu pesan ringkas saja (opsional, bisa kembalikan map utuh)
        Map<String, String> response = new HashMap<>();
        if (!errors.isEmpty()) {
            response.put("message", errors.values().iterator().next()); 
        } else {
            response.put("message", "Input tidak valid");
        }

        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleAccessDeniedException(AccessDeniedException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Anda tidak memiliki izin untuk mengakses fitur ini");
        return ResponseEntity.status(403).body(response);
    }
    
    // Fallback untuk exception umum lainnya agar respons tetap berbentuk JSON
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneralException(Exception ex) {
        Map<String, String> response = new HashMap<>();
        response.put("message", ex.getMessage());
        return ResponseEntity.internalServerError().body(response);
    }
}
