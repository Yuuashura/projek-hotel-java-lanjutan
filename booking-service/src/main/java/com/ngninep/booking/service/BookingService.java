package com.ngninep.booking.service;

import com.ngninep.booking.entity.Booking;
import com.ngninep.booking.entity.BookingStatus;

import java.util.List;

public interface BookingService {
    Booking createBooking(Booking booking, int customerId);
    
    List<Booking> getMyBookings(int customerId, String statusFilter);
    
    List<Booking> getAllBookings();
    
    List<Booking> getBookingsByHotel(int hotelId);
    
    Booking getBookingById(int id);
    
    Booking payBooking(int id, String paymentMethod, String paymentProof, int customerId);
    
    Booking updateStatus(int id, BookingStatus status);
    
    void deleteBooking(int id);
}
