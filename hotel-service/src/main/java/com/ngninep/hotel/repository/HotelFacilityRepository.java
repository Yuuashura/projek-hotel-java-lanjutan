package com.ngninep.hotel.repository;

import com.ngninep.hotel.entity.HotelFacility;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface HotelFacilityRepository extends JpaRepository<HotelFacility, Integer> {
    Optional<HotelFacility> findByHotel_IdHotelAndFacility_IdFacility(int hotelId, int facilityId);
    boolean existsByHotel_IdHotelAndFacility_IdFacility(int hotelId, int facilityId);
    void deleteByHotel_IdHotel(int hotelId);
    void deleteByHotel_IdHotelAndFacility_IdFacility(int hotelId, int facilityId);
}
