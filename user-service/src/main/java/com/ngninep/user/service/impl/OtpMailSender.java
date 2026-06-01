package com.ngninep.user.service.impl;

import com.ngninep.user.entity.OtpToken;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class OtpMailSender {

    private final JavaMailSender mailSender;

    @Async("otpMailTaskExecutor")
    public void sendOtpEmailAsync(String toEmail, String otpCode, OtpToken.Purpose purpose) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            helper.setTo(toEmail);
            helper.setSubject(getSubject(purpose));
            helper.setText(getPlainBody(otpCode, purpose), getHtmlBody(toEmail, otpCode, purpose));
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

    private String getPlainBody(String otpCode, OtpToken.Purpose purpose) {
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

    private String getHtmlBody(String toEmail, String otpCode, OtpToken.Purpose purpose) {
        String title = purpose == OtpToken.Purpose.PASSWORD_RESET
                ? "Reset password akun"
                : "Verifikasi email akun";
        String description = purpose == OtpToken.Purpose.PASSWORD_RESET
                ? "Gunakan kode berikut untuk melanjutkan proses reset password akun NgiNep kamu."
                : "Gunakan kode berikut untuk menyelesaikan verifikasi akun NgiNep kamu.";
        String badge = purpose == OtpToken.Purpose.PASSWORD_RESET ? "Reset Password" : "Verifikasi Akun";
        String safeEmail = escapeHtml(toEmail);
        String safeOtp = escapeHtml(otpCode);

        return """
                <!doctype html>
                <html lang="id">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>%s</title>
                </head>
                <body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
                    <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#f4f7fb;padding:32px 12px;">
                        <tr>
                            <td align="center">
                                <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;max-width:560px;background:#ffffff;border:1px solid #dbe5f1;border-radius:18px;overflow:hidden;box-shadow:0 24px 60px rgba(15,23,42,0.12);">
                                    <tr>
                                        <td style="padding:30px 32px;background:linear-gradient(135deg,#0f2f5c,#2563eb);">
                                            <div style="font-size:28px;line-height:1;font-weight:800;color:#ffffff;">NgiNep<span style="color:#fbbf24;">.</span></div>
                                            <div style="margin-top:18px;display:inline-block;padding:7px 12px;border-radius:999px;background:rgba(255,255,255,0.14);border:1px solid rgba(255,255,255,0.22);color:#ffffff;font-size:12px;font-weight:700;">%s</div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding:34px 32px 10px;">
                                            <h1 style="margin:0;font-size:24px;line-height:1.25;font-weight:800;color:#0f172a;">%s</h1>
                                            <p style="margin:12px 0 0;font-size:15px;line-height:1.7;color:#475569;">%s</p>
                                            <p style="margin:12px 0 0;font-size:13px;line-height:1.6;color:#64748b;">Dikirim untuk <strong style="color:#0f172a;">%s</strong></p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="center" style="padding:22px 32px 26px;">
                                            <div style="display:inline-block;padding:18px 26px;border-radius:16px;background:#eef6ff;border:1px solid #bfdbfe;box-shadow:inset 0 1px 0 rgba(255,255,255,0.8);">
                                                <div style="font-size:12px;line-height:1.4;color:#2563eb;font-weight:800;text-transform:uppercase;">Kode OTP</div>
                                                <div style="margin-top:8px;font-size:34px;line-height:1;font-weight:800;color:#0f172a;font-family:'Courier New',Courier,monospace;">%s</div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding:0 32px 30px;">
                                            <div style="padding:16px 18px;border-radius:14px;background:#fff7ed;border:1px solid #fed7aa;color:#9a3412;font-size:13px;line-height:1.65;">
                                                Kode ini berlaku selama <strong>5 menit</strong>. Jangan bagikan kode ini kepada siapa pun, termasuk pihak yang mengaku dari NgiNep.
                                            </div>
                                            <p style="margin:22px 0 0;font-size:14px;line-height:1.7;color:#64748b;">Jika kamu tidak meminta kode ini, abaikan email ini. Akun kamu tetap aman selama kode tidak dibagikan.</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding:20px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;">
                                            <p style="margin:0;font-size:12px;line-height:1.6;color:#64748b;">Email otomatis dari NgiNep. Mohon tidak membalas email ini.</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                """.formatted(
                escapeHtml(title),
                escapeHtml(badge),
                escapeHtml(title),
                escapeHtml(description),
                safeEmail,
                safeOtp
        );
    }

    private String escapeHtml(String value) {
        if (value == null) {
            return "";
        }
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
