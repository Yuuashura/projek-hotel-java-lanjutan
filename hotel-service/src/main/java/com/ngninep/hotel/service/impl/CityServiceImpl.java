package com.ngninep.hotel.service.impl;

import com.ngninep.hotel.entity.City;
import com.ngninep.hotel.repository.CityRepository;
import com.ngninep.hotel.service.CityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CityServiceImpl implements CityService {

    private final CityRepository cityRepository;

    @Override
    public List<City> getAll() {
        return cityRepository.findAll();
    }

    @Override
    public City getById(int id) {
        return cityRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Kota tidak ditemukan"));
    }

    @Override
    public City create(City city) {
        return cityRepository.save(city);
    }

    @Override
    public City update(int id, City cityData) {
        City city = getById(id);
        city.setName(cityData.getName());
        city.setProvince(cityData.getProvince());
        return cityRepository.save(city);
    }

    @Override
    public void delete(int id) {
        City city = getById(id);
        cityRepository.delete(city);
    }
}
