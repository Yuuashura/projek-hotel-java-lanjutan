package com.ngninep.booking.dto.req;

import com.fasterxml.jackson.annotation.JsonProperty;
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

    @NotBlank(message = "Metode pembayaran tidak boleh kosong")
    @JsonProperty("payment_method")
    private String paymentMethod;

    @NotBlank(message = "Bukti pembayaran tidak boleh kosong")
    @JsonProperty("payment_proof")
    private String paymentProof;
}
