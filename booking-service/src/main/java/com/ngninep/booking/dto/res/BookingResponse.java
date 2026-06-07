package com.ngninep.booking.dto.res;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BookingResponse {

    @JsonProperty("id_booking")
    private int idBooking;

    @JsonProperty("customer_id")
    private int customerId;

    @JsonProperty("hotel_id")
    private int hotelId;

    @JsonProperty("room_type_id")
    private int roomTypeId;

    @JsonProperty("check_in")
    private LocalDate checkIn;

    @JsonProperty("check_out")
    private LocalDate checkOut;

    @JsonProperty("number_of_guest")
    private int numberOfGuest;

    @JsonProperty("total_price")
    private Long totalPrice;

    @JsonProperty("orderer_name")
    private String ordererName;

    @JsonProperty("orderer_phone")
    private String ordererPhone;

    @JsonProperty("orderer_email")
    private String ordererEmail;

    @JsonProperty("is_for_self")
    private boolean forSelf;

    @JsonProperty("status")
    private String status;

    @JsonProperty("payment_method")
    private String paymentMethod;

    @JsonProperty("payment_proof")
    private String paymentProof;

    @JsonProperty("payment_status")
    private String paymentStatus;

    @JsonProperty("xendit_invoice_id")
    private String xenditInvoiceId;

    @JsonProperty("xendit_external_id")
    private String xenditExternalId;

    @JsonProperty("xendit_invoice_url")
    private String xenditInvoiceUrl;

    @JsonProperty("paid_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime paidAt;

    @JsonProperty("created_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonProperty("payment_deadline")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime paymentDeadline;
}
