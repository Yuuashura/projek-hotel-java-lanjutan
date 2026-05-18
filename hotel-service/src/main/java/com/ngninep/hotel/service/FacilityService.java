package com.ngninep.hotel.service;

import com.ngninep.hotel.entity.Facility;

import java.util.List;

public interface FacilityService {
    List<Facility> getAll();
    Facility getById(int id);
    Facility create(Facility facility);
    Facility update(int id, Facility facility);
    void delete(int id);
}
