package com.ngninep.hotel.dto.res;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class HotelImageResponse {
    
    @JsonProperty("id_image")
    private int idImage;
    
    @JsonProperty("image_url")
    private String imageUrl;
    
    @JsonProperty("sort_order")
    private int sortOrder;
}
