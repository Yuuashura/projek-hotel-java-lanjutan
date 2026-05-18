package com.ngninep.hotel.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "room_type_images")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomTypeImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id_image;

    @ManyToOne
    @JoinColumn(name = "room_type_id", nullable = false)
    private RoomType roomType;

    private String image_url;

    private int sort_order;     // 0 = foto utama tipe kamar
}
