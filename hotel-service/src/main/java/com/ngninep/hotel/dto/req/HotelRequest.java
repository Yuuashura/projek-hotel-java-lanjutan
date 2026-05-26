package com.ngninep.hotel.dto.req;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.ngninep.hotel.util.Message;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class HotelRequest {
    
    @NotBlank(message = Message.HOTEL_NAME_REQUIRED)
    private String name;
    
    // Kita gunakan ID langsung untuk DTO agar lebih rapi daripada nested object
    @NotNull(message = Message.CITY_ID_REQUIRED)
    @JsonProperty("city_id")
    private Integer cityId;
    
    private String address;
    private String type;
    private String description;
    
    @JsonProperty("admin_hotel_id")
    private int adminHotelId;
    
    private boolean featured;
    
    @JsonProperty("onSale") // Sesuai dengan api-test sebelumnya
    private boolean onSale;
    
    @JsonProperty("discount_percent")
    private int discountPercent;
    
    private float rating;

    @JsonProperty("image_url")
    private String imageUrl;  // URL atau base64 gambar utama hotel
}
