package com.ngninep.hotel.service;

import com.ngninep.hotel.dto.req.FacilityRequest;
import com.ngninep.hotel.dto.res.FacilityResponse;

import java.util.List;

public interface FacilityService {
    List<FacilityResponse> getAll();
    FacilityResponse getById(int id);
    FacilityResponse create(FacilityRequest request);
    FacilityResponse update(int id, FacilityRequest request);
    void delete(int id);
}
