package com.ngninep.booking.service.impl;

import com.ngninep.booking.dto.req.BookingRequest;
import com.ngninep.booking.dto.req.PaymentRequest;
import com.ngninep.booking.dto.res.BookingResponse;
import com.ngninep.booking.entity.Booking;
import com.ngninep.booking.entity.BookingStatus;
import com.ngninep.booking.repository.BookingRepository;
import com.ngninep.booking.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private static final List<BookingStatus> ACTIVE_STATUSES =
            Arrays.asList(BookingStatus.PENDING, BookingStatus.CONFIRMED);
    private static final List<BookingStatus> HISTORY_STATUSES =
            Arrays.asList(BookingStatus.COMPLETED, BookingStatus.CANCELLED);

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
    @Transactional
    public BookingResponse createBooking(BookingRequest request, int customerId) {
        validateBookingDates(request);

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
    @Transactional
    public List<BookingResponse> getMyBookings(int customerId, String statusFilter, Integer page, Integer size) {
        expirePendingBookings();
        List<Booking> bookings;
        Pageable pageable = toPageable(page, size);
        if ("active".equalsIgnoreCase(statusFilter)) {
            bookings = pageable != null
                    ? bookingRepository.findByCustomerIdAndStatusIn(customerId, ACTIVE_STATUSES, pageable).getContent()
                    : bookingRepository.findByCustomerIdAndStatusIn(customerId, ACTIVE_STATUSES);
        } else if ("history".equalsIgnoreCase(statusFilter)) {
            bookings = pageable != null
                    ? bookingRepository.findByCustomerIdAndStatusIn(customerId, HISTORY_STATUSES, pageable).getContent()
                    : bookingRepository.findByCustomerIdAndStatusIn(customerId, HISTORY_STATUSES);
        } else {
            bookings = pageable != null
                    ? bookingRepository.findByCustomerId(customerId, pageable).getContent()
                    : bookingRepository.findByCustomerId(customerId);
        }
        return bookings.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<BookingResponse> getAllBookings(Integer page, Integer size) {
        expirePendingBookings();
        Pageable pageable = toPageable(page, size);
        List<Booking> bookings = pageable != null
                ? bookingRepository.findAll(pageable).getContent()
                : bookingRepository.findAll();
        return bookings.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<BookingResponse> getBookingsByHotel(int hotelId, Integer page, Integer size) {
        expirePendingBookings();
        Pageable pageable = toPageable(page, size);
        List<Booking> bookings = pageable != null
                ? bookingRepository.findByHotelId(hotelId, pageable).getContent()
                : bookingRepository.findByHotelId(hotelId);
        return bookings.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private Booking getBookingEntityById(int id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking tidak ditemukan"));
    }

    @Override
    @Transactional
    public BookingResponse getBookingById(int id) {
        expirePendingBookings();
        return mapToResponse(getBookingEntityById(id));
    }

    @Override
    @Transactional
    public BookingResponse payBooking(int id, PaymentRequest request, int customerId) {
        expirePendingBookings();
        Booking booking = getBookingEntityById(id);
        
        if (booking.getCustomerId() != customerId) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Anda tidak memiliki akses ke booking ini");
        }
        
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking sudah diproses atau dibatalkan");
        }

        if (booking.getPaymentDeadline() != null && LocalDateTime.now().isAfter(booking.getPaymentDeadline())) {
            booking.setStatus(BookingStatus.CANCELLED);
            bookingRepository.save(booking);
            throw new ResponseStatusException(HttpStatus.GONE, "Batas waktu pembayaran sudah lewat");
        }
        
        booking.setPaymentMethod(request.getPaymentMethod());
        booking.setPaymentProof(request.getPaymentProof());
        
        return mapToResponse(bookingRepository.save(booking));
    }

    @Override
    @Transactional
    public BookingResponse updateStatus(int id, BookingStatus status) {
        expirePendingBookings();
        Booking booking = getBookingEntityById(id);
        validateStatusTransition(booking.getStatus(), status);
        booking.setStatus(status);
        return mapToResponse(bookingRepository.save(booking));
    }

    @Override
    @Transactional
    public BookingResponse cancelBooking(int id, int customerId) {
        expirePendingBookings();
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
    @Transactional
    public void deleteBooking(int id) {
        Booking booking = getBookingEntityById(id);
        bookingRepository.delete(booking);
    }

    @Scheduled(fixedDelay = 300000)
    @Transactional
    public void expirePendingBookings() {
        List<Booking> expiredBookings = bookingRepository.findByStatusAndPaymentDeadlineBefore(
                BookingStatus.PENDING,
                LocalDateTime.now()
        );
        if (expiredBookings.isEmpty()) {
            return;
        }

        expiredBookings.forEach(booking -> booking.setStatus(BookingStatus.CANCELLED));
        bookingRepository.saveAll(expiredBookings);
    }

    private void validateBookingDates(BookingRequest request) {
        if (!request.getCheckOut().isAfter(request.getCheckIn())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tanggal check-out harus setelah check-in");
        }

        if (request.getCheckIn().isBefore(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tanggal check-in tidak boleh tanggal lampau");
        }
    }

    private void validateStatusTransition(BookingStatus currentStatus, BookingStatus nextStatus) {
        if (currentStatus == nextStatus) {
            return;
        }

        if (currentStatus == BookingStatus.CANCELLED || currentStatus == BookingStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Status " + currentStatus + " tidak bisa diubah lagi");
        }

        if (currentStatus == BookingStatus.PENDING &&
                nextStatus != BookingStatus.CONFIRMED &&
                nextStatus != BookingStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Booking PENDING hanya bisa dikonfirmasi atau dibatalkan");
        }

        if (currentStatus == BookingStatus.CONFIRMED &&
                nextStatus != BookingStatus.COMPLETED &&
                nextStatus != BookingStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Booking CONFIRMED hanya bisa diselesaikan atau dibatalkan");
        }
    }

    private Pageable toPageable(Integer page, Integer size) {
        if (page == null && size == null) {
            return null;
        }

        int safePage = page != null && page >= 0 ? page : 0;
        int safeSize = size != null && size > 0 ? Math.min(size, 100) : 10;
        return PageRequest.of(safePage, safeSize);
    }
}
