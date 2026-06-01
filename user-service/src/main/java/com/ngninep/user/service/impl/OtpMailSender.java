package com.ngninep.user.service.impl;

import com.ngninep.user.entity.OtpToken;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class OtpMailSender {

    private final JavaMailSender mailSender;

    @Async("otpMailTaskExecutor")
    public void sendOtpEmailAsync(String toEmail, String otpCode, OtpToken.Purpose purpose) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject(getSubject(purpose));
        message.setText(getBody(otpCode, purpose));

        try {
            mailSender.send(message);
            log.info("Email OTP {} berhasil dikirim ke {}", purpose, toEmail);
        } catch (Exception ex) {
            log.error("Gagal mengirim email OTP {} ke {}", purpose, toEmail, ex);
        }
    }

    private String getSubject(OtpToken.Purpose purpose) {
        if (purpose == OtpToken.Purpose.PASSWORD_RESET) {
            return "Kode Reset Password NgiNep";
        }
        return "Kode Verifikasi NgiNep";
    }

    private String getBody(String otpCode, OtpToken.Purpose purpose) {
        String action = purpose == OtpToken.Purpose.PASSWORD_RESET
                ? "reset password akun NgiNep kamu"
                : "verifikasi akun NgiNep kamu";

        return "Halo!\n\n" +
                "Kode OTP untuk " + action + " adalah:\n\n" +
                "  " + otpCode + "\n\n" +
                "Kode ini berlaku selama 5 menit.\n" +
                "Jangan bagikan kode ini kepada siapapun.\n\n" +
                "Tim NgiNep";
    }
}
