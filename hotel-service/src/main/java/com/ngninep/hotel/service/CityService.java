package com.ngninep.hotel.service;

import com.ngninep.hotel.dto.req.CityRequest;
import com.ngninep.hotel.dto.res.CityResponse;

import java.util.List;

public interface CityService {
    List<CityResponse> getAll();
    CityResponse getById(int id);
    CityResponse create(CityRequest request);
    CityResponse update(int id, CityRequest request);
    void delete(int id);
}
