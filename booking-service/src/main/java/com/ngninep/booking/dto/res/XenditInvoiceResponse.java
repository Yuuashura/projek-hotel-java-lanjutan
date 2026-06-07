package com.ngninep.booking.dto.res;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class XenditInvoiceResponse {

    @JsonProperty("booking_id")
    private int bookingId;

    @JsonProperty("external_id")
    private String externalId;

    @JsonProperty("xendit_invoice_id")
    private String xenditInvoiceId;

    @JsonProperty("invoice_url")
    private String invoiceUrl;

    @JsonProperty("status")
    private String status;

    @JsonProperty("amount")
    private Long amount;
}
