package com.ngninep.hotel.repository;

import com.ngninep.hotel.entity.HotelImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HotelImageRepository extends JpaRepository<HotelImage, Integer> {

    @Query("SELECT i FROM HotelImage i WHERE i.hotel.idHotel = :hotelId ORDER BY i.sort_order ASC")
    List<HotelImage> findByHotelId(int hotelId);

    @Modifying
    @Query("DELETE FROM HotelImage i WHERE i.hotel.idHotel = :hotelId")
    void deleteByHotelId(int hotelId);
}
