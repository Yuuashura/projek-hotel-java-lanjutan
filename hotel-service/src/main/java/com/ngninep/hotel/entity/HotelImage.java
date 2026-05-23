package com.ngninep.hotel.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "hotel_images")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_image")
    private int idImage;

    @ManyToOne
    @JoinColumn(name = "hotel_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"images", "facilities", "roomTypes"})
    private Hotel hotel;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String image_url;   // URL atau base64 gambar hotel (eksterior, lobi, kolam, dll.)

    private int sort_order;     // Urutan tampil (0 = foto utama)
}
