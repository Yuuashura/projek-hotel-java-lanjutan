package com.ngninep.booking.dto.res;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoomTypeSnapshot {

    @JsonProperty("id_room_type")
    private int idRoomType;

    @JsonProperty("hotel_id")
    private int hotelId;

    private String name;

    @JsonProperty("price_per_night")
    private Long pricePerNight;

    @JsonProperty("max_guest")
    private int maxGuest;

    @JsonProperty("room_available")
    private int roomAvailable;
}
