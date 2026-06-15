package com.ngninep.booking.service;

import com.ngninep.booking.dto.req.BookingRequest;
import com.ngninep.booking.dto.req.PaymentRequest;
import com.ngninep.booking.dto.res.BookingResponse;
import com.ngninep.booking.dto.res.BookingStatsResponse;
import com.ngninep.booking.dto.res.PagedResult;
import com.ngninep.booking.dto.res.RoomAvailabilityResponse;
import com.ngninep.booking.entity.BookingStatus;

import java.io.ByteArrayInputStream;
import java.util.List;

public interface BookingService {
    BookingResponse createBooking(BookingRequest request, int customerId);
    
    PagedResult<BookingResponse> getMyBookings(int customerId, String statusFilter, Integer page, Integer size);
    
    PagedResult<BookingResponse> getAllBookings(Integer page, Integer size);
    
    PagedResult<BookingResponse> getBookingsByHotel(int hotelId, Integer page, Integer size);

    List<RoomAvailabilityResponse> getRoomAvailabilityByHotel(int hotelId);
    
    BookingResponse getBookingById(int id);
    
    BookingResponse payBooking(int id, PaymentRequest request, int customerId);
    
    BookingResponse updateStatus(int id, BookingStatus status);
    
    BookingResponse cancelBooking(int id, int customerId);
    
    BookingStatsResponse getDashboardStats();

    ByteArrayInputStream downloadExcel() throws Exception;

    void deleteBooking(int id);
}
