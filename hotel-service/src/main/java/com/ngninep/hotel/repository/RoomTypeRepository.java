package com.ngninep.hotel.repository;

import com.ngninep.hotel.entity.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoomTypeRepository extends JpaRepository<RoomType, Integer> {
    List<RoomType> findByHotel_IdHotel(int hotelId);
}
