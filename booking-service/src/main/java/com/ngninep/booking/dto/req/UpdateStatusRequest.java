package com.ngninep.booking.dto.req;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.ngninep.booking.util.Message;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateStatusRequest {

    @NotBlank(message = Message.STATUS_REQUIRED)
    @JsonProperty("status")
    private String status;
}
