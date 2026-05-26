package com.ngninep.booking.dto.req;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.ngninep.booking.util.Message;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BookingRequest {

    @NotNull(message = Message.HOTEL_ID_REQUIRED)
    @JsonProperty("hotel_id")
    private Integer hotelId;

    @NotNull(message = Message.ROOM_TYPE_ID_REQUIRED)
    @JsonProperty("room_type_id")
    private Integer roomTypeId;

    @NotNull(message = Message.CHECK_IN_REQUIRED)
    @JsonProperty("check_in")
    private LocalDate checkIn;

    @NotNull(message = Message.CHECK_OUT_REQUIRED)
    @JsonProperty("check_out")
    private LocalDate checkOut;

    @NotNull(message = Message.GUEST_COUNT_REQUIRED)
    @Min(value = 1, message = Message.GUEST_COUNT_MIN)
    @JsonProperty("number_of_guest")
    private Integer numberOfGuest;

    @JsonProperty("total_price")
    private Long totalPrice;

    @NotBlank(message = Message.ORDERER_NAME_REQUIRED)
    @JsonProperty("orderer_name")
    private String ordererName;

    @NotBlank(message = Message.ORDERER_PHONE_REQUIRED)
    @JsonProperty("orderer_phone")
    private String ordererPhone;

    @NotBlank(message = Message.ORDERER_EMAIL_REQUIRED)
    @Email(message = Message.EMAIL_INVALID)
    @JsonProperty("orderer_email")
    private String ordererEmail;

    @NotNull(message = Message.FOR_SELF_REQUIRED)
    @JsonProperty("is_for_self")
    private Boolean isForSelf;
}
