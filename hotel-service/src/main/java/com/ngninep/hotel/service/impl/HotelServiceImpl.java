package com.ngninep.hotel.service.impl;

import com.ngninep.hotel.entity.Hotel;
import com.ngninep.hotel.repository.HotelRepository;
import com.ngninep.hotel.service.HotelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HotelServiceImpl implements HotelService {

    private final HotelRepository hotelRepository;

    @Override
    public List<Hotel> getAll() {
        return hotelRepository.findAll();
    }

    @Override
    public List<Hotel> search(String keyword, Integer cityId) {
        if (keyword != null && !keyword.isBlank()) {
            return hotelRepository.findByNameContainingIgnoreCase(keyword);
        }
        if (cityId != null) {
            return hotelRepository.findByCity_IdCity(cityId);
        }
        return hotelRepository.findAll();
    }

    @Override
    public List<Hotel> getFeatured() {
        return hotelRepository.findByFeaturedTrue();
    }

    @Override
    public Hotel getById(int id) {
        return hotelRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hotel tidak ditemukan"));
    }

    @Override
    public Hotel create(Hotel hotel) {
        return hotelRepository.save(hotel);
    }

    @Override
    public Hotel update(int id, Hotel hotelData) {
        Hotel hotel = getById(id);
        hotel.setName(hotelData.getName());
        hotel.setCity(hotelData.getCity());
        hotel.setAddress(hotelData.getAddress());
        hotel.setType(hotelData.getType());
        hotel.setDescription(hotelData.getDescription());
        hotel.setFeatured(hotelData.isFeatured());
        hotel.setOnSale(hotelData.isOnSale());
        hotel.setDiscount_percent(hotelData.getDiscount_percent());
        hotel.setRating(hotelData.getRating());
        return hotelRepository.save(hotel);
    }

    @Override
    public void delete(int id) {
        Hotel hotel = getById(id);
        hotelRepository.delete(hotel);
    }
}
