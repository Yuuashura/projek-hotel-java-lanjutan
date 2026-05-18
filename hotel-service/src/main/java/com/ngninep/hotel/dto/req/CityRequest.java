package com.ngninep.hotel.dto.req;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CityRequest {
    @NotBlank(message = "Nama kota tidak boleh kosong")
    private String name;
    
    private String province;
}
