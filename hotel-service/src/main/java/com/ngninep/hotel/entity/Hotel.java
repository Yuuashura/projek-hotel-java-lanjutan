package com.ngninep.hotel.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "hotels")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Hotel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id_hotel;

    @Column(nullable = false)
    private String name;

    // ✅ Relasi dalam satu DB — boleh @JoinColumn
    @ManyToOne
    @JoinColumn(name = "city_id", nullable = false)
    private City city;

    private String address;

    private String type;    // "Bintang 3", "Budget", "Resort"

    @Column(columnDefinition = "TEXT")
    private String description;

    // ✅ Plain int — FK ke User Service (beda database, BUKAN @JoinColumn)
    private int admin_hotel_id;

    @Column(name = "is_featured")
    private boolean featured;

    @Column(name = "is_on_sale")
    private boolean onSale;

    private int discount_percent;

    private float rating;

    // Relasi ke gambar hotel
    @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<HotelImage> images;

    // Relasi ke fasilitas hotel
    @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<HotelFacility> facilities;

    // Relasi ke tipe kamar
    @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RoomType> roomTypes;
}
