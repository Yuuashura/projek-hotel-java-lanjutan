package com.ngninep.booking.service.impl;

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

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;

    @Override
    public Booking createBooking(Booking booking, int customerId) {
        // Idealnya, di sini kita memanggil Hotel Service via Feign Client 
        // untuk mengecek room_available dan price_per_night, lalu menghitung total_price.
        // Untuk MVP, kita asumsikan data yang dikirim dari frontend sudah benar.
        
        booking.setCustomerId(customerId);
        booking.setStatus(BookingStatus.PENDING);
        booking.setCreatedAt(LocalDateTime.now());
        booking.setPaymentDeadline(LocalDateTime.now().plusHours(24));
        
        return bookingRepository.save(booking);
    }

    @Override
    public List<Booking> getMyBookings(int customerId, String statusFilter) {
        if ("active".equalsIgnoreCase(statusFilter)) {
            return bookingRepository.findByCustomerIdAndStatusIn(customerId, 
                    Arrays.asList(BookingStatus.PENDING, BookingStatus.CONFIRMED));
        } else if ("history".equalsIgnoreCase(statusFilter)) {
            return bookingRepository.findByCustomerIdAndStatusIn(customerId, 
                    Arrays.asList(BookingStatus.COMPLETED, BookingStatus.CANCELLED));
        }
        return bookingRepository.findByCustomerId(customerId);
    }

    @Override
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    @Override
    public List<Booking> getBookingsByHotel(int hotelId) {
        return bookingRepository.findByHotelId(hotelId);
    }

    @Override
    public Booking getBookingById(int id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking tidak ditemukan"));
    }

    @Override
    public Booking payBooking(int id, String paymentMethod, String paymentProof, int customerId) {
        Booking booking = getBookingById(id);
        
        if (booking.getCustomerId() != customerId) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Anda tidak memiliki akses ke booking ini");
        }
        
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking sudah diproses atau dibatalkan");
        }
        
        booking.setPaymentMethod(paymentMethod);
        booking.setPaymentProof(paymentProof);
        // Status tetap PENDING, menunggu konfirmasi admin
        
        return bookingRepository.save(booking);
    }

    @Override
    public Booking updateStatus(int id, BookingStatus status) {
        Booking booking = getBookingById(id);
        booking.setStatus(status);
        return bookingRepository.save(booking);
    }

    @Override
    public void deleteBooking(int id) {
        Booking booking = getBookingById(id);
        bookingRepository.delete(booking);
    }
}
