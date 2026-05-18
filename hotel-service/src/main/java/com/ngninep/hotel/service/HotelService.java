package com.ngninep.hotel.service;

import com.ngninep.hotel.entity.Hotel;

import java.util.List;

public interface HotelService {
    List<Hotel> getAll();
    List<Hotel> search(String keyword, Integer cityId);
    List<Hotel> getFeatured();
    Hotel getById(int id);
    Hotel create(Hotel hotel);
    Hotel update(int id, Hotel hotel);
    void delete(int id);
}
