package com.ngninep.hotel.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "room_type_facilities")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomTypeFacility {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "room_type_id", nullable = false)
    private RoomType roomType;

    // Pakai tabel Facility yang sama dengan HotelFacility
    @ManyToOne
    @JoinColumn(name = "facility_id", nullable = false)
    private Facility facility;
}
