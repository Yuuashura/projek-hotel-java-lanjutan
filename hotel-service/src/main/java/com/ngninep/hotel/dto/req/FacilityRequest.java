package com.ngninep.hotel.dto.req;

import com.ngninep.hotel.util.Message;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FacilityRequest {
    @NotBlank(message = Message.FACILITY_NAME_REQUIRED)
    private String name;
    
    private String icon;
}
