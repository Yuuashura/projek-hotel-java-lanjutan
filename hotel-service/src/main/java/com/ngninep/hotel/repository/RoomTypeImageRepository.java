package com.ngninep.hotel.repository;

import com.ngninep.hotel.entity.RoomTypeImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomTypeImageRepository extends JpaRepository<RoomTypeImage, Integer> {

    @Query("SELECT i FROM RoomTypeImage i WHERE i.roomType.idRoomType = :roomTypeId ORDER BY i.sort_order ASC")
    List<RoomTypeImage> findByRoomTypeId(int roomTypeId);

    @Modifying
    @Query("DELETE FROM RoomTypeImage i WHERE i.roomType.idRoomType = :roomTypeId")
    void deleteByRoomTypeId(int roomTypeId);
}
