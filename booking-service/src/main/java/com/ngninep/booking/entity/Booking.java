package com.ngninep.booking.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_booking")
    @com.fasterxml.jackson.annotation.JsonProperty("id_booking")
    private int idBooking;

    // Referensi ke service lain (plain int, bukan @JoinColumn):
    @Column(name = "customer_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonProperty("customer_id")
    private int customerId;  

    @Column(name = "hotel_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonProperty("hotel_id")
    private int hotelId;

    @Column(name = "room_type_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonProperty("room_type_id")
    private int roomTypeId;

    // Detail menginap:
    @Column(name = "check_in", nullable = false)
    @com.fasterxml.jackson.annotation.JsonProperty("check_in")
    private LocalDate checkIn;

    @Column(name = "check_out", nullable = false)
    @com.fasterxml.jackson.annotation.JsonProperty("check_out")
    private LocalDate checkOut;

    @Column(name = "number_of_guest", nullable = false)
    @com.fasterxml.jackson.annotation.JsonProperty("number_of_guest")
    private int numberOfGuest;

    @Column(name = "total_price")
    @com.fasterxml.jackson.annotation.JsonProperty("total_price")
    private Long totalPrice;

    // Data pemesan
    @Column(name = "orderer_name")
    @com.fasterxml.jackson.annotation.JsonProperty("orderer_name")
    private String ordererName;

    @Column(name = "orderer_phone")
    @com.fasterxml.jackson.annotation.JsonProperty("orderer_phone")
    private String ordererPhone;

    @Column(name = "orderer_email")
    @com.fasterxml.jackson.annotation.JsonProperty("orderer_email")
    private String ordererEmail;

    @Column(name = "is_for_self")
    @com.fasterxml.jackson.annotation.JsonProperty("is_for_self")
    private boolean forSelf;

    // Status & pembayaran:
    @Enumerated(EnumType.STRING)
    private BookingStatus status;  // PENDING, CONFIRMED, CANCELLED, COMPLETED

    @Column(name = "payment_method")
    @com.fasterxml.jackson.annotation.JsonProperty("payment_method")
    private String paymentMethod;

    @Column(name = "payment_proof", columnDefinition = "TEXT")
    @com.fasterxml.jackson.annotation.JsonProperty("payment_proof")
    private String paymentProof;

    @Column(name = "payment_status")
    @com.fasterxml.jackson.annotation.JsonProperty("payment_status")
    private String paymentStatus;

    @Column(name = "xendit_invoice_id")
    @com.fasterxml.jackson.annotation.JsonProperty("xendit_invoice_id")
    private String xenditInvoiceId;

    @Column(name = "xendit_external_id", unique = true)
    @com.fasterxml.jackson.annotation.JsonProperty("xendit_external_id")
    private String xenditExternalId;

    @Column(name = "xendit_invoice_url", columnDefinition = "TEXT")
    @com.fasterxml.jackson.annotation.JsonProperty("xendit_invoice_url")
    private String xenditInvoiceUrl;

    @Column(name = "paid_at")
    @com.fasterxml.jackson.annotation.JsonProperty("paid_at")
    private LocalDateTime paidAt;

    @Column(name = "created_at")
    @com.fasterxml.jackson.annotation.JsonProperty("created_at")
    private LocalDateTime createdAt;

    @Column(name = "payment_deadline")
    @com.fasterxml.jackson.annotation.JsonProperty("payment_deadline")
    private LocalDateTime paymentDeadline;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = BookingStatus.PENDING;
        }
        if (this.paymentDeadline == null) {
            this.paymentDeadline = this.createdAt.plusHours(24);
        }
    }
}
