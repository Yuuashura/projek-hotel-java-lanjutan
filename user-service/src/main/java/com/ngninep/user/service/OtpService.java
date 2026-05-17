package com.ngninep.user.service;

import com.ngninep.user.entity.OtpToken;
import com.ngninep.user.repository.OtpTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private final OtpTokenRepository otpTokenRepository;
    private final JavaMailSender mailSender;

    // Generate 6 digit OTP acak, simpan ke DB, kirim ke email
    public void generateAndSendOtp(String email) {
        String otpCode = generateOtpCode();

        OtpToken otp = OtpToken.builder()
                .email(email)
                .otp_code(otpCode)
                .created_at(LocalDateTime.now())
                .expired_at(LocalDateTime.now().plusMinutes(5))
                .used(false)            // ✅ field sekarang: 'used'
                .build();

        otpTokenRepository.save(otp);
        sendOtpEmail(email, otpCode);

        log.info("OTP dikirim ke {}: {}", email, otpCode);
    }

    // Cek apakah boleh kirim OTP baru (rate limit: 1x per 5 menit)
    public Optional<OtpToken> getActiveOtp(String email) {
        return otpTokenRepository.findTopByEmailAndUsedFalseOrderByCreatedAtDesc(email);
    }

    // Validasi OTP yang diinput user
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

        if (LocalDateTime.now().isAfter(otp.getExpired_at())) {
            return "OTP_EXPIRED";
        }

        // OTP valid — tandai sebagai sudah dipakai
        otp.setUsed(true);              // ✅ Lombok generate: setUsed()
        otpTokenRepository.save(otp);

        return "OTP_VALID";
    }

    // Invalidate semua OTP aktif milik email (dipanggil saat resend)
    public void invalidateAllActiveOtp(String email) {
        List<OtpToken> activeOtps = otpTokenRepository.findAllByEmailAndUsedFalse(email);
        activeOtps.forEach(otp -> otp.setUsed(true));   // ✅ setUsed()
        otpTokenRepository.saveAll(activeOtps);
    }

    // Generate 6 digit angka acak
    private String generateOtpCode() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    // Kirim email OTP via Gmail SMTP
    private void sendOtpEmail(String toEmail, String otpCode) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Kode Verifikasi NgiNep");
        message.setText(
                "Halo!\n\n" +
                "Kode OTP verifikasi akun NgiNep kamu adalah:\n\n" +
                "  " + otpCode + "\n\n" +
                "Kode ini berlaku selama 5 menit.\n" +
                "Jangan bagikan kode ini kepada siapapun.\n\n" +
                "Tim NgiNep"
        );
        mailSender.send(message);
    }
}
