package com.ngninep.booking.repository;

import com.ngninep.booking.entity.Booking;
import com.ngninep.booking.entity.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Integer> {
    
    List<Booking> findByCustomerId(int customerId);

    Page<Booking> findByCustomerId(int customerId, Pageable pageable);
    
    List<Booking> findByCustomerIdAndStatusIn(int customerId, List<BookingStatus> statuses);

    Page<Booking> findByCustomerIdAndStatusIn(int customerId, List<BookingStatus> statuses, Pageable pageable);
    
    List<Booking> findByHotelId(int hotelId);

    Page<Booking> findByHotelId(int hotelId, Pageable pageable);
    
    List<Booking> findByStatus(BookingStatus status);

    List<Booking> findByStatusAndPaymentDeadlineBefore(BookingStatus status, LocalDateTime paymentDeadline);
}
