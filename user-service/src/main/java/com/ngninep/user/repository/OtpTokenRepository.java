package com.ngninep.user.repository;

import com.ngninep.user.entity.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, Integer> {

    // Ambil OTP terbaru untuk suatu email yang belum dipakai
    // Field sekarang bernama 'used' (bukan 'is_used')
    Optional<OtpToken> findTopByEmailAndUsedFalseOrderByCreatedAtDesc(String email);

    // Ambil semua OTP aktif milik suatu email (untuk invalidate saat resend)
    List<OtpToken> findAllByEmailAndUsedFalse(String email);

    // Hapus semua OTP yang sudah expired (dipakai oleh Scheduler)
    @Modifying
    @Transactional
    @Query("DELETE FROM OtpToken o WHERE o.expiredAt < :now")
    void deleteByExpiredAtBefore(@Param("now") LocalDateTime now);

}
