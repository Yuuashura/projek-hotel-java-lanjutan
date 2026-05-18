package com.ngninep.hotel.service.impl;

import com.ngninep.hotel.entity.RoomType;
import com.ngninep.hotel.repository.RoomTypeRepository;
import com.ngninep.hotel.service.RoomTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomTypeServiceImpl implements RoomTypeService {

    private final RoomTypeRepository roomTypeRepository;

    @Override
    public List<RoomType> getByHotelId(int hotelId) {
        return roomTypeRepository.findByHotel_IdHotel(hotelId);
    }

    @Override
    public RoomType getById(int id) {
        return roomTypeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tipe kamar tidak ditemukan"));
    }

    @Override
    public RoomType create(RoomType roomType) {
        return roomTypeRepository.save(roomType);
    }

    @Override
    public RoomType update(int id, RoomType roomTypeData) {
        RoomType roomType = getById(id);
        roomType.setName(roomTypeData.getName());
        roomType.setPrice_per_night(roomTypeData.getPrice_per_night());
        roomType.setRoom_available(roomTypeData.getRoom_available());
        roomType.setMax_guest(roomTypeData.getMax_guest());
        roomType.setSmoking(roomTypeData.isSmoking());
        roomType.setDescription(roomTypeData.getDescription());
        return roomTypeRepository.save(roomType);
    }

    @Override
    public void delete(int id) {
        RoomType roomType = getById(id);
        roomTypeRepository.delete(roomType);
    }
}
