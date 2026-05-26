package com.ngninep.hotel.service.impl;

import com.ngninep.hotel.dto.req.RoomTypeRequest;
import com.ngninep.hotel.dto.res.RoomTypeImageResponse;
import com.ngninep.hotel.dto.res.RoomTypeResponse;
import com.ngninep.hotel.entity.Hotel;
import com.ngninep.hotel.entity.RoomType;
import com.ngninep.hotel.entity.RoomTypeImage;
import com.ngninep.hotel.repository.HotelRepository;
import com.ngninep.hotel.repository.RoomTypeImageRepository;
import com.ngninep.hotel.repository.RoomTypeRepository;
import com.ngninep.hotel.service.RoomTypeService;
import com.ngninep.hotel.util.Message;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomTypeServiceImpl implements RoomTypeService {

    private final RoomTypeRepository roomTypeRepository;
    private final HotelRepository hotelRepository;
    private final RoomTypeImageRepository roomTypeImageRepository;

    private RoomTypeResponse mapToResponse(RoomType roomType) {
        // Map gambar tipe kamar
        List<Object> images = roomTypeImageRepository
                .findByRoomTypeId(roomType.getIdRoomType())
                .stream()
                .map(img -> (Object) RoomTypeImageResponse.builder()
                        .idImage(img.getIdImage())
                        .imageUrl(img.getImage_url())
                        .sortOrder(img.getSort_order())
                        .build())
                .collect(Collectors.toList());

        return RoomTypeResponse.builder()
                .idRoomType(roomType.getIdRoomType())
                .name(roomType.getName())
                .hotelId(roomType.getHotel() != null ? roomType.getHotel().getIdHotel() : 0)
                .description(roomType.getDescription())
                .pricePerNight(roomType.getPrice_per_night())
                .maxGuest(roomType.getMax_guest())
                .smoking(roomType.isSmoking())
                .roomAvailable(roomType.getRoom_available())
                .images(images)
                .facilities(new ArrayList<>())
                .build();
    }

    @Override
    public List<RoomTypeResponse> getByHotelId(int hotelId) {
        return roomTypeRepository.findByHotel_IdHotel(hotelId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public RoomTypeResponse getById(int id) {
        RoomType roomType = roomTypeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, Message.ROOM_TYPE_NOT_FOUND));
        return mapToResponse(roomType);
    }

    @Override
    @Transactional
    public RoomTypeResponse create(RoomTypeRequest request) {
        Hotel hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, Message.HOTEL_INVALID));
                
        RoomType roomType = RoomType.builder()
                .name(request.getName())
                .hotel(hotel)
                .description(request.getDescription())
                .price_per_night(request.getPricePerNight())
                .max_guest(request.getMaxGuest())
                .smoking(request.isSmoking())
                .room_available(request.getRoomAvailable())
                .build();
        
        RoomType saved = roomTypeRepository.save(roomType);

        // Simpan gambar jika ada
        if (request.getImageUrl() != null && !request.getImageUrl().isBlank()) {
            roomTypeImageRepository.save(RoomTypeImage.builder()
                    .roomType(saved)
                    .image_url(request.getImageUrl())
                    .sort_order(0)
                    .build());
        }

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public RoomTypeResponse update(int id, RoomTypeRequest request) {
        RoomType roomType = roomTypeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, Message.ROOM_TYPE_NOT_FOUND));
                
        Hotel hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, Message.HOTEL_INVALID));
                
        roomType.setName(request.getName());
        roomType.setHotel(hotel);
        roomType.setDescription(request.getDescription());
        roomType.setPrice_per_night(request.getPricePerNight());
        roomType.setMax_guest(request.getMaxGuest());
        roomType.setSmoking(request.isSmoking());
        roomType.setRoom_available(request.getRoomAvailable());
        
        RoomType saved = roomTypeRepository.save(roomType);

        // Update gambar jika ada yang baru
        if (request.getImageUrl() != null && !request.getImageUrl().isBlank()) {
            roomTypeImageRepository.deleteByRoomTypeId(id);
            roomTypeImageRepository.save(RoomTypeImage.builder()
                    .roomType(saved)
                    .image_url(request.getImageUrl())
                    .sort_order(0)
                    .build());
        }

        return mapToResponse(saved);
    }

    @Override
    public void delete(int id) {
        RoomType roomType = roomTypeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, Message.ROOM_TYPE_NOT_FOUND));
        roomTypeRepository.delete(roomType);
    }
}
