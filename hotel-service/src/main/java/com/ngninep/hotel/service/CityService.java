package com.ngninep.hotel.service;

import com.ngninep.hotel.entity.City;

import java.util.List;

public interface CityService {
    List<City> getAll();
    City getById(int id);
    City create(City city);
    City update(int id, City city);
    void delete(int id);
}
