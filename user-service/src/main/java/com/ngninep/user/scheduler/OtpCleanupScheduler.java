package com.ngninep.user.scheduler;

import com.ngninep.user.repository.OtpTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class OtpCleanupScheduler {

    private final OtpTokenRepository otpTokenRepository;

    // Jalankan setiap 1 jam — hapus semua OTP yang sudah expired
    @Scheduled(fixedRate = 3600000)
    public void cleanExpiredOtp() {
        log.info("Menjalankan OTP cleanup scheduler...");
        otpTokenRepository.deleteByExpiredAtBefore(LocalDateTime.now());
        log.info("OTP expired berhasil dihapus.");
    }
}
