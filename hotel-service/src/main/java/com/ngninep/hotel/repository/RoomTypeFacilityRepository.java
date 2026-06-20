package com.ngninep.hotel.repository;

import com.ngninep.hotel.entity.RoomTypeFacility;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoomTypeFacilityRepository extends JpaRepository<RoomTypeFacility, Integer> {
    List<RoomTypeFacility> findByRoomType_IdRoomType(int roomTypeId);
    void deleteByRoomType_IdRoomType(int roomTypeId);
}
