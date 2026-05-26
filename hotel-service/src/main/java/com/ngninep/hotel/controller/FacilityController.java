package com.ngninep.hotel.controller;

import com.ngninep.hotel.dto.req.FacilityRequest;
import com.ngninep.hotel.dto.res.FacilityResponse;
import com.ngninep.hotel.dto.res.WebResponse;
import com.ngninep.hotel.service.FacilityService;
import com.ngninep.hotel.util.Message;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/facilities")
@RequiredArgsConstructor
public class FacilityController {

    private final FacilityService facilityService;

    // Endpoint publik untuk menampilkan daftar fasilitas
    @GetMapping
    public ResponseEntity<WebResponse<List<FacilityResponse>>> getAll() {
        WebResponse<List<FacilityResponse>> response = WebResponse.<List<FacilityResponse>>builder()
                .status("200")
                .message(Message.SUCCESS)
                .data(facilityService.getAll())
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WebResponse<FacilityResponse>> getById(@PathVariable int id) {
        WebResponse<FacilityResponse> response = WebResponse.<FacilityResponse>builder()
                .status("200")
                .message(Message.SUCCESS)
                .data(facilityService.getById(id))
                .build();
        return ResponseEntity.ok(response);
    }

    // Hanya diakses oleh Admin Aplikasi
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN_APP')")
    public ResponseEntity<WebResponse<FacilityResponse>> create(@Valid @RequestBody FacilityRequest request) {
        WebResponse<FacilityResponse> response = WebResponse.<FacilityResponse>builder()
                .status("200")
                .message(Message.SUCCESS)
                .data(facilityService.create(request))
                .build();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN_APP')")
    public ResponseEntity<WebResponse<FacilityResponse>> update(@PathVariable int id, @Valid @RequestBody FacilityRequest request) {
        WebResponse<FacilityResponse> response = WebResponse.<FacilityResponse>builder()
                .status("200")
                .message(Message.SUCCESS)
                .data(facilityService.update(id, request))
                .build();
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN_APP')")
    public ResponseEntity<WebResponse<Void>> delete(@PathVariable int id) {
        facilityService.delete(id);
        WebResponse<Void> response = WebResponse.<Void>builder()
                .status("200")
                .message(Message.SUCCESS)
                .build();
        return ResponseEntity.ok(response);
    }
}
