package com.ngninep.booking.service.impl;

import com.ngninep.booking.dto.req.BookingRequest;
import com.ngninep.booking.dto.req.PaymentRequest;
import com.ngninep.booking.dto.res.BookingResponse;
import com.ngninep.booking.entity.Booking;
import com.ngninep.booking.entity.BookingStatus;
import com.ngninep.booking.repository.BookingRepository;
import com.ngninep.booking.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;

    private BookingResponse mapToResponse(Booking booking) {
        return BookingResponse.builder()
                .idBooking(booking.getIdBooking())
                .customerId(booking.getCustomerId())
                .hotelId(booking.getHotelId())
                .roomTypeId(booking.getRoomTypeId())
                .checkIn(booking.getCheckIn())
                .checkOut(booking.getCheckOut())
                .numberOfGuest(booking.getNumberOfGuest())
                .totalPrice(booking.getTotalPrice())
                .ordererName(booking.getOrdererName())
                .ordererPhone(booking.getOrdererPhone())
                .ordererEmail(booking.getOrdererEmail())
                .forSelf(booking.isForSelf())
                .status(booking.getStatus() != null ? booking.getStatus().name() : null)
                .paymentMethod(booking.getPaymentMethod())
                .paymentProof(booking.getPaymentProof())
                .createdAt(booking.getCreatedAt())
                .paymentDeadline(booking.getPaymentDeadline())
                .build();
    }

    @Override
    public BookingResponse createBooking(BookingRequest request, int customerId) {
        Booking booking = Booking.builder()
                .customerId(customerId)
                .hotelId(request.getHotelId())
                .roomTypeId(request.getRoomTypeId())
                .checkIn(request.getCheckIn())
                .checkOut(request.getCheckOut())
                .numberOfGuest(request.getNumberOfGuest())
                .totalPrice(request.getTotalPrice())
                .ordererName(request.getOrdererName())
                .ordererPhone(request.getOrdererPhone())
                .ordererEmail(request.getOrdererEmail())
                .forSelf(request.getIsForSelf() != null ? request.getIsForSelf() : true)
                .status(BookingStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .paymentDeadline(LocalDateTime.now().plusHours(24))
                .build();
        
        return mapToResponse(bookingRepository.save(booking));
    }

    @Override
    public List<BookingResponse> getMyBookings(int customerId, String statusFilter) {
        List<Booking> bookings;
        if ("active".equalsIgnoreCase(statusFilter)) {
            bookings = bookingRepository.findByCustomerIdAndStatusIn(customerId, 
                    Arrays.asList(BookingStatus.PENDING, BookingStatus.CONFIRMED));
        } else if ("history".equalsIgnoreCase(statusFilter)) {
            bookings = bookingRepository.findByCustomerIdAndStatusIn(customerId, 
                    Arrays.asList(BookingStatus.COMPLETED, BookingStatus.CANCELLED));
        } else {
            bookings = bookingRepository.findByCustomerId(customerId);
        }
        return bookings.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingResponse> getBookingsByHotel(int hotelId) {
        return bookingRepository.findByHotelId(hotelId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private Booking getBookingEntityById(int id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking tidak ditemukan"));
    }

    @Override
    public BookingResponse getBookingById(int id) {
        return mapToResponse(getBookingEntityById(id));
    }

    @Override
    public BookingResponse payBooking(int id, PaymentRequest request, int customerId) {
        Booking booking = getBookingEntityById(id);
        
        if (booking.getCustomerId() != customerId) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Anda tidak memiliki akses ke booking ini");
        }
        
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking sudah diproses atau dibatalkan");
        }
        
        booking.setPaymentMethod(request.getPaymentMethod());
        booking.setPaymentProof(request.getPaymentProof());
        
        return mapToResponse(bookingRepository.save(booking));
    }

    @Override
    public BookingResponse updateStatus(int id, BookingStatus status) {
        Booking booking = getBookingEntityById(id);
        booking.setStatus(status);
        return mapToResponse(bookingRepository.save(booking));
    }

    @Override
    public BookingResponse cancelBooking(int id, int customerId) {
        Booking booking = getBookingEntityById(id);
        
        if (booking.getCustomerId() != customerId) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Anda tidak memiliki akses ke booking ini");
        }
        
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Hanya pesanan dengan status PENDING yang bisa dibatalkan");
        }
        
        booking.setStatus(BookingStatus.CANCELLED);
        return mapToResponse(bookingRepository.save(booking));
    }

    @Override
    public void deleteBooking(int id) {
        Booking booking = getBookingEntityById(id);
        bookingRepository.delete(booking);
    }
}
