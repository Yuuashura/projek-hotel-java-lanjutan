package com.ngninep.booking.dto.req;

import com.fasterxml.jackson.annotation.JsonProperty;
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

    @NotNull(message = "ID Hotel tidak boleh kosong")
    @JsonProperty("hotel_id")
    private Integer hotelId;

    @NotNull(message = "ID Tipe Kamar tidak boleh kosong")
    @JsonProperty("room_type_id")
    private Integer roomTypeId;

    @NotNull(message = "Tanggal Check-in tidak boleh kosong")
    @JsonProperty("check_in")
    private LocalDate checkIn;

    @NotNull(message = "Tanggal Check-out tidak boleh kosong")
    @JsonProperty("check_out")
    private LocalDate checkOut;

    @NotNull(message = "Jumlah tamu tidak boleh kosong")
    @Min(value = 1, message = "Jumlah tamu minimal 1")
    @JsonProperty("number_of_guest")
    private Integer numberOfGuest;

    @NotNull(message = "Total harga tidak boleh kosong")
    @Min(value = 0, message = "Total harga tidak boleh negatif")
    @JsonProperty("total_price")
    private Long totalPrice;

    @NotBlank(message = "Nama pemesan tidak boleh kosong")
    @JsonProperty("orderer_name")
    private String ordererName;

    @NotBlank(message = "Nomor telepon pemesan tidak boleh kosong")
    @JsonProperty("orderer_phone")
    private String ordererPhone;

    @NotBlank(message = "Email pemesan tidak boleh kosong")
    @Email(message = "Format email tidak valid")
    @JsonProperty("orderer_email")
    private String ordererEmail;

    @NotNull(message = "Status is_for_self tidak boleh kosong")
    @JsonProperty("is_for_self")
    private Boolean isForSelf;
}
