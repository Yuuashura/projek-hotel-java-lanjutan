package com.ngninep.booking.controller;

import com.ngninep.booking.dto.req.BookingRequest;
import com.ngninep.booking.dto.req.PaymentRequest;
import com.ngninep.booking.dto.req.UpdateStatusRequest;
import com.ngninep.booking.dto.res.BookingResponse;
import com.ngninep.booking.dto.res.WebResponse;
import com.ngninep.booking.entity.BookingStatus;
import com.ngninep.booking.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    // Helper untuk mengambil userId dari JWT
    private int getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Object credentials = authentication.getCredentials();
        if (credentials == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.UNAUTHORIZED, "User ID tidak ditemukan dalam token"
            );
        }
        return (Integer) credentials;
    }

    // 🔒 USER — Membuat pesanan baru
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public ResponseEntity<WebResponse<BookingResponse>> createBooking(@Valid @RequestBody BookingRequest request) {
        int customerId = getCurrentUserId();
        WebResponse<BookingResponse> response = WebResponse.<BookingResponse>builder()
                .status("200")
                .message("Pesanan berhasil dibuat")
                .data(bookingService.createBooking(request, customerId))
                .build();
        return ResponseEntity.ok(response);
    }

    // 🔒 USER — Melihat riwayat pesanan sendiri
    @GetMapping("/my")
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public ResponseEntity<WebResponse<List<BookingResponse>>> getMyBookings(
            @RequestParam(required = false, defaultValue = "all") String status) {
        int customerId = getCurrentUserId();
        WebResponse<List<BookingResponse>> response = WebResponse.<List<BookingResponse>>builder()
                .status("200")
                .message("Berhasil mengambil data pesanan")
                .data(bookingService.getMyBookings(customerId, status))
                .build();
        return ResponseEntity.ok(response);
    }

    // 🔒 USER — Membayar pesanan (Upload bukti bayar)
    @PatchMapping("/{id}/pay")
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public ResponseEntity<WebResponse<BookingResponse>> payBooking(
            @PathVariable int id, 
            @Valid @RequestBody PaymentRequest request) {
        
        int customerId = getCurrentUserId();
        
        WebResponse<BookingResponse> response = WebResponse.<BookingResponse>builder()
                .status("200")
                .message("Pembayaran berhasil diproses")
                .data(bookingService.payBooking(id, request, customerId))
                .build();
        return ResponseEntity.ok(response);
    }

    // 🔒 ADMIN_APP & ADMIN_HOTEL — Melihat semua pesanan
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_APP', 'ROLE_ADMIN_HOTEL')")
    public ResponseEntity<WebResponse<List<BookingResponse>>> getAllBookings() {
        WebResponse<List<BookingResponse>> response = WebResponse.<List<BookingResponse>>builder()
                .status("200")
                .message("Berhasil mengambil semua pesanan")
                .data(bookingService.getAllBookings())
                .build();
        return ResponseEntity.ok(response);
    }

    // 🔒 ADMIN_HOTEL — Melihat pesanan berdasarkan hotel miliknya (Untuk filter manual)
    @GetMapping("/hotel/{hotelId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_APP', 'ROLE_ADMIN_HOTEL')")
    public ResponseEntity<WebResponse<List<BookingResponse>>> getBookingsByHotel(@PathVariable int hotelId) {
        WebResponse<List<BookingResponse>> response = WebResponse.<List<BookingResponse>>builder()
                .status("200")
                .message("Berhasil mengambil pesanan hotel")
                .data(bookingService.getBookingsByHotel(hotelId))
                .build();
        return ResponseEntity.ok(response);
    }

    // 🔒 ADMIN_APP & ADMIN_HOTEL — Mengupdate status pesanan (Konfirmasi, Cancel, Selesai)
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_APP', 'ROLE_ADMIN_HOTEL')")
    public ResponseEntity<WebResponse<BookingResponse>> updateStatus(
            @PathVariable int id, 
            @Valid @RequestBody UpdateStatusRequest request) {
        
        BookingStatus status = BookingStatus.valueOf(request.getStatus().toUpperCase());
        
        WebResponse<BookingResponse> response = WebResponse.<BookingResponse>builder()
                .status("200")
                .message("Status pesanan berhasil diperbarui")
                .data(bookingService.updateStatus(id, status))
                .build();
        return ResponseEntity.ok(response);
    }

    // 🔒 ADMIN_APP — Menghapus pesanan secara permanen
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN_APP')")
    public ResponseEntity<WebResponse<Void>> deleteBooking(@PathVariable int id) {
        bookingService.deleteBooking(id);
        WebResponse<Void> response = WebResponse.<Void>builder()
                .status("200")
                .message("Pesanan berhasil dihapus secara permanen")
                .build();
        return ResponseEntity.ok(response);
    }
}
