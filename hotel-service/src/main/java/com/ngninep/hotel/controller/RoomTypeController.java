package com.ngninep.hotel.controller;

import com.ngninep.hotel.dto.req.RoomTypeRequest;
import com.ngninep.hotel.dto.res.RoomTypeResponse;
import com.ngninep.hotel.dto.res.WebResponse;
import com.ngninep.hotel.service.FileStorageService;
import com.ngninep.hotel.service.RoomTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/room-types")
@RequiredArgsConstructor
public class RoomTypeController {

    private final RoomTypeService roomTypeService;
    private final FileStorageService fileStorageService;

    // ✅ Publik — lihat tipe kamar untuk suatu hotel
    @GetMapping("/hotel/{hotelId}")
    public ResponseEntity<WebResponse<List<RoomTypeResponse>>> getByHotel(@PathVariable int hotelId) {
        WebResponse<List<RoomTypeResponse>> response = WebResponse.<List<RoomTypeResponse>>builder()
                .status("200")
                .message("Success")
                .data(roomTypeService.getByHotelId(hotelId))
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WebResponse<RoomTypeResponse>> getById(@PathVariable int id) {
        WebResponse<RoomTypeResponse> response = WebResponse.<RoomTypeResponse>builder()
                .status("200")
                .message("Success")
                .data(roomTypeService.getById(id))
                .build();
        return ResponseEntity.ok(response);
    }

    // 🔒 Admin Hotel & Admin Aplikasi — kelola tipe kamar
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_HOTEL', 'ROLE_ADMIN_APP')")
    public ResponseEntity<WebResponse<RoomTypeResponse>> create(@Valid @RequestBody RoomTypeRequest request) {
        WebResponse<RoomTypeResponse> response = WebResponse.<RoomTypeResponse>builder()
                .status("200")
                .message("Success")
                .data(roomTypeService.create(request))
                .build();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_HOTEL', 'ROLE_ADMIN_APP')")
    public ResponseEntity<WebResponse<RoomTypeResponse>> update(@PathVariable int id, @Valid @RequestBody RoomTypeRequest request) {
        WebResponse<RoomTypeResponse> response = WebResponse.<RoomTypeResponse>builder()
                .status("200")
                .message("Success")
                .data(roomTypeService.update(id, request))
                .build();
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_HOTEL', 'ROLE_ADMIN_APP')")
    public ResponseEntity<WebResponse<Void>> delete(@PathVariable int id) {
        roomTypeService.delete(id);
        WebResponse<Void> response = WebResponse.<Void>builder()
                .status("200")
                .message("Success")
                .build();
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/upload-image", consumes = "multipart/form-data")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_HOTEL', 'ROLE_ADMIN_APP')")
    public ResponseEntity<WebResponse<Map<String, String>>> uploadImage(@RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        String imageUrl = fileStorageService.saveRoomTypeImage(file);
        WebResponse<Map<String, String>> response = WebResponse.<Map<String, String>>builder()
                .status("200")
                .message("Gambar tipe kamar berhasil diunggah")
                .data(Map.of("url", imageUrl))
                .build();
        return ResponseEntity.ok(response);
    }
}
