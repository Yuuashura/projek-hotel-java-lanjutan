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
public class HotelResponse {
    
    @JsonProperty("id_hotel")
    private int idHotel;
    
    private String name;
    
    // Nested City Response
    private CityResponse city;
    
    private String address;
    private String type;
    private String description;
    
    @JsonProperty("admin_hotel_id")
    private int adminHotelId;
    
    private boolean featured;
    
    @JsonProperty("onSale")
    private boolean onSale;
    
    @JsonProperty("discount_percent")
    private int discountPercent;
    
    private float rating;

    @JsonProperty("min_price")
    private Long minPrice;
    
    // Relasi. Untuk simplifikasi, kita bisa return struktur simpel (misal: List dari id / nama)
    // Atau jika ingin lengkap bisa pakai Nested DTO.
    // Sementara kita return List object kasar / DTO nested.
    private List<Object> images;
    private List<Object> facilities;
    private List<RoomTypeResponse> roomTypes;
}
