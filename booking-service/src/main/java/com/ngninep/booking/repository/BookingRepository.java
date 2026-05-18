package com.ngninep.booking.repository;

import com.ngninep.booking.entity.Booking;
import com.ngninep.booking.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Integer> {
    
    List<Booking> findByCustomerId(int customerId);
    
    List<Booking> findByCustomerIdAndStatusIn(int customerId, List<BookingStatus> statuses);
    
    List<Booking> findByHotelId(int hotelId);
    
    List<Booking> findByStatus(BookingStatus status);
}
