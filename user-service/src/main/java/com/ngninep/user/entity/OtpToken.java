package com.ngninep.user.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "otp_tokens")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtpToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String otp_code;

    @Column(nullable = false)
    private LocalDateTime created_at;   // Untuk rate limit (cek < 5 menit)

    @Column(nullable = false)
    private LocalDateTime expired_at;   // created_at + 5 menit

    // ✅ Field tanpa prefix is_ agar Lombok generate: isUsed() / setUsed()
    @Column(name = "is_used")
    @Builder.Default
    private boolean used = false;
}
