package com.ngninep.booking.controller;

import com.ngninep.booking.dto.req.BookingRequest;
import com.ngninep.booking.dto.req.PaymentRequest;
import com.ngninep.booking.dto.req.UpdateStatusRequest;
import com.ngninep.booking.dto.res.BookingResponse;
import com.ngninep.booking.dto.res.BookingStatsResponse;
import com.ngninep.booking.dto.res.PagedResult;
import com.ngninep.booking.dto.res.WebResponse;
import com.ngninep.booking.entity.BookingStatus;
import com.ngninep.booking.service.FileStorageService;
import com.ngninep.booking.service.BookingService;
import com.ngninep.booking.util.Message;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final FileStorageService fileStorageService;

    // Helper untuk mengambil userId dari JWT
    private int getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Object credentials = authentication.getCredentials();
        if (credentials == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, Message.USER_ID_NOT_FOUND_IN_TOKEN
            );
        }
        return (Integer) credentials;
    }

    // Membuat pesanan baru
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public ResponseEntity<WebResponse<BookingResponse>> createBooking(@Valid @RequestBody BookingRequest request) {
        int customerId = getCurrentUserId();
        WebResponse<BookingResponse> response = WebResponse.<BookingResponse>builder()
                .status("200")
                .message(Message.BOOKING_CREATED)
                .data(bookingService.createBooking(request, customerId))
                .build();
        return ResponseEntity.ok(response);
    }

    // Melihat riwayat pesanan sendiri
    @GetMapping("/my")
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public ResponseEntity<WebResponse<List<BookingResponse>>> getMyBookings(
            @RequestParam(required = false, defaultValue = "all") String status,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        int customerId = getCurrentUserId();
        PagedResult<BookingResponse> result = bookingService.getMyBookings(customerId, status, page, size);
        WebResponse<List<BookingResponse>> response = WebResponse.<List<BookingResponse>>builder()
                .status("200")
                .message(Message.BOOKING_DATA_FETCHED)
                .data(result.getData())
                .pagination(result.getPagination())
                .build();
        return ResponseEntity.ok(response);
    }

    // Membayar pesanan
    @PatchMapping("/{id}/pay")
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public ResponseEntity<WebResponse<BookingResponse>> payBooking(
            @PathVariable int id, 
            @Valid @RequestBody PaymentRequest request) {
        
        int customerId = getCurrentUserId();
        
        WebResponse<BookingResponse> response = WebResponse.<BookingResponse>builder()
                .status("200")
                .message(Message.BOOKING_PAYMENT_PROCESSED)
                .data(bookingService.payBooking(id, request, customerId))
                .build();
        return ResponseEntity.ok(response);
    }

    @PatchMapping(value = "/{id}/pay-upload", consumes = "multipart/form-data")
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public ResponseEntity<WebResponse<BookingResponse>> payBookingWithUpload(
            @PathVariable int id,
            @RequestParam("payment_method") String paymentMethod,
            @RequestParam("payment_proof") MultipartFile paymentProof) {

        int customerId = getCurrentUserId();
        String proofUrl = fileStorageService.savePaymentProof(paymentProof);
        PaymentRequest request = PaymentRequest.builder()
                .paymentMethod(paymentMethod)
                .paymentProof(proofUrl)
                .build();

        WebResponse<BookingResponse> response = WebResponse.<BookingResponse>builder()
                .status("200")
                .message(Message.BOOKING_PAYMENT_PROCESSED)
                .data(bookingService.payBooking(id, request, customerId))
                .build();
        return ResponseEntity.ok(response);
    }

    // Membatalkan pesanan sendiri (hanya yang berstatus PENDING)
    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public ResponseEntity<WebResponse<BookingResponse>> cancelBooking(@PathVariable int id) {
        int customerId = getCurrentUserId();
        WebResponse<BookingResponse> response = WebResponse.<BookingResponse>builder()
                .status("200")
                .message(Message.BOOKING_CANCELLED)
                .data(bookingService.cancelBooking(id, customerId))
                .build();
        return ResponseEntity.ok(response);
    }

    // Melihat semua pesanan
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_APP', 'ROLE_ADMIN_HOTEL')")
    public ResponseEntity<WebResponse<List<BookingResponse>>> getAllBookings(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        PagedResult<BookingResponse> result = bookingService.getAllBookings(page, size);
        WebResponse<List<BookingResponse>> response = WebResponse.<List<BookingResponse>>builder()
                .status("200")
                .message(Message.BOOKING_ALL_FETCHED)
                .data(result.getData())
                .pagination(result.getPagination())
                .build();
        return ResponseEntity.ok(response);
    }

    // Melihat pesanan berdasarkan hotel miliknya (Untuk filter manual)
    @GetMapping("/hotel/{hotelId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_APP', 'ROLE_ADMIN_HOTEL')")
    public ResponseEntity<WebResponse<List<BookingResponse>>> getBookingsByHotel(
            @PathVariable int hotelId,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        PagedResult<BookingResponse> result = bookingService.getBookingsByHotel(hotelId, page, size);
        WebResponse<List<BookingResponse>> response = WebResponse.<List<BookingResponse>>builder()
                .status("200")
                .message(Message.BOOKING_BY_HOTEL_FETCHED)
                .data(result.getData())
                .pagination(result.getPagination())
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/dashboard/stats")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_APP', 'ROLE_ADMIN_HOTEL')")
    public ResponseEntity<WebResponse<BookingStatsResponse>> getDashboardStats() {
        WebResponse<BookingStatsResponse> response = WebResponse.<BookingStatsResponse>builder()
                .status("200")
                .message(Message.BOOKING_STATS_FETCHED)
                .data(bookingService.getDashboardStats())
                .build();
        return ResponseEntity.ok(response);
    }

    // Mengupdate status pesanan (Konfirmasi, Cancel, Selesai)
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_APP', 'ROLE_ADMIN_HOTEL')")
    public ResponseEntity<WebResponse<BookingResponse>> updateStatus(
            @PathVariable int id, 
            @Valid @RequestBody UpdateStatusRequest request) {
        
        BookingStatus status;
        try {
            status = BookingStatus.valueOf(request.getStatus().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    Message.BOOKING_STATUS_INVALID
            );
        }
        
        WebResponse<BookingResponse> response = WebResponse.<BookingResponse>builder()
                .status("200")
                .message(Message.BOOKING_STATUS_UPDATED)
                .data(bookingService.updateStatus(id, status))
                .build();
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN_APP')")
    public ResponseEntity<WebResponse<Void>> deleteBooking(@PathVariable int id) {
        bookingService.deleteBooking(id);
        WebResponse<Void> response = WebResponse.<Void>builder()
                .status("200")
                .message(Message.BOOKING_DELETED)
                .build();
        return ResponseEntity.ok(response);
    }
}
