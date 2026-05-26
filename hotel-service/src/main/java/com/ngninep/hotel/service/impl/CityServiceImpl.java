package com.ngninep.hotel.service.impl;

import com.ngninep.hotel.dto.req.CityRequest;
import com.ngninep.hotel.dto.res.CityResponse;
import com.ngninep.hotel.entity.City;
import com.ngninep.hotel.repository.CityRepository;
import com.ngninep.hotel.service.CityService;
import com.ngninep.hotel.util.Message;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CityServiceImpl implements CityService {

    private final CityRepository cityRepository;

    private CityResponse mapToResponse(City city) {
        return CityResponse.builder()
                .idCity(city.getIdCity())
                .name(city.getName())
                .province(city.getProvince())
                .build();
    }

    @Override
    public List<CityResponse> getAll() {
        return cityRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public CityResponse getById(int id) {
        City city = cityRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, Message.CITY_NOT_FOUND));
        return mapToResponse(city);
    }

    @Override
    public CityResponse create(CityRequest request) {
        City city = City.builder()
                .name(request.getName())
                .province(request.getProvince())
                .build();
        return mapToResponse(cityRepository.save(city));
    }

    @Override
    public CityResponse update(int id, CityRequest request) {
        City city = cityRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, Message.CITY_NOT_FOUND));
        
        city.setName(request.getName());
        city.setProvince(request.getProvince());
        
        return mapToResponse(cityRepository.save(city));
    }

    @Override
    public void delete(int id) {
        City city = cityRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, Message.CITY_NOT_FOUND));
        cityRepository.delete(city);
    }
}
