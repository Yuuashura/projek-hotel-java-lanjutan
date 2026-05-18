package com.ngninep.hotel.service;

import com.ngninep.hotel.dto.req.RoomTypeRequest;
import com.ngninep.hotel.dto.res.RoomTypeResponse;

import java.util.List;

public interface RoomTypeService {
    List<RoomTypeResponse> getByHotelId(int hotelId);
    RoomTypeResponse getById(int id);
    RoomTypeResponse create(RoomTypeRequest request);
    RoomTypeResponse update(int id, RoomTypeRequest request);
    void delete(int id);
}
