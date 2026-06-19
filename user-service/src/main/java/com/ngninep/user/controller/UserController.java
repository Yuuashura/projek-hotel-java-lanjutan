package com.ngninep.user.controller;

import com.ngninep.user.dto.ChangePasswordRequest;
import com.ngninep.user.dto.UpdateProfileRequest;
import com.ngninep.user.dto.UserProfileResponse;
import com.ngninep.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

    @PostMapping(value = "/me/profile-picture", consumes = "multipart/form-data")
    public ResponseEntity<UserProfileResponse> uploadProfilePicture(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("file") MultipartFile file
    ) {
        UserProfileResponse updated = userService.updateProfilePicture(userDetails.getUsername(), file);
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

    // GET /api/users — Lihat semua pengguna (Admin)
    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN_APP')")
    public ResponseEntity<java.util.List<UserProfileResponse>> getAllUsers(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        return ResponseEntity.ok(userService.getAllUsers(page, size));
    }

    // GET /api/users/admin-hotels — Lihat semua admin hotel (Admin App)
    @GetMapping("/admin-hotels")
    @PreAuthorize("hasAuthority('ROLE_ADMIN_APP')")
    public ResponseEntity<java.util.List<UserProfileResponse>> getAdminHotels(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        return ResponseEntity.ok(userService.getAdminHotels(page, size));
    }

    // PATCH /api/users/{id}/ban
    @PatchMapping("/{id}/ban")
    @PreAuthorize("hasAuthority('ROLE_ADMIN_APP')")
    public ResponseEntity<?> banUser(@PathVariable int id) {
        return ResponseEntity.ok(Map.of("message", userService.banUser(id)));
    }

    // PATCH /api/users/{id}/unban
    @PatchMapping("/{id}/unban")
    @PreAuthorize("hasAuthority('ROLE_ADMIN_APP')")
    public ResponseEntity<?> unbanUser(@PathVariable int id) {
        return ResponseEntity.ok(Map.of("message", userService.unbanUser(id)));
    }
}
