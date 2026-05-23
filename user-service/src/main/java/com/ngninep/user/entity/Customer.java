package com.ngninep.user.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "customers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id_customer;

    @Column(nullable = false)
    private String first_name;

    private String last_name;

    private int age;

    // Plain int — ID kota dari Hotel Service (bukan FK, karena beda database)
    private int city_id;

    private String phone;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;  // BCrypt hash

    // Field tanpa prefix is_ agar Lombok generate: isBanned() / setBanned()
    @Column(name = "is_banned")
    @Builder.Default
    private boolean banned = false;

    // Field tanpa prefix is_ agar Lombok generate: isVerified() / setVerified()
    @Column(name = "is_verified")
    @Builder.Default
    private boolean verified = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private String profile_picture;
}
