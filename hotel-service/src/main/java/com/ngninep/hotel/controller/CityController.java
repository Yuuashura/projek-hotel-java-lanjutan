package com.ngninep.hotel.controller;

import com.ngninep.hotel.dto.req.CityRequest;
import com.ngninep.hotel.dto.res.CityResponse;
import com.ngninep.hotel.dto.res.WebResponse;
import com.ngninep.hotel.service.CityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/cities")
@RequiredArgsConstructor
public class CityController {

    private final CityService cityService;

    // Endpoint publik untuk data dropdown
    @GetMapping
    public ResponseEntity<WebResponse<List<CityResponse>>> getAll() {
        WebResponse<List<CityResponse>> response = WebResponse.<List<CityResponse>>builder()
                .status("200")
                .message("Success")
                .data(cityService.getAll())
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WebResponse<CityResponse>> getById(@PathVariable int id) {
        WebResponse<CityResponse> response = WebResponse.<CityResponse>builder()
                .status("200")
                .message("Success")
                .data(cityService.getById(id))
                .build();
        return ResponseEntity.ok(response);
    }

    // Hanya diakses oleh Admin Aplikasi
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN_APP')")
    public ResponseEntity<WebResponse<CityResponse>> create(@Valid @RequestBody CityRequest request) {
        WebResponse<CityResponse> response = WebResponse.<CityResponse>builder()
                .status("200")
                .message("Success")
                .data(cityService.create(request))
                .build();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN_APP')")
    public ResponseEntity<WebResponse<CityResponse>> update(@PathVariable int id, @Valid @RequestBody CityRequest request) {
        WebResponse<CityResponse> response = WebResponse.<CityResponse>builder()
                .status("200")
                .message("Success")
                .data(cityService.update(id, request))
                .build();
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN_APP')")
    public ResponseEntity<WebResponse<Void>> delete(@PathVariable int id) {
        cityService.delete(id);
        WebResponse<Void> response = WebResponse.<Void>builder()
                .status("200")
                .message("Success")
                .build();
        return ResponseEntity.ok(response);
    }
}
