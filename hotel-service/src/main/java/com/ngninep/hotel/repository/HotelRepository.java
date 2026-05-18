package com.ngninep.hotel.repository;

import com.ngninep.hotel.entity.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HotelRepository extends JpaRepository<Hotel, Integer> {
    List<Hotel> findByCity_IdCity(int cityId);
    List<Hotel> findByFeaturedTrue();
    List<Hotel> findByNameContainingIgnoreCase(String keyword);
}
