package com.ngninep.hotel.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cities")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class City {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id_city;

    @Column(unique = true, nullable = false)
    private String name;        // "Bandung", "Jakarta", "Bali"

    private String province;    // "Jawa Barat", "DKI Jakarta", "Bali"
}
