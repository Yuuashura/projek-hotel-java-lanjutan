package com.ngninep.user.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

class GlobalExceptionHandlerTest {

    @Test
    void returnsRetryAfterHeaderAndBodyForLoginRateLimit() {
        GlobalExceptionHandler handler = new GlobalExceptionHandler();
        LoginRateLimitException exception = new LoginRateLimitException("Terlalu banyak percobaan login", 720);

        ResponseEntity<Map<String, Object>> response = handler.handleLoginRateLimitException(exception);

        assertEquals(429, response.getStatusCode().value());
        assertEquals("720", response.getHeaders().getFirst("Retry-After"));
        assertEquals("Terlalu banyak percobaan login", response.getBody().get("message"));
        assertEquals(720L, response.getBody().get("retry_after_seconds"));
    }
}
