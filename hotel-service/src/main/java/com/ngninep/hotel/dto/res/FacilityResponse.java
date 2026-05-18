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
public class FacilityResponse {
    @JsonProperty("id_facility")
    private int idFacility;
    
    private String name;
    private String icon;
}
