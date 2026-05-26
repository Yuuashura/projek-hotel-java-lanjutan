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
public class PaymentRequest {

    @NotBlank(message = Message.PAYMENT_METHOD_REQUIRED)
    @JsonProperty("payment_method")
    private String paymentMethod;

    @NotBlank(message = Message.PAYMENT_PROOF_REQUIRED)
    @JsonProperty("payment_proof")
    private String paymentProof;
}
