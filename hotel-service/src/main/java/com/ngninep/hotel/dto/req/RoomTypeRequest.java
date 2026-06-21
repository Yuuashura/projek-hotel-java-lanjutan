package com.ngninep.hotel.dto.req;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RoomTypeRequest {
    
    @NotBlank(message = "Nama tipe kamar tidak boleh kosong")
    private String name;
    
    @NotNull(message = "ID Hotel tidak boleh kosong")
    @JsonProperty("hotel_id")
    private Integer hotelId;
    
    private String description;
    
    @JsonProperty("price_per_night")
    private Long pricePerNight;
    
    @JsonProperty("max_guest")
    private int maxGuest;
    
    private boolean smoking;
    
    @JsonProperty("room_available")
    private int roomAvailable;

    @JsonProperty("image_url")
    private String imageUrl;  // URL atau base64 gambar utama kamar

    @JsonProperty("facility_ids")
    private List<Integer> facilityIds;
}
