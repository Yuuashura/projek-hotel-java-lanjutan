package com.ngninep.booking.service;

import com.ngninep.booking.entity.Booking;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class EmailNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(EmailNotificationService.class);
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd MMMM yyyy");

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Value("${app.name:NgiNep}")
    private String appName;

    @Value("${app.url:https://nginep.com}")
    private String appUrl;

    @Async
    public void sendPaymentSuccessEmail(Booking booking) {
        if (isBlank(booking.getOrdererEmail())) {
            logger.warn("EmailNotification: skip sendPaymentSuccessEmail – no email for booking #{}", booking.getIdBooking());
            return;
        }
        try {
            String subject = "Pembayaran Berhasil – Booking #" + booking.getIdBooking() + " Dikonfirmasi";
            String html = buildPaymentSuccessHtml(booking);
            sendHtml(booking.getOrdererEmail(), subject, html);
            logger.info("EmailNotification: payment success email sent to {} for booking #{}", booking.getOrdererEmail(), booking.getIdBooking());
        } catch (Exception e) {
            logger.error("EmailNotification: failed to send payment success email for booking #{}: {}", booking.getIdBooking(), e.getMessage());
        }
    }

    @Async
    public void sendCancellationEmail(Booking booking) {
        if (isBlank(booking.getOrdererEmail())) {
            logger.warn("EmailNotification: skip sendCancellationEmail – no email for booking #{}", booking.getIdBooking());
            return;
        }
        try {
            String subject = "Pesanan #" + booking.getIdBooking() + " Dibatalkan";
            String html = buildCancellationHtml(booking);
            sendHtml(booking.getOrdererEmail(), subject, html);
            logger.info("EmailNotification: cancellation email sent to {} for booking #{}", booking.getOrdererEmail(), booking.getIdBooking());
        } catch (Exception e) {
            logger.error("EmailNotification: failed to send cancellation email for booking #{}: {}", booking.getIdBooking(), e.getMessage());
        }
    }

    private void sendHtml(String to, String subject, String htmlBody) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(fromEmail, appName);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlBody, true);
        mailSender.send(message);
    }

    private String buildPaymentSuccessHtml(Booking booking) {
        String checkIn  = booking.getCheckIn()  != null ? booking.getCheckIn().format(DATE_FMT)  : "-";
        String checkOut = booking.getCheckOut() != null ? booking.getCheckOut().format(DATE_FMT) : "-";
        String total    = booking.getTotalPrice() != null
                ? "Rp " + String.format("%,.0f", (double) booking.getTotalPrice()).replace(",", ".")
                : "-";

        return """
            <!DOCTYPE html>
            <html lang="id">
            <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
            <body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#f4f4f4;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
                <tr><td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                    <!-- Header -->
                    <tr>
                      <td style="background:linear-gradient(135deg,#1a1a2e 0%%,#16213e 100%%);padding:40px 40px 32px;text-align:center;">
                        <div style="font-size:28px;font-weight:300;color:#D4AF37;letter-spacing:3px;margin-bottom:4px;">%s</div>
                        <div style="font-size:13px;color:#aaa;letter-spacing:1px;">Hotel Booking Platform</div>
                      </td>
                    </tr>
                    <!-- Success Banner -->
                    <tr>
                      <td style="background:#F0FFF4;border-bottom:3px solid #48BB78;padding:28px 40px;text-align:center;">
                        <div style="font-size:48px;margin-bottom:8px;">✅</div>
                        <div style="font-size:22px;font-weight:600;color:#276749;">Pembayaran Berhasil!</div>
                        <div style="font-size:14px;color:#555;margin-top:6px;">Pesanan Anda telah dikonfirmasi dan siap untuk check-in.</div>
                      </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                      <td style="padding:32px 40px;">
                        <p style="margin:0 0 24px;font-size:15px;color:#333;">Halo <strong>%s</strong>,</p>
                        <p style="margin:0 0 24px;font-size:14px;color:#555;line-height:1.6;">
                          Selamat! Pembayaran Anda untuk pemesanan hotel di <strong>%s</strong> telah berhasil diterima dan pesanan Anda kini berstatus <strong style="color:#276749;">CONFIRMED</strong>.
                        </p>
                        <!-- Detail Box -->
                        <table width="100%%" cellpadding="0" cellspacing="0" style="background:#F7FAFC;border:1px solid #E2E8F0;border-radius:8px;overflow:hidden;margin-bottom:24px;">
                          <tr><td style="padding:16px 20px;border-bottom:1px solid #E2E8F0;background:#EDF2F7;">
                            <span style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#718096;font-weight:600;">Detail Reservasi</span>
                          </td></tr>
                          <tr><td style="padding:20px;">
                            <table width="100%%" cellpadding="6" cellspacing="0">
                              <tr>
                                <td style="font-size:13px;color:#718096;width:45%%;">No. Pesanan</td>
                                <td style="font-size:13px;color:#2D3748;font-weight:600;">#%d</td>
                              </tr>
                              <tr style="background:#fff;">
                                <td style="font-size:13px;color:#718096;">Nama Pemesan</td>
                                <td style="font-size:13px;color:#2D3748;">%s</td>
                              </tr>
                              <tr>
                                <td style="font-size:13px;color:#718096;">Check-In</td>
                                <td style="font-size:13px;color:#2D3748;font-weight:600;">%s</td>
                              </tr>
                              <tr style="background:#fff;">
                                <td style="font-size:13px;color:#718096;">Check-Out</td>
                                <td style="font-size:13px;color:#2D3748;font-weight:600;">%s</td>
                              </tr>
                              <tr>
                                <td style="font-size:13px;color:#718096;">Jumlah Tamu</td>
                                <td style="font-size:13px;color:#2D3748;">%d orang</td>
                              </tr>
                              <tr style="background:#fff;">
                                <td style="font-size:13px;color:#718096;">Total Pembayaran</td>
                                <td style="font-size:13px;color:#D4AF37;font-weight:700;font-size:15px;">%s</td>
                              </tr>
                            </table>
                          </td></tr>
                        </table>
                        <!-- CTA Button -->
                        <table width="100%%" cellpadding="0" cellspacing="0">
                          <tr><td align="center" style="padding:8px 0 24px;">
                            <a href="%s/my-bookings" style="display:inline-block;background:#D4AF37;color:#1a1a2e;text-decoration:none;font-weight:700;font-size:14px;padding:14px 36px;border-radius:8px;letter-spacing:0.5px;">Lihat Pesanan Saya</a>
                          </td></tr>
                        </table>
                        <p style="font-size:13px;color:#718096;line-height:1.6;margin:0;">
                          Jika ada pertanyaan, silakan hubungi kami melalui email ini. Terima kasih telah memilih <strong>%s</strong>! 🏨
                        </p>
                      </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                      <td style="background:#F7FAFC;border-top:1px solid #E2E8F0;padding:20px 40px;text-align:center;">
                        <p style="font-size:12px;color:#A0AEC0;margin:0;">© 2025 %s. Email ini dikirim otomatis, mohon tidak membalas.</p>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(
                appName,
                booking.getOrdererName(),
                "Hotel #" + booking.getHotelId(),
                booking.getIdBooking(),
                booking.getOrdererName(),
                checkIn,
                checkOut,
                booking.getNumberOfGuest(),
                total,
                appUrl,
                appName,
                appName
        );
    }

    private String buildCancellationHtml(Booking booking) {
        String checkIn  = booking.getCheckIn()  != null ? booking.getCheckIn().format(DATE_FMT)  : "-";
        String checkOut = booking.getCheckOut() != null ? booking.getCheckOut().format(DATE_FMT) : "-";

        return """
            <!DOCTYPE html>
            <html lang="id">
            <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
            <body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#f4f4f4;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
                <tr><td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                    <!-- Header -->
                    <tr>
                      <td style="background:linear-gradient(135deg,#1a1a2e 0%%,#16213e 100%%);padding:40px 40px 32px;text-align:center;">
                        <div style="font-size:28px;font-weight:300;color:#D4AF37;letter-spacing:3px;margin-bottom:4px;">%s</div>
                        <div style="font-size:13px;color:#aaa;letter-spacing:1px;">Hotel Booking Platform</div>
                      </td>
                    </tr>
                    <!-- Cancel Banner -->
                    <tr>
                      <td style="background:#FFF5F5;border-bottom:3px solid #FC8181;padding:28px 40px;text-align:center;">
                        <div style="font-size:48px;margin-bottom:8px;">❌</div>
                        <div style="font-size:22px;font-weight:600;color:#9B2C2C;">Pesanan Dibatalkan</div>
                        <div style="font-size:14px;color:#555;margin-top:6px;">Pesanan Anda telah dibatalkan.</div>
                      </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                      <td style="padding:32px 40px;">
                        <p style="margin:0 0 24px;font-size:15px;color:#333;">Halo <strong>%s</strong>,</p>
                        <p style="margin:0 0 24px;font-size:14px;color:#555;line-height:1.6;">
                          Pesanan hotel Anda dengan ID <strong>#%d</strong> telah dibatalkan. Berikut adalah ringkasan pesanan yang dibatalkan:
                        </p>
                        <!-- Detail Box -->
                        <table width="100%%" cellpadding="0" cellspacing="0" style="background:#F7FAFC;border:1px solid #E2E8F0;border-radius:8px;overflow:hidden;margin-bottom:24px;">
                          <tr><td style="padding:16px 20px;border-bottom:1px solid #E2E8F0;background:#FFF5F5;">
                            <span style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#9B2C2C;font-weight:600;">Detail Pesanan Yang Dibatalkan</span>
                          </td></tr>
                          <tr><td style="padding:20px;">
                            <table width="100%%" cellpadding="6" cellspacing="0">
                              <tr>
                                <td style="font-size:13px;color:#718096;width:45%%;">No. Pesanan</td>
                                <td style="font-size:13px;color:#2D3748;font-weight:600;">#%d</td>
                              </tr>
                              <tr style="background:#fff;">
                                <td style="font-size:13px;color:#718096;">Check-In</td>
                                <td style="font-size:13px;color:#2D3748;">%s</td>
                              </tr>
                              <tr>
                                <td style="font-size:13px;color:#718096;">Check-Out</td>
                                <td style="font-size:13px;color:#2D3748;">%s</td>
                              </tr>
                              <tr style="background:#fff;">
                                <td style="font-size:13px;color:#718096;">Jumlah Tamu</td>
                                <td style="font-size:13px;color:#2D3748;">%d orang</td>
                              </tr>
                            </table>
                          </td></tr>
                        </table>
                        <!-- CTA Button -->
                        <table width="100%%" cellpadding="0" cellspacing="0">
                          <tr><td align="center" style="padding:8px 0 24px;">
                            <a href="%s/hotels" style="display:inline-block;background:#D4AF37;color:#1a1a2e;text-decoration:none;font-weight:700;font-size:14px;padding:14px 36px;border-radius:8px;letter-spacing:0.5px;">Pesan Hotel Lain</a>
                          </td></tr>
                        </table>
                        <p style="font-size:13px;color:#718096;line-height:1.6;margin:0;">
                          Jika pembatalan ini bukan atas permintaan Anda atau ada pertanyaan, silakan hubungi kami segera.
                        </p>
                      </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                      <td style="background:#F7FAFC;border-top:1px solid #E2E8F0;padding:20px 40px;text-align:center;">
                        <p style="font-size:12px;color:#A0AEC0;margin:0;">© 2025 %s. Email ini dikirim otomatis, mohon tidak membalas.</p>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(
                appName,
                booking.getOrdererName(),
                booking.getIdBooking(),
                booking.getIdBooking(),
                checkIn,
                checkOut,
                booking.getNumberOfGuest(),
                appUrl,
                appName
        );
    }

    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
