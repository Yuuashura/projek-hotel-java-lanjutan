package com.ngninep.booking.repository;

import com.ngninep.booking.entity.Booking;
import com.ngninep.booking.entity.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
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

    long countByStatus(BookingStatus status);

    long countByStatusIn(List<BookingStatus> statuses);

    long countByRoomTypeIdAndStatusInAndCheckInLessThanAndCheckOutGreaterThan(
            int roomTypeId,
            List<BookingStatus> statuses,
            LocalDate checkOut,
            LocalDate checkIn
    );

    @Query("select coalesce(sum(b.totalPrice), 0) from Booking b where b.status in :statuses")
    Long sumTotalPriceByStatusIn(@Param("statuses") List<BookingStatus> statuses);
}
