package com.ngninep.user.controller;

import com.ngninep.user.dto.ChangePasswordRequest;
import com.ngninep.user.dto.UpdateProfileRequest;
import com.ngninep.user.dto.UserProfileResponse;
import com.ngninep.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // GET /api/users/me — Lihat profil sendiri
    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getProfile(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        UserProfileResponse profile = userService.getProfile(userDetails.getUsername());
        return ResponseEntity.ok(profile);
    }

    // PUT /api/users/me — Update profil
    @PutMapping("/me")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UpdateProfileRequest request
    ) {
        UserProfileResponse updated = userService.updateProfile(userDetails.getUsername(), request);
        return ResponseEntity.ok(updated);
    }

    // PUT /api/users/me/change-password — Ganti password
    @PutMapping("/me/change-password")
    public ResponseEntity<?> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        String message = userService.changePassword(userDetails.getUsername(), request);
        return ResponseEntity.ok(Map.of("message", message));
    }
}
