package com.ngninep.user.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OtpMailSender {

    private final JavaMailSender mailSender;

    @Async
    public void sendOtpEmailAsync(String toEmail, String otpCode) {
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
