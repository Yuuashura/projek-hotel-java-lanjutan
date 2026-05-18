package com.ngninep.hotel.controller;

import com.ngninep.hotel.entity.City;
import com.ngninep.hotel.service.CityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cities")
@RequiredArgsConstructor
public class CityController {

    private final CityService cityService;

    // ✅ Publik — untuk dropdown di form Register, Profil, tambah Hotel
    @GetMapping
    public ResponseEntity<List<City>> getAll() {
        return ResponseEntity.ok(cityService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<City> getById(@PathVariable int id) {
        return ResponseEntity.ok(cityService.getById(id));
    }

    // 🔒 Hanya Admin Aplikasi
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN_APP')")
    public ResponseEntity<City> create(@RequestBody City city) {
        return ResponseEntity.ok(cityService.create(city));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN_APP')")
    public ResponseEntity<City> update(@PathVariable int id, @RequestBody City city) {
        return ResponseEntity.ok(cityService.update(id, city));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN_APP')")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        cityService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
