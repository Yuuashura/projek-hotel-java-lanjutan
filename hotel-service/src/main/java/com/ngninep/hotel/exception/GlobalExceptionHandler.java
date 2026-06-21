package com.ngninep.hotel.exception;

import com.ngninep.hotel.dto.res.WebResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<WebResponse<String>> handleResponseStatus(ResponseStatusException ex) {
        WebResponse<String> response = WebResponse.<String>builder()
                .status(String.valueOf(ex.getStatusCode().value()))
                .message(ex.getReason())
                .build();
        return ResponseEntity.status(ex.getStatusCode()).body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<WebResponse<String>> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));
        
        WebResponse<String> response = WebResponse.<String>builder()
                .status("400")
                .message(message)
                .build();
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<WebResponse<String>> handleAccessDenied(AccessDeniedException ex) {
        WebResponse<String> response = WebResponse.<String>builder()
                .status("403")
                .message("Anda tidak memiliki izin untuk mengakses fitur ini")
                .build();
        return ResponseEntity.status(403).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<WebResponse<String>> handleGeneral(Exception ex) {
        WebResponse<String> response = WebResponse.<String>builder()
                .status("500")
                .message("Terjadi kesalahan: " + ex.getMessage())
                .build();
        return ResponseEntity.internalServerError().body(response);
    }
}
