package com.ngninep.hotel.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "room_types")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_room_type")
    @com.fasterxml.jackson.annotation.JsonProperty("id_room_type")
    private int idRoomType;

    @ManyToOne
    @JoinColumn(name = "hotel_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"roomTypes", "images", "facilities"})
    private Hotel hotel;

    @Column(nullable = false)
    private String name;            // "Standard Room", "Deluxe Room", "Suite", dll.

    private Long price_per_night;   // Harga per malam tipe kamar ini

    private int room_available;     // Jumlah kamar tipe ini yang tersedia

    private int max_guest;          // Kapasitas tamu maksimal per kamar

    @Column(name = "is_smoking")
    private boolean smoking;        // true = Smoking Room, false = No Smoking

    @Column(columnDefinition = "TEXT")
    private String description;

    // Relasi ke gambar kamar
    @OneToMany(mappedBy = "roomType", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties("roomType")
    private List<RoomTypeImage> images;

    // Relasi ke fasilitas khusus kamar
    @OneToMany(mappedBy = "roomType", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties("roomType")
    private List<RoomTypeFacility> facilities;
}
