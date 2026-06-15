package com.ngninep.user.controller;

import com.ngninep.user.dto.*;
import com.ngninep.user.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // POST /api/auth/register
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        String message = authService.register(request);
        return ResponseEntity.ok(Map.of("message", message));
    }

    @PostMapping("/admin-hotels")
    @PreAuthorize("hasAuthority('ROLE_ADMIN_APP')")
    public ResponseEntity<?> createAdminHotel(@Valid @RequestBody CreateAdminHotelRequest request) {
        String message = authService.createAdminHotel(request);
        return ResponseEntity.ok(Map.of("message", message));
    }

    // POST /api/auth/verify-otp
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        String message = authService.verifyOtp(request);
        return ResponseEntity.ok(Map.of("message", message));
    }

    // POST /api/auth/resend-otp
    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@Valid @RequestBody ResendOtpRequest request) {
        String message = authService.resendOtp(request);
        return ResponseEntity.ok(Map.of("message", message));
    }

    // POST /api/auth/forgot-password
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        String message = authService.forgotPassword(request);
        return ResponseEntity.ok(Map.of("message", message));
    }

    // POST /api/auth/verify-reset-otp
    @PostMapping("/verify-reset-otp")
    public ResponseEntity<?> verifyResetOtp(@Valid @RequestBody VerifyOtpRequest request) {
        String message = authService.verifyResetOtp(request);
        return ResponseEntity.ok(Map.of("message", message));
    }

    // POST /api/auth/reset-password
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        String message = authService.resetPassword(request);
        return ResponseEntity.ok(Map.of("message", message));
    }

    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
}
