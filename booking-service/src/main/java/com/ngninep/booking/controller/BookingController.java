package com.ngninep.booking.controller;

import com.ngninep.booking.entity.Booking;
import com.ngninep.booking.entity.BookingStatus;
import com.ngninep.booking.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    // Helper untuk mengambil userId dari JWT
    private int getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (Integer) authentication.getCredentials();
    }

    // 🔒 USER — Membuat pesanan baru
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public ResponseEntity<Booking> createBooking(@RequestBody Booking booking) {
        int customerId = getCurrentUserId();
        return ResponseEntity.ok(bookingService.createBooking(booking, customerId));
    }

    // 🔒 USER — Melihat riwayat pesanan sendiri
    @GetMapping("/my")
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public ResponseEntity<List<Booking>> getMyBookings(
            @RequestParam(required = false, defaultValue = "all") String status) {
        int customerId = getCurrentUserId();
        return ResponseEntity.ok(bookingService.getMyBookings(customerId, status));
    }

    // 🔒 USER — Membayar pesanan (Upload bukti bayar)
    @PatchMapping("/{id}/pay")
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public ResponseEntity<Booking> payBooking(
            @PathVariable int id, 
            @RequestBody Map<String, String> payload) {
        
        int customerId = getCurrentUserId();
        String paymentMethod = payload.get("payment_method");
        String paymentProof = payload.get("payment_proof");
        
        return ResponseEntity.ok(bookingService.payBooking(id, paymentMethod, paymentProof, customerId));
    }

    // 🔒 ADMIN_APP & ADMIN_HOTEL — Melihat semua pesanan
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_APP', 'ROLE_ADMIN_HOTEL')")
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    // 🔒 ADMIN_HOTEL — Melihat pesanan berdasarkan hotel miliknya (Untuk filter manual)
    @GetMapping("/hotel/{hotelId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_APP', 'ROLE_ADMIN_HOTEL')")
    public ResponseEntity<List<Booking>> getBookingsByHotel(@PathVariable int hotelId) {
        return ResponseEntity.ok(bookingService.getBookingsByHotel(hotelId));
    }

    // 🔒 ADMIN_APP & ADMIN_HOTEL — Mengupdate status pesanan (Konfirmasi, Cancel, Selesai)
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_APP', 'ROLE_ADMIN_HOTEL')")
    public ResponseEntity<Booking> updateStatus(
            @PathVariable int id, 
            @RequestBody Map<String, String> payload) {
        
        String statusStr = payload.get("status");
        BookingStatus status = BookingStatus.valueOf(statusStr.toUpperCase());
        
        return ResponseEntity.ok(bookingService.updateStatus(id, status));
    }

    // 🔒 ADMIN_APP — Menghapus pesanan secara permanen
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN_APP')")
    public ResponseEntity<Void> deleteBooking(@PathVariable int id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.noContent().build();
    }
}
