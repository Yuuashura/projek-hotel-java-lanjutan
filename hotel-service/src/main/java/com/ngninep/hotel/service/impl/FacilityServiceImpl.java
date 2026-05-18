package com.ngninep.hotel.service.impl;

import com.ngninep.hotel.entity.Facility;
import com.ngninep.hotel.repository.FacilityRepository;
import com.ngninep.hotel.service.FacilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FacilityServiceImpl implements FacilityService {

    private final FacilityRepository facilityRepository;

    @Override
    public List<Facility> getAll() {
        return facilityRepository.findAll();
    }

    @Override
    public Facility getById(int id) {
        return facilityRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fasilitas tidak ditemukan"));
    }

    @Override
    public Facility create(Facility facility) {
        return facilityRepository.save(facility);
    }

    @Override
    public Facility update(int id, Facility facilityData) {
        Facility facility = getById(id);
        facility.setName(facilityData.getName());
        facility.setIcon(facilityData.getIcon());
        return facilityRepository.save(facility);
    }

    @Override
    public void delete(int id) {
        Facility facility = getById(id);
        facilityRepository.delete(facility);
    }
}
