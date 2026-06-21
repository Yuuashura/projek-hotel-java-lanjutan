package com.ngninep.hotel.service.impl;

import com.ngninep.hotel.dto.req.FacilityRequest;
import com.ngninep.hotel.dto.res.FacilityResponse;
import com.ngninep.hotel.entity.Facility;
import com.ngninep.hotel.repository.FacilityRepository;
import com.ngninep.hotel.service.FacilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FacilityServiceImpl implements FacilityService {

    private final FacilityRepository facilityRepository;

    private FacilityResponse mapToResponse(Facility facility) {
        return FacilityResponse.builder()
                .idFacility(facility.getIdFacility())
                .name(facility.getName())
                .icon(facility.getIcon())
                .build();
    }

    @Override
    public List<FacilityResponse> getAll() {
        return facilityRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public FacilityResponse getById(int id) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fasilitas tidak ditemukan"));
        return mapToResponse(facility);
    }

    @Override
    public FacilityResponse create(FacilityRequest request) {
        Facility facility = Facility.builder()
                .name(request.getName())
                .icon(request.getIcon())
                .build();
        return mapToResponse(facilityRepository.save(facility));
    }

    @Override
    public FacilityResponse update(int id, FacilityRequest request) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fasilitas tidak ditemukan"));
        
        facility.setName(request.getName());
        facility.setIcon(request.getIcon());
        
        return mapToResponse(facilityRepository.save(facility));
    }

    @Override
    public void delete(int id) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fasilitas tidak ditemukan"));
        facilityRepository.delete(facility);
    }
}
