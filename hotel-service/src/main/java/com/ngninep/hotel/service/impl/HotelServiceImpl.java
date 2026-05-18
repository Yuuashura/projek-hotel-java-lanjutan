package com.ngninep.hotel.service.impl;

import com.ngninep.hotel.dto.req.HotelRequest;
import com.ngninep.hotel.dto.res.CityResponse;
import com.ngninep.hotel.dto.res.FacilityResponse;
import com.ngninep.hotel.dto.res.HotelImageResponse;
import com.ngninep.hotel.dto.res.HotelResponse;
import com.ngninep.hotel.entity.City;
import com.ngninep.hotel.entity.Hotel;
import com.ngninep.hotel.repository.CityRepository;
import com.ngninep.hotel.repository.HotelRepository;
import com.ngninep.hotel.service.HotelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HotelServiceImpl implements HotelService {

    private final HotelRepository hotelRepository;
    private final CityRepository cityRepository;

    private HotelResponse mapToResponse(Hotel hotel) {
        CityResponse cityResponse = null;
        if (hotel.getCity() != null) {
            cityResponse = CityResponse.builder()
                    .idCity(hotel.getCity().getIdCity())
                    .name(hotel.getCity().getName())
                    .province(hotel.getCity().getProvince())
                    .build();
        }

        List<Object> imagesResponse = new ArrayList<>();
        if (hotel.getImages() != null) {
            imagesResponse = hotel.getImages().stream().map(img -> 
                HotelImageResponse.builder()
                    .idImage(img.getIdImage())
                    .imageUrl(img.getImage_url())
                    .sortOrder(img.getSort_order())
                    .build()
            ).collect(Collectors.toList());
        }

        List<Object> facilitiesResponse = new ArrayList<>();
        if (hotel.getFacilities() != null) {
            facilitiesResponse = hotel.getFacilities().stream().map(hf -> {
                if (hf.getFacility() != null) {
                    return FacilityResponse.builder()
                            .idFacility(hf.getFacility().getIdFacility())
                            .name(hf.getFacility().getName())
                            .icon(hf.getFacility().getIcon())
                            .build();
                }
                return null;
            }).filter(java.util.Objects::nonNull).collect(Collectors.toList());
        }

        List<com.ngninep.hotel.dto.res.RoomTypeResponse> roomTypesResponse = new ArrayList<>();
        if (hotel.getRoomTypes() != null) {
            roomTypesResponse = hotel.getRoomTypes().stream().map(rt -> 
                com.ngninep.hotel.dto.res.RoomTypeResponse.builder()
                    .idRoomType(rt.getIdRoomType())
                    .name(rt.getName())
                    .hotelId(hotel.getIdHotel())
                    .description(rt.getDescription())
                    .pricePerNight(rt.getPrice_per_night())
                    .maxGuest(rt.getMax_guest())
                    .smoking(rt.isSmoking())
                    .roomAvailable(rt.getRoom_available())
                    .images(new ArrayList<>()) // Can be mapped later if needed
                    .facilities(new ArrayList<>()) // Can be mapped later if needed
                    .build()
            ).collect(Collectors.toList());
        }

        return HotelResponse.builder()
                .idHotel(hotel.getIdHotel())
                .name(hotel.getName())
                .city(cityResponse)
                .address(hotel.getAddress())
                .type(hotel.getType())
                .description(hotel.getDescription())
                .adminHotelId(hotel.getAdmin_hotel_id())
                .featured(hotel.isFeatured())
                .onSale(hotel.isOnSale())
                .discountPercent(hotel.getDiscount_percent())
                .rating(hotel.getRating())
                .images(imagesResponse)
                .facilities(facilitiesResponse)
                .roomTypes(roomTypesResponse)
                .build();
    }

    @Override
    public List<HotelResponse> getAll() {
        return hotelRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<HotelResponse> search(String keyword, Integer cityId) {
        List<Hotel> hotels;
        if (keyword != null && !keyword.isBlank()) {
            hotels = hotelRepository.findByNameContainingIgnoreCase(keyword);
        } else if (cityId != null) {
            hotels = hotelRepository.findByCity_IdCity(cityId);
        } else {
            hotels = hotelRepository.findAll();
        }
        
        return hotels.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<HotelResponse> getFeatured() {
        return hotelRepository.findByFeaturedTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public HotelResponse getById(int id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hotel tidak ditemukan"));
        return mapToResponse(hotel);
    }

    @Override
    public HotelResponse create(HotelRequest request) {
        City city = cityRepository.findById(request.getCityId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Kota tidak valid"));
                
        Hotel hotel = Hotel.builder()
                .name(request.getName())
                .city(city)
                .address(request.getAddress())
                .type(request.getType())
                .description(request.getDescription())
                .admin_hotel_id(request.getAdminHotelId())
                .featured(request.isFeatured())
                .onSale(request.isOnSale())
                .discount_percent(request.getDiscountPercent())
                .rating(request.getRating())
                .build();
                
        return mapToResponse(hotelRepository.save(hotel));
    }

    @Override
    public HotelResponse update(int id, HotelRequest request) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hotel tidak ditemukan"));
                
        City city = cityRepository.findById(request.getCityId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Kota tidak valid"));
        
        hotel.setName(request.getName());
        hotel.setCity(city);
        hotel.setAddress(request.getAddress());
        hotel.setType(request.getType());
        hotel.setDescription(request.getDescription());
        hotel.setAdmin_hotel_id(request.getAdminHotelId());
        hotel.setFeatured(request.isFeatured());
        hotel.setOnSale(request.isOnSale());
        hotel.setDiscount_percent(request.getDiscountPercent());
        hotel.setRating(request.getRating());
        
        return mapToResponse(hotelRepository.save(hotel));
    }

    @Override
    public void delete(int id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hotel tidak ditemukan"));
        hotelRepository.delete(hotel);
    }
}
