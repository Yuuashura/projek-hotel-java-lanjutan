package com.ngninep.hotel.controller;

import com.ngninep.hotel.entity.Facility;
import com.ngninep.hotel.service.FacilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/facilities")
@RequiredArgsConstructor
public class FacilityController {

    private final FacilityService facilityService;

    // ✅ Publik — untuk tampilkan fasilitas di halaman hotel
    @GetMapping
    public ResponseEntity<List<Facility>> getAll() {
        return ResponseEntity.ok(facilityService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Facility> getById(@PathVariable int id) {
        return ResponseEntity.ok(facilityService.getById(id));
    }

    // 🔒 Hanya Admin Aplikasi
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN_APP')")
    public ResponseEntity<Facility> create(@RequestBody Facility facility) {
        return ResponseEntity.ok(facilityService.create(facility));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN_APP')")
    public ResponseEntity<Facility> update(@PathVariable int id, @RequestBody Facility facility) {
        return ResponseEntity.ok(facilityService.update(id, facility));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN_APP')")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        facilityService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
