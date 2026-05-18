package com.ngninep.hotel.controller;

import com.ngninep.hotel.entity.Hotel;
import com.ngninep.hotel.service.HotelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hotels")
@RequiredArgsConstructor
public class HotelController {

    private final HotelService hotelService;

    // ✅ Publik — browse & search hotel
    @GetMapping
    public ResponseEntity<List<Hotel>> getAll(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer cityId
    ) {
        return ResponseEntity.ok(hotelService.search(keyword, cityId));
    }

    @GetMapping("/featured")
    public ResponseEntity<List<Hotel>> getFeatured() {
        return ResponseEntity.ok(hotelService.getFeatured());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Hotel> getById(@PathVariable int id) {
        return ResponseEntity.ok(hotelService.getById(id));
    }

    // 🔒 Admin Hotel & Admin Aplikasi — kelola hotel
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_HOTEL', 'ROLE_ADMIN_APP')")
    public ResponseEntity<Hotel> create(@RequestBody Hotel hotel) {
        return ResponseEntity.ok(hotelService.create(hotel));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_HOTEL', 'ROLE_ADMIN_APP')")
    public ResponseEntity<Hotel> update(@PathVariable int id, @RequestBody Hotel hotel) {
        return ResponseEntity.ok(hotelService.update(id, hotel));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_HOTEL', 'ROLE_ADMIN_APP')")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        hotelService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
