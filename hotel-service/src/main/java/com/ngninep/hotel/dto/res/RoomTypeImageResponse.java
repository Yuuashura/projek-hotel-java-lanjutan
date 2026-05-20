package com.ngninep.hotel.dto.res;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomTypeImageResponse {
    private int idImage;
    private String imageUrl;
    private int sortOrder;
}
