package com.ngninep.hotel.service;

import com.ngninep.hotel.dto.req.HotelRequest;
import com.ngninep.hotel.dto.res.HotelResponse;

import java.util.List;

public interface HotelService {
    List<HotelResponse> getAll();
    List<HotelResponse> search(String keyword, Integer cityId);
    List<HotelResponse> getFeatured();
    HotelResponse getById(int id);
    HotelResponse create(HotelRequest request);
    HotelResponse update(int id, HotelRequest request);
    void delete(int id);
}
