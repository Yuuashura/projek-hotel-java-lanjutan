package com.ngninep.booking.service;

import com.ngninep.booking.dto.req.BookingRequest;
import com.ngninep.booking.dto.req.PaymentRequest;
import com.ngninep.booking.dto.res.BookingResponse;
import com.ngninep.booking.entity.BookingStatus;

import java.util.List;

public interface BookingService {
    BookingResponse createBooking(BookingRequest request, int customerId);
    
    List<BookingResponse> getMyBookings(int customerId, String statusFilter);
    
    List<BookingResponse> getAllBookings();
    
    List<BookingResponse> getBookingsByHotel(int hotelId);
    
    BookingResponse getBookingById(int id);
    
    BookingResponse payBooking(int id, PaymentRequest request, int customerId);
    
    BookingResponse updateStatus(int id, BookingStatus status);
    
    void deleteBooking(int id);
}
