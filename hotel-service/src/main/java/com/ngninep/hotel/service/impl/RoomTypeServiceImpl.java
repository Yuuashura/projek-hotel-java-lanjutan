package com.ngninep.hotel.service.impl;

import com.ngninep.hotel.dto.req.RoomTypeRequest;
import com.ngninep.hotel.dto.res.FacilityResponse;
import com.ngninep.hotel.dto.res.RoomTypeImageResponse;
import com.ngninep.hotel.dto.res.RoomTypeResponse;
import com.ngninep.hotel.entity.Facility;
import com.ngninep.hotel.entity.Hotel;
import com.ngninep.hotel.entity.RoomType;
import com.ngninep.hotel.entity.RoomTypeFacility;
import com.ngninep.hotel.entity.RoomTypeImage;
import com.ngninep.hotel.repository.FacilityRepository;
import com.ngninep.hotel.repository.HotelRepository;
import com.ngninep.hotel.repository.RoomTypeFacilityRepository;
import com.ngninep.hotel.repository.RoomTypeImageRepository;
import com.ngninep.hotel.repository.RoomTypeRepository;
import com.ngninep.hotel.service.RoomTypeService;
import com.ngninep.hotel.util.Message;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomTypeServiceImpl implements RoomTypeService {

    private final RoomTypeRepository roomTypeRepository;
    private final HotelRepository hotelRepository;
    private final RoomTypeImageRepository roomTypeImageRepository;
    private final FacilityRepository facilityRepository;
    private final RoomTypeFacilityRepository roomTypeFacilityRepository;

    private boolean isAdminHotel() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN_HOTEL".equals(authority.getAuthority()));
    }

    private int getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Object credentials = authentication != null ? authentication.getCredentials() : null;
        if (credentials instanceof Integer) {
            return (Integer) credentials;
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, Message.HOTEL_ACCESS_DENIED);
    }

    private void validateHotelOwnership(Hotel hotel) {
        if (isAdminHotel() && hotel.getAdmin_hotel_id() != getCurrentUserId()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, Message.HOTEL_ACCESS_DENIED);
        }
    }

    private RoomTypeResponse mapToResponse(RoomType roomType) {
        List<RoomTypeFacility> facilities = roomTypeFacilityRepository
                .findByRoomType_IdRoomType(roomType.getIdRoomType());
        return mapToResponse(roomType, facilities);
    }

    private RoomTypeResponse mapToResponse(RoomType roomType, List<RoomTypeFacility> roomFacilities) {
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

        List<Object> facilities = roomFacilities.stream()
                .filter(relation -> relation.getFacility() != null)
                .map(relation -> (Object) FacilityResponse.builder()
                        .idFacility(relation.getFacility().getIdFacility())
                        .name(relation.getFacility().getName())
                        .icon(relation.getFacility().getIcon())
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
                .facilities(facilities)
                .discountPercent(roomType.getHotel() != null ? roomType.getHotel().getDiscount_percent() : 0)
                .onSale(roomType.getHotel() != null && roomType.getHotel().isOnSale())
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
        validateHotelOwnership(hotel);
                 
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
        List<RoomTypeFacility> facilities = syncRoomFacilities(saved, request.getFacilityIds());

        // Simpan gambar jika ada
        if (request.getImageUrl() != null && !request.getImageUrl().isBlank()) {
            roomTypeImageRepository.save(RoomTypeImage.builder()
                    .roomType(saved)
                    .image_url(request.getImageUrl())
                    .sort_order(0)
                    .build());
        }

        return mapToResponse(saved, facilities);
    }

    @Override
    @Transactional
    public RoomTypeResponse update(int id, RoomTypeRequest request) {
        RoomType roomType = roomTypeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, Message.ROOM_TYPE_NOT_FOUND));
        validateHotelOwnership(roomType.getHotel());
                 
        Hotel hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, Message.HOTEL_INVALID));
        validateHotelOwnership(hotel);
                 
        roomType.setName(request.getName());
        roomType.setHotel(hotel);
        roomType.setDescription(request.getDescription());
        roomType.setPrice_per_night(request.getPricePerNight());
        roomType.setMax_guest(request.getMaxGuest());
        roomType.setSmoking(request.isSmoking());
        roomType.setRoom_available(request.getRoomAvailable());
        
        RoomType saved = roomTypeRepository.save(roomType);
        List<RoomTypeFacility> facilities = null;
        if (request.getFacilityIds() != null) {
            facilities = syncRoomFacilities(saved, request.getFacilityIds());
        }

        // Update gambar jika ada yang baru
        if (request.getImageUrl() != null && !request.getImageUrl().isBlank()) {
            roomTypeImageRepository.deleteByRoomTypeId(id);
            roomTypeImageRepository.save(RoomTypeImage.builder()
                    .roomType(saved)
                    .image_url(request.getImageUrl())
                    .sort_order(0)
                    .build());
        }

        return facilities == null ? mapToResponse(saved) : mapToResponse(saved, facilities);
    }

    @Override
    public void delete(int id) {
        RoomType roomType = roomTypeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, Message.ROOM_TYPE_NOT_FOUND));
        validateHotelOwnership(roomType.getHotel());
        roomTypeRepository.delete(roomType);
    }

    private List<RoomTypeFacility> syncRoomFacilities(RoomType roomType, List<Integer> facilityIds) {
        Set<Integer> requestedIds = facilityIds == null
                ? Set.of()
                : facilityIds.stream()
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toCollection(LinkedHashSet::new));

        List<Facility> facilities = facilityRepository.findAllById(requestedIds);
        if (facilities.size() != requestedIds.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, Message.FACILITY_IDS_INVALID);
        }

        roomTypeFacilityRepository.deleteByRoomType_IdRoomType(roomType.getIdRoomType());
        roomTypeFacilityRepository.flush();

        List<RoomTypeFacility> relations = facilities.stream()
                .map(facility -> RoomTypeFacility.builder()
                        .roomType(roomType)
                        .facility(facility)
                        .build())
                .collect(Collectors.toList());

        return relations.isEmpty() ? relations : roomTypeFacilityRepository.saveAll(relations);
    }
}
