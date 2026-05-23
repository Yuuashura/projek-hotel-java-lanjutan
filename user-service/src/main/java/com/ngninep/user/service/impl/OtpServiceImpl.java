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
    public void generateAndSendOtp(String email) {
        String otpCode = generateOtpCode();

        OtpToken otp = OtpToken.builder()
                .email(email)
                .otp_code(otpCode)
                .createdAt(LocalDateTime.now())
                .expiredAt(LocalDateTime.now().plusMinutes(5))
                .used(false)
                .build();

        otpTokenRepository.save(otp);
        otpMailSender.sendOtpEmailAsync(email, otpCode);

        log.info("OTP dikirim ke {}: {}", email, otpCode);
    }

    @Override
    public Optional<OtpToken> getActiveOtp(String email) {
        return otpTokenRepository.findTopByEmailAndUsedFalseOrderByCreatedAtDesc(email);
    }

    @Override
    public String validateOtp(String email, String otpCode) {
        Optional<OtpToken> optionalOtp = otpTokenRepository
                .findTopByEmailAndUsedFalseOrderByCreatedAtDesc(email);

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

        otp.setUsed(true);
        otpTokenRepository.save(otp);

        return "OTP_VALID";
    }

    @Override
    public void invalidateAllActiveOtp(String email) {
        List<OtpToken> activeOtps = otpTokenRepository.findAllByEmailAndUsedFalse(email);
        activeOtps.forEach(otp -> otp.setUsed(true));
        otpTokenRepository.saveAll(activeOtps);
    }

    private String generateOtpCode() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }
}
