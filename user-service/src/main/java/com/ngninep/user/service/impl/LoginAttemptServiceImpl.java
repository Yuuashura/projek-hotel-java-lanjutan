package com.ngninep.user.service.impl;

import com.ngninep.user.entity.LoginAttempt;
import com.ngninep.user.exception.LoginRateLimitException;
import com.ngninep.user.repository.LoginAttemptRepository;
import com.ngninep.user.service.LoginAttemptService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class LoginAttemptServiceImpl implements LoginAttemptService {

    private final LoginAttemptRepository loginAttemptRepository;

    @Value("${security.login-rate-limit.email-ip-limit:10}")
    private int emailIpLimit;

    @Value("${security.login-rate-limit.ip-limit:30}")
    private int ipLimit;

    @Value("${security.login-rate-limit.window-seconds:900}")
    private long windowSeconds;

    @Value("${security.login-rate-limit.retention-hours:24}")
    private long retentionHours;

    @Override
    @Transactional(readOnly = true)
    public void checkAllowed(String email, String ipAddress) {
        String normalizedEmail = normalizeEmail(email);
        String normalizedIp = normalizeIp(ipAddress);
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime cutoff = now.minusSeconds(windowSeconds);

        long emailIpFailures = loginAttemptRepository
                .countByEmailAndIpAddressAndAttemptedAtAfter(normalizedEmail, normalizedIp, cutoff);
        if (emailIpFailures >= emailIpLimit) {
            LocalDateTime oldest = loginAttemptRepository
                    .findTopByEmailAndIpAddressAndAttemptedAtAfterOrderByAttemptedAtAsc(
                            normalizedEmail,
                            normalizedIp,
                            cutoff
                    )
                    .map(LoginAttempt::getAttemptedAt)
                    .orElse(now);
            throwRateLimit(now, oldest);
        }

        long ipFailures = loginAttemptRepository.countByIpAddressAndAttemptedAtAfter(normalizedIp, cutoff);
        if (ipFailures >= ipLimit) {
            LocalDateTime oldest = loginAttemptRepository
                    .findTopByIpAddressAndAttemptedAtAfterOrderByAttemptedAtAsc(normalizedIp, cutoff)
                    .map(LoginAttempt::getAttemptedAt)
                    .orElse(now);
            throwRateLimit(now, oldest);
        }
    }

    @Override
    @Transactional
    public void recordFailure(String email, String ipAddress) {
        loginAttemptRepository.save(LoginAttempt.builder()
                .email(normalizeEmail(email))
                .ipAddress(normalizeIp(ipAddress))
                .attemptedAt(LocalDateTime.now())
                .build());
    }

    @Override
    @Transactional
    public void clearFailures(String email, String ipAddress) {
        loginAttemptRepository.deleteByEmailAndIpAddress(normalizeEmail(email), normalizeIp(ipAddress));
    }

    @Override
    @Scheduled(fixedDelayString = "${security.login-rate-limit.cleanup-interval-ms:3600000}")
    @Transactional
    public void cleanupExpiredAttempts() {
        loginAttemptRepository.deleteByAttemptedAtBefore(LocalDateTime.now().minusHours(retentionHours));
    }

    private void throwRateLimit(LocalDateTime now, LocalDateTime oldestAttempt) {
        LocalDateTime availableAt = oldestAttempt.plusSeconds(windowSeconds);
        long retryAfter = Math.max(1, Duration.between(now, availableAt).getSeconds());
        long retryMinutes = Math.max(1, (retryAfter + 59) / 60);
        throw new LoginRateLimitException(
                String.format("Terlalu banyak percobaan login. Silakan coba lagi dalam %d menit.", retryMinutes),
                retryAfter
        );
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeIp(String ipAddress) {
        if (ipAddress == null || ipAddress.isBlank()) {
            return "unknown";
        }
        return ipAddress.trim();
    }
}
