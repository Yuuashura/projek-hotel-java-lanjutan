package com.ngninep.hotel.service.impl;

import com.ngninep.hotel.dto.req.RoomTypeRequest;
import com.ngninep.hotel.dto.res.FacilityResponse;
import com.ngninep.hotel.dto.res.RoomTypeResponse;
import com.ngninep.hotel.entity.Facility;
import com.ngninep.hotel.entity.Hotel;
import com.ngninep.hotel.entity.RoomType;
import com.ngninep.hotel.entity.RoomTypeFacility;
import com.ngninep.hotel.repository.FacilityRepository;
import com.ngninep.hotel.repository.HotelRepository;
import com.ngninep.hotel.repository.RoomTypeFacilityRepository;
import com.ngninep.hotel.repository.RoomTypeImageRepository;
import com.ngninep.hotel.repository.RoomTypeRepository;
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
class RoomTypeServiceImplTest {

    @Mock
    private RoomTypeRepository roomTypeRepository;
    @Mock
    private HotelRepository hotelRepository;
    @Mock
    private RoomTypeImageRepository roomTypeImageRepository;
    @Mock
    private FacilityRepository facilityRepository;
    @Mock
    private RoomTypeFacilityRepository roomTypeFacilityRepository;

    @Test
    void createStoresOnlyFacilitiesSelectedForTheRoomType() {
        RoomTypeServiceImpl service = createService();
        Hotel hotel = Hotel.builder().idHotel(1).name("NgiNep Hotel").build();
        Facility ac = Facility.builder().idFacility(2).name("AC").icon("snowflake").build();
        Facility shower = Facility.builder().idFacility(3).name("Shower").icon("shower").build();

        when(hotelRepository.findById(1)).thenReturn(Optional.of(hotel));
        when(roomTypeRepository.save(any(RoomType.class))).thenAnswer(invocation -> {
            RoomType roomType = invocation.getArgument(0);
            roomType.setIdRoomType(20);
            return roomType;
        });
        when(facilityRepository.findAllById(any())).thenReturn(List.of(ac, shower));
        when(roomTypeFacilityRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(roomTypeImageRepository.findByRoomTypeId(20)).thenReturn(List.of());

        RoomTypeResponse response = service.create(request(List.of(2, 3)));

        ArgumentCaptor<Iterable<RoomTypeFacility>> relationsCaptor = ArgumentCaptor.forClass(Iterable.class);
        verify(roomTypeFacilityRepository).deleteByRoomType_IdRoomType(20);
        verify(roomTypeFacilityRepository).saveAll(relationsCaptor.capture());

        List<Integer> storedIds = ((List<RoomTypeFacility>) relationsCaptor.getValue()).stream()
                .map(relation -> relation.getFacility().getIdFacility())
                .toList();
        List<Integer> responseIds = response.getFacilities().stream()
                .map(FacilityResponse.class::cast)
                .map(FacilityResponse::getIdFacility)
                .toList();

        assertThat(storedIds).containsExactly(2, 3);
        assertThat(responseIds).containsExactly(2, 3);
    }

    @Test
    void createRejectsUnknownFacilityBeforeDeletingRoomRelations() {
        RoomTypeServiceImpl service = createService();
        Hotel hotel = Hotel.builder().idHotel(1).name("NgiNep Hotel").build();
        Facility ac = Facility.builder().idFacility(2).name("AC").build();

        when(hotelRepository.findById(1)).thenReturn(Optional.of(hotel));
        when(roomTypeRepository.save(any(RoomType.class))).thenAnswer(invocation -> {
            RoomType roomType = invocation.getArgument(0);
            roomType.setIdRoomType(20);
            return roomType;
        });
        when(facilityRepository.findAllById(any())).thenReturn(List.of(ac));

        assertThatThrownBy(() -> service.create(request(List.of(2, 999))))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Satu atau lebih fasilitas tidak valid");

        verify(roomTypeFacilityRepository, never()).deleteByRoomType_IdRoomType(any(Integer.class));
        verify(roomTypeFacilityRepository, never()).saveAll(any());
    }

    private RoomTypeServiceImpl createService() {
        return new RoomTypeServiceImpl(
                roomTypeRepository,
                hotelRepository,
                roomTypeImageRepository,
                facilityRepository,
                roomTypeFacilityRepository
        );
    }

    private RoomTypeRequest request(List<Integer> facilityIds) {
        return RoomTypeRequest.builder()
                .name("Deluxe Room")
                .hotelId(1)
                .pricePerNight(500_000L)
                .maxGuest(2)
                .roomAvailable(5)
                .facilityIds(facilityIds)
                .build();
    }
}
