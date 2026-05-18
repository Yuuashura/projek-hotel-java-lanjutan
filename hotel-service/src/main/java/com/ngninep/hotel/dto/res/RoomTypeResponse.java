package com.ngninep.hotel.dto.res;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RoomTypeResponse {
    
    @JsonProperty("id_room_type")
    private int idRoomType;
    
    private String name;
    
    @JsonProperty("hotel_id")
    private int hotelId;
    
    private String description;
    
    @JsonProperty("price_per_night")
    private Long pricePerNight;
    
    @JsonProperty("max_guest")
    private int maxGuest;
    
    private boolean smoking;
    
    @JsonProperty("room_available")
    private int roomAvailable;
    
    private List<Object> images;
    private List<Object> facilities;
}
