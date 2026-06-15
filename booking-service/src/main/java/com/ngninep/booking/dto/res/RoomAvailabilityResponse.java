package com.ngninep.booking.dto.res;

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
public class RoomAvailabilityResponse {

    @JsonProperty("room_type_id")
    private int roomTypeId;

    @JsonProperty("room_name")
    private String roomName;

    private List<RoomFullPeriodResponse> periods;
}
