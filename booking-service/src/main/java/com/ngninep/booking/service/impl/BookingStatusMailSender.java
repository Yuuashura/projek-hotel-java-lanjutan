package com.ngninep.booking.service.impl;

import com.ngninep.booking.entity.Booking;
import com.ngninep.booking.entity.BookingStatus;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Component
@RequiredArgsConstructor
@Slf4j
public class BookingStatusMailSender {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy", Locale.forLanguageTag("id-ID"));
    private static final Locale INDONESIA = Locale.forLanguageTag("id-ID");

    private final JavaMailSender mailSender;

    @Async("bookingStatusMailTaskExecutor")
    public void sendStatusChangedEmail(Booking booking, BookingStatus previousStatus, BookingStatus nextStatus) {
        if (booking.getOrdererEmail() == null || booking.getOrdererEmail().isBlank()) {
            log.warn("Email status booking #{} dilewati karena email pemesan kosong", booking.getIdBooking());
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            helper.setSubject(getSubject(nextStatus, booking.getIdBooking()));
            helper.setText(getPlainBody(booking, previousStatus, nextStatus), getHtmlBody(booking, previousStatus, nextStatus));
            mailSender.send(message);
            log.info("Email status booking #{} berhasil dikirim ke {}", booking.getIdBooking(), booking.getOrdererEmail());
        } catch (Exception ex) {
            log.error("Gagal mengirim email status booking #{} ke {}", booking.getIdBooking(), booking.getOrdererEmail(), ex);
        }
    }

    private String getSubject(BookingStatus status, int bookingId) {
        return "Status Pemesanan NgiNep #" + bookingId + ": " + getStatusLabel(status);
    }

    private String getPlainBody(Booking booking, BookingStatus previousStatus, BookingStatus nextStatus) {
        return "Halo " + safeText(booking.getOrdererName(), "Pelanggan NgiNep") + ",\n\n" +
                "Status pemesanan kamu telah diperbarui.\n\n" +
                "ID Booking: #" + booking.getIdBooking() + "\n" +
                "Status sebelumnya: " + getStatusLabel(previousStatus) + "\n" +
                "Status terbaru: " + getStatusLabel(nextStatus) + "\n" +
                "Check-in: " + formatDate(booking.getCheckIn()) + "\n" +
                "Check-out: " + formatDate(booking.getCheckOut()) + "\n" +
                "Total: " + formatCurrency(booking.getTotalPrice()) + "\n\n" +
                getStatusMessage(nextStatus) + "\n\n" +
                "Tim NgiNep";
    }

    private String getHtmlBody(Booking booking, BookingStatus previousStatus, BookingStatus nextStatus) {
        String statusLabel = getStatusLabel(nextStatus);
        String statusColor = getStatusColor(nextStatus);
        String customerName = escapeHtml(safeText(booking.getOrdererName(), "Pelanggan NgiNep"));

        return """
                <!doctype html>
                <html lang="id">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Status Pemesanan NgiNep</title>
                </head>
                <body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
                    <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#f4f7fb;padding:32px 12px;">
                        <tr>
                            <td align="center">
                                <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;max-width:600px;background:#ffffff;border:1px solid #dbe5f1;border-radius:18px;overflow:hidden;box-shadow:0 24px 60px rgba(15,23,42,0.12);">
                                    <tr>
                                        <td style="padding:30px 32px;background:linear-gradient(135deg,#0f2f5c,#2563eb);">
                                            <div style="font-size:28px;line-height:1;font-weight:800;color:#ffffff;">NgiNep<span style="color:#fbbf24;">.</span></div>
                                            <div style="margin-top:18px;display:inline-block;padding:7px 12px;border-radius:999px;background:rgba(255,255,255,0.14);border:1px solid rgba(255,255,255,0.22);color:#ffffff;font-size:12px;font-weight:700;">Update Status Booking</div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding:34px 32px 12px;">
                                            <h1 style="margin:0;font-size:24px;line-height:1.25;font-weight:800;color:#0f172a;">Halo, %s</h1>
                                            <p style="margin:12px 0 0;font-size:15px;line-height:1.7;color:#475569;">Status pemesanan kamu telah diperbarui oleh admin hotel.</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="center" style="padding:18px 32px 24px;">
                                            <div style="display:inline-block;min-width:220px;padding:18px 24px;border-radius:16px;background:%s;border:1px solid rgba(15,23,42,0.08);">
                                                <div style="font-size:12px;line-height:1.4;color:#475569;font-weight:800;text-transform:uppercase;">Status Terbaru</div>
                                                <div style="margin-top:8px;font-size:26px;line-height:1;font-weight:800;color:#0f172a;">%s</div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding:0 32px 28px;">
                                            <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;">
                                                %s
                                            </table>
                                            <div style="margin-top:18px;padding:16px 18px;border-radius:14px;background:#eef6ff;border:1px solid #bfdbfe;color:#1e3a8a;font-size:13px;line-height:1.65;">
                                                %s
                                            </div>
                                            <p style="margin:22px 0 0;font-size:14px;line-height:1.7;color:#64748b;">Kamu bisa melihat detail pemesanan melalui halaman My Bookings di NgiNep.</p>
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
                customerName,
                statusColor,
                escapeHtml(statusLabel),
                buildDetailRows(booking, previousStatus, nextStatus),
                escapeHtml(getStatusMessage(nextStatus))
        );
    }

    private String buildDetailRows(Booking booking, BookingStatus previousStatus, BookingStatus nextStatus) {
        return detailRow("ID Booking", "#" + booking.getIdBooking()) +
                detailRow("Status Sebelumnya", getStatusLabel(previousStatus)) +
                detailRow("Status Terbaru", getStatusLabel(nextStatus)) +
                detailRow("Check-in", formatDate(booking.getCheckIn())) +
                detailRow("Check-out", formatDate(booking.getCheckOut())) +
                detailRow("Jumlah Tamu", String.valueOf(booking.getNumberOfGuest())) +
                detailRow("Total", formatCurrency(booking.getTotalPrice()));
    }

    private String detailRow(String label, String value) {
        return """
                <tr>
                    <td style="padding:12px 16px;background:#f8fafc;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px;">%s</td>
                    <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:13px;font-weight:700;text-align:right;">%s</td>
                </tr>
                """.formatted(escapeHtml(label), escapeHtml(value));
    }

    private String getStatusLabel(BookingStatus status) {
        if (status == null) {
            return "-";
        }
        return switch (status) {
            case PENDING -> "Menunggu Pembayaran";
            case CONFIRMED -> "Dikonfirmasi";
            case CANCELLED -> "Dibatalkan";
            case COMPLETED -> "Selesai";
        };
    }

    private String getStatusMessage(BookingStatus status) {
        if (status == BookingStatus.CONFIRMED) {
            return "Pemesanan kamu sudah dikonfirmasi. Simpan email ini sebagai referensi saat check-in.";
        }
        if (status == BookingStatus.CANCELLED) {
            return "Pemesanan kamu telah dibatalkan. Hubungi pihak hotel jika kamu merasa ada kesalahan.";
        }
        if (status == BookingStatus.COMPLETED) {
            return "Terima kasih sudah menginap bersama NgiNep. Pemesanan kamu sudah selesai.";
        }
        return "Pemesanan kamu masih menunggu proses berikutnya.";
    }

    private String getStatusColor(BookingStatus status) {
        if (status == BookingStatus.CONFIRMED) {
            return "#dcfce7";
        }
        if (status == BookingStatus.CANCELLED) {
            return "#fee2e2";
        }
        if (status == BookingStatus.COMPLETED) {
            return "#dbeafe";
        }
        return "#fef3c7";
    }

    private String formatDate(java.time.LocalDate date) {
        return date != null ? date.format(DATE_FORMATTER) : "-";
    }

    private String formatCurrency(Long value) {
        if (value == null) {
            return "Rp 0";
        }
        return NumberFormat.getCurrencyInstance(INDONESIA).format(value);
    }

    private String safeText(String value, String fallback) {
        return value != null && !value.isBlank() ? value : fallback;
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
