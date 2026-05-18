package com.ngninep.hotel.controller;

import com.ngninep.hotel.entity.RoomType;
import com.ngninep.hotel.service.RoomTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/room-types")
@RequiredArgsConstructor
public class RoomTypeController {

    private final RoomTypeService roomTypeService;

    // ✅ Publik — lihat tipe kamar untuk suatu hotel
    @GetMapping("/hotel/{hotelId}")
    public ResponseEntity<List<RoomType>> getByHotel(@PathVariable int hotelId) {
        return ResponseEntity.ok(roomTypeService.getByHotelId(hotelId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoomType> getById(@PathVariable int id) {
        return ResponseEntity.ok(roomTypeService.getById(id));
    }

    // 🔒 Admin Hotel & Admin Aplikasi — kelola tipe kamar
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_HOTEL', 'ROLE_ADMIN_APP')")
    public ResponseEntity<RoomType> create(@RequestBody RoomType roomType) {
        return ResponseEntity.ok(roomTypeService.create(roomType));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_HOTEL', 'ROLE_ADMIN_APP')")
    public ResponseEntity<RoomType> update(@PathVariable int id, @RequestBody RoomType roomType) {
        return ResponseEntity.ok(roomTypeService.update(id, roomType));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_HOTEL', 'ROLE_ADMIN_APP')")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        roomTypeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
