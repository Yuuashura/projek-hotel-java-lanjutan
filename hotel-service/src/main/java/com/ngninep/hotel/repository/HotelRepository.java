package com.ngninep.hotel.repository;

import com.ngninep.hotel.entity.Hotel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HotelRepository extends JpaRepository<Hotel, Integer> {
    List<Hotel> findByCity_IdCity(int cityId);
    Page<Hotel> findByCity_IdCity(int cityId, Pageable pageable);
    List<Hotel> findByFeaturedTrue();
    List<Hotel> findByNameContainingIgnoreCase(String keyword);
    Page<Hotel> findByNameContainingIgnoreCase(String keyword, Pageable pageable);
}
