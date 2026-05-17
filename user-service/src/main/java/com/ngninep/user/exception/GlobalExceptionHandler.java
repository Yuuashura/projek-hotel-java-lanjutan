package com.ngninep.user.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

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
    
    // Fallback untuk exception umum lainnya agar respons tetap berbentuk JSON
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneralException(Exception ex) {
        Map<String, String> response = new HashMap<>();
        response.put("message", ex.getMessage());
        return ResponseEntity.internalServerError().body(response);
    }
}
