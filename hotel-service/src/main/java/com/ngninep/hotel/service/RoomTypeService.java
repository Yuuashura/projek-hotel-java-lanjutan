package com.ngninep.hotel.service;

import com.ngninep.hotel.entity.RoomType;

import java.util.List;

public interface RoomTypeService {
    List<RoomType> getByHotelId(int hotelId);
    RoomType getById(int id);
    RoomType create(RoomType roomType);
    RoomType update(int id, RoomType roomType);
    void delete(int id);
}
