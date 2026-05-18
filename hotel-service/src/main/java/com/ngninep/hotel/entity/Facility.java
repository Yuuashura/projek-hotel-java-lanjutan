package com.ngninep.hotel.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "facilities")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Facility {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id_facility;

    @Column(unique = true, nullable = false)
    private String name;    // "Free WiFi", "AC", "Shower", "Kolam Renang", dll.

    private String icon;    // Nama icon: "wifi", "snowflake", "shower", dll.
}
