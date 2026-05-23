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
    @Column(name = "id_hotel")
    @com.fasterxml.jackson.annotation.JsonProperty("id_hotel")
    private int idHotel;

    @Column(nullable = false)
    private String name;

    @ManyToOne
    @JoinColumn(name = "city_id", nullable = false)
    private City city;

    private String address;

    private String type;  

    @Column(columnDefinition = "TEXT")
    private String description;


    private int admin_hotel_id;

    @Column(name = "is_featured")
    private boolean featured;

    @Column(name = "is_on_sale")
    private boolean onSale;

    private int discount_percent;

    private float rating;

    @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties("hotel")
    private List<HotelImage> images;

    @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties("hotel")
    private List<HotelFacility> facilities;

    @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties("hotel")
    private List<RoomType> roomTypes;
}
