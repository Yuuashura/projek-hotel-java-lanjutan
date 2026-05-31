package com.ngninep.user.service.impl;

import com.ngninep.user.entity.OtpToken;
import com.ngninep.user.repository.OtpTokenRepository;
import com.ngninep.user.service.OtpService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpServiceImpl implements OtpService {

    private final OtpTokenRepository otpTokenRepository;
    private final OtpMailSender otpMailSender;

    @Override
    public void generateAndSendOtp(String email, OtpToken.Purpose purpose) {
        String otpCode = generateOtpCode();

        OtpToken otp = OtpToken.builder()
                .email(email)
                .otp_code(otpCode)
                .purpose(purpose)
                .createdAt(LocalDateTime.now())
                .expiredAt(LocalDateTime.now().plusMinutes(5))
                .used(false)
                .build();

        otpTokenRepository.save(otp);
        otpMailSender.sendOtpEmailAsync(email, otpCode, purpose);

        log.info("Pengiriman OTP {} dijadwalkan untuk {}", purpose, email);
    }

    @Override
    public Optional<OtpToken> getActiveOtp(String email, OtpToken.Purpose purpose) {
        return otpTokenRepository.findTopByEmailAndPurposeAndUsedFalseOrderByCreatedAtDesc(email, purpose);
    }

    @Override
    public String checkOtp(String email, String otpCode, OtpToken.Purpose purpose) {
        Optional<OtpToken> optionalOtp = otpTokenRepository
                .findTopByEmailAndPurposeAndUsedFalseOrderByCreatedAtDesc(email, purpose);

        if (optionalOtp.isEmpty()) {
            return "OTP_NOT_FOUND";
        }

        OtpToken otp = optionalOtp.get();

        if (!otp.getOtp_code().equals(otpCode)) {
            return "OTP_INVALID";
        }

        if (LocalDateTime.now().isAfter(otp.getExpiredAt())) {
            return "OTP_EXPIRED";
        }

        return "OTP_VALID";
    }

    @Override
    public String validateOtp(String email, String otpCode, OtpToken.Purpose purpose) {
        String result = checkOtp(email, otpCode, purpose);
        if (!"OTP_VALID".equals(result)) {
            return result;
        }

        OtpToken otp = otpTokenRepository
                .findTopByEmailAndPurposeAndUsedFalseOrderByCreatedAtDesc(email, purpose)
                .orElseThrow();
        otp.setUsed(true);
        otpTokenRepository.save(otp);

        return "OTP_VALID";
    }

    @Override
    public void invalidateAllActiveOtp(String email, OtpToken.Purpose purpose) {
        List<OtpToken> activeOtps = otpTokenRepository.findAllByEmailAndPurposeAndUsedFalse(email, purpose);
        activeOtps.forEach(otp -> otp.setUsed(true));
        otpTokenRepository.saveAll(activeOtps);
    }

    private String generateOtpCode() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }
}
