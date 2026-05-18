package com.ngninep.hotel.controller;

import com.ngninep.hotel.dto.req.HotelRequest;
import com.ngninep.hotel.dto.res.HotelResponse;
import com.ngninep.hotel.dto.res.WebResponse;
import com.ngninep.hotel.service.HotelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/hotels")
@RequiredArgsConstructor
public class HotelController {

    private final HotelService hotelService;

    // ✅ Publik — browse & search hotel
    @GetMapping
    public ResponseEntity<WebResponse<List<HotelResponse>>> getAll(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer cityId
    ) {
        WebResponse<List<HotelResponse>> response = WebResponse.<List<HotelResponse>>builder()
                .status("200")
                .message("Success")
                .data(hotelService.search(keyword, cityId))
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/featured")
    public ResponseEntity<WebResponse<List<HotelResponse>>> getFeatured() {
        WebResponse<List<HotelResponse>> response = WebResponse.<List<HotelResponse>>builder()
                .status("200")
                .message("Success")
                .data(hotelService.getFeatured())
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WebResponse<HotelResponse>> getById(@PathVariable int id) {
        WebResponse<HotelResponse> response = WebResponse.<HotelResponse>builder()
                .status("200")
                .message("Success")
                .data(hotelService.getById(id))
                .build();
        return ResponseEntity.ok(response);
    }

    // 🔒 Admin Hotel & Admin Aplikasi — kelola hotel
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_HOTEL', 'ROLE_ADMIN_APP')")
    public ResponseEntity<WebResponse<HotelResponse>> create(@Valid @RequestBody HotelRequest request) {
        WebResponse<HotelResponse> response = WebResponse.<HotelResponse>builder()
                .status("200")
                .message("Success")
                .data(hotelService.create(request))
                .build();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_HOTEL', 'ROLE_ADMIN_APP')")
    public ResponseEntity<WebResponse<HotelResponse>> update(@PathVariable int id, @Valid @RequestBody HotelRequest request) {
        WebResponse<HotelResponse> response = WebResponse.<HotelResponse>builder()
                .status("200")
                .message("Success")
                .data(hotelService.update(id, request))
                .build();
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_HOTEL', 'ROLE_ADMIN_APP')")
    public ResponseEntity<WebResponse<Void>> delete(@PathVariable int id) {
        hotelService.delete(id);
        WebResponse<Void> response = WebResponse.<Void>builder()
                .status("200")
                .message("Success")
                .build();
        return ResponseEntity.ok(response);
    }
}
