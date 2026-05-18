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
    private int id_image;

    @ManyToOne
    @JoinColumn(name = "hotel_id", nullable = false)
    private Hotel hotel;

    private String image_url;   // URL gambar hotel (eksterior, lobi, kolam, dll.)

    private int sort_order;     // Urutan tampil (0 = foto utama)
}
