package com.ngninep.hotel.service.impl;

import com.ngninep.hotel.dto.req.HotelRequest;
import com.ngninep.hotel.dto.res.FacilityResponse;
import com.ngninep.hotel.dto.res.HotelResponse;
import com.ngninep.hotel.entity.City;
import com.ngninep.hotel.entity.Facility;
import com.ngninep.hotel.entity.Hotel;
import com.ngninep.hotel.entity.HotelFacility;
import com.ngninep.hotel.repository.CityRepository;
import com.ngninep.hotel.repository.FacilityRepository;
import com.ngninep.hotel.repository.HotelFacilityRepository;
import com.ngninep.hotel.repository.HotelImageRepository;
import com.ngninep.hotel.repository.HotelRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class HotelServiceImplTest {

    @Mock
    private HotelRepository hotelRepository;
    @Mock
    private CityRepository cityRepository;
    @Mock
    private HotelImageRepository hotelImageRepository;
    @Mock
    private FacilityRepository facilityRepository;
    @Mock
    private HotelFacilityRepository hotelFacilityRepository;

    @Test
    void createFeaturedHotelStoresOnlySelectedFacilities() {
        HotelServiceImpl service = createService();
        City city = City.builder().idCity(1).name("Bandung").build();
        Facility wifi = Facility.builder().idFacility(1).name("Free WiFi").icon("wifi").build();
        Facility pool = Facility.builder().idFacility(5).name("Kolam Renang").icon("pool").build();

        when(cityRepository.findById(1)).thenReturn(Optional.of(city));
        when(hotelRepository.save(any(Hotel.class))).thenAnswer(invocation -> {
            Hotel hotel = invocation.getArgument(0);
            hotel.setIdHotel(10);
            return hotel;
        });
        when(facilityRepository.findAllById(any())).thenReturn(List.of(wifi, pool));
        when(hotelFacilityRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));

        HotelResponse response = service.create(request(List.of(1, 5)));

        ArgumentCaptor<Iterable<HotelFacility>> relationsCaptor = ArgumentCaptor.forClass(Iterable.class);
        verify(hotelFacilityRepository).deleteByHotel_IdHotel(10);
        verify(hotelFacilityRepository).saveAll(relationsCaptor.capture());

        List<Integer> storedIds = ((List<HotelFacility>) relationsCaptor.getValue()).stream()
                .map(relation -> relation.getFacility().getIdFacility())
                .toList();
        List<Integer> responseIds = response.getFacilities().stream()
                .map(FacilityResponse.class::cast)
                .map(FacilityResponse::getIdFacility)
                .toList();

        assertThat(response.isFeatured()).isTrue();
        assertThat(storedIds).containsExactly(1, 5);
        assertThat(responseIds).containsExactly(1, 5);
    }

    @Test
    void createRejectsUnknownFacilityBeforeDeletingRelations() {
        HotelServiceImpl service = createService();
        City city = City.builder().idCity(1).name("Bandung").build();
        Facility wifi = Facility.builder().idFacility(1).name("Free WiFi").build();

        when(cityRepository.findById(1)).thenReturn(Optional.of(city));
        when(hotelRepository.save(any(Hotel.class))).thenAnswer(invocation -> {
            Hotel hotel = invocation.getArgument(0);
            hotel.setIdHotel(10);
            return hotel;
        });
        when(facilityRepository.findAllById(any())).thenReturn(List.of(wifi));

        assertThatThrownBy(() -> service.create(request(List.of(1, 999))))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Satu atau lebih fasilitas tidak valid");

        verify(hotelFacilityRepository, never()).deleteByHotel_IdHotel(any(Integer.class));
        verify(hotelFacilityRepository, never()).saveAll(any());
    }

    private HotelServiceImpl createService() {
        return new HotelServiceImpl(
                hotelRepository,
                cityRepository,
                hotelImageRepository,
                facilityRepository,
                hotelFacilityRepository
        );
    }

    private HotelRequest request(List<Integer> facilityIds) {
        return HotelRequest.builder()
                .name("Featured Hotel")
                .cityId(1)
                .adminHotelId(2)
                .featured(true)
                .facilityIds(facilityIds)
                .build();
    }
}
