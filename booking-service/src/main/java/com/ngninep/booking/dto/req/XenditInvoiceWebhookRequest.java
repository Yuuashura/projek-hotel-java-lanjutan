package com.ngninep.booking.dto.req;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class XenditInvoiceWebhookRequest {

    @JsonProperty("id")
    private String id;

    @JsonProperty("external_id")
    private String externalId;

    @JsonProperty("status")
    private String status;

    @JsonProperty("paid_at")
    private String paidAt;

    @JsonProperty("amount")
    private Long amount;
}
