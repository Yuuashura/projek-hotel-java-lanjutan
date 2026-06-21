package com.ngninep.booking.service.impl;

import com.ngninep.booking.dto.req.XenditInvoiceWebhookRequest;
import com.ngninep.booking.dto.res.XenditInvoiceResponse;
import com.ngninep.booking.entity.Booking;
import com.ngninep.booking.entity.BookingStatus;
import com.ngninep.booking.repository.BookingRepository;
import com.ngninep.booking.service.EmailNotificationService;
import com.ngninep.booking.service.XenditPaymentService;
import com.ngninep.booking.util.Message;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class XenditPaymentServiceImpl implements XenditPaymentService {

    private static final Logger logger = LoggerFactory.getLogger(XenditPaymentServiceImpl.class);
    private static final Duration XENDIT_TIMEOUT = Duration.ofSeconds(10);
    private static final String PAYMENT_METHOD_XENDIT = "XENDIT";
    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_PAID = "PAID";
    private static final String STATUS_SETTLED = "SETTLED";
    private static final String STATUS_EXPIRED = "EXPIRED";

    private final BookingRepository bookingRepository;
    private final EmailNotificationService emailNotificationService;

    @Qualifier("xenditWebClient")
    private final WebClient xenditWebClient;

    @Value("${xendit.api-key:}")
    private String apiKey;

    @Value("${xendit.callback-token:}")
    private String callbackToken;

    @Value("${xendit.success-redirect-url:https://deciduous-unfurrowed-august.ngrok-free.dev/my-bookings}")
    private String successRedirectUrl;

    @Value("${xendit.failure-redirect-url:https://deciduous-unfurrowed-august.ngrok-free.dev/my-bookings}")
    private String failureRedirectUrl;

    @Override
    @Transactional
    public XenditInvoiceResponse createInvoice(int bookingId, int customerId) {
        ensureApiKeyConfigured();
        Booking booking = getBookingForCustomer(bookingId, customerId);
        validatePayableBooking(booking);

        if (booking.getXenditInvoiceUrl() != null && !booking.getXenditInvoiceUrl().isBlank()
                && !STATUS_EXPIRED.equalsIgnoreCase(booking.getPaymentStatus())) {
            return mapToInvoiceResponse(booking);
        }

        String externalId = "NGINEP-BOOKING-" + booking.getIdBooking() + "-" + System.currentTimeMillis();
        Map<String, Object> body = new HashMap<>();
        body.put("external_id", externalId);
        body.put("amount", booking.getTotalPrice());
        body.put("description", "Pembayaran booking NgiNep #" + booking.getIdBooking());
        body.put("payer_email", booking.getOrdererEmail());
        body.put("success_redirect_url", successRedirectUrl);
        body.put("failure_redirect_url", failureRedirectUrl);
        body.put("currency", "IDR");
        body.put("expiry_duration", calculateExpiryDurationSeconds(booking));

        logger.info("Creating Xendit invoice for booking #{} with success_redirect_url={} failure_redirect_url={}",
                booking.getIdBooking(), successRedirectUrl, failureRedirectUrl);

        Map<String, Object> xenditResponse;
        try {
            xenditResponse = xenditWebClient.post()
                    .uri("/v2/invoices")
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {
                    })
                    .block(XENDIT_TIMEOUT);
        } catch (WebClientResponseException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Gagal membuat invoice Xendit" + ": " + ex.getResponseBodyAsString());
        } catch (RuntimeException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Gagal membuat invoice Xendit");
        }

        if (xenditResponse == null || xenditResponse.get("invoice_url") == null) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Gagal membuat invoice Xendit");
        }

        booking.setPaymentMethod(PAYMENT_METHOD_XENDIT);
        booking.setPaymentStatus(readString(xenditResponse, "status", STATUS_PENDING));
        booking.setXenditInvoiceId(readString(xenditResponse, "id", null));
        booking.setXenditExternalId(externalId);
        booking.setXenditInvoiceUrl(readString(xenditResponse, "invoice_url", null));

        return mapToInvoiceResponse(bookingRepository.save(booking));
    }

    @Override
    @Transactional
    public void handleInvoiceWebhook(String requestCallbackToken, XenditInvoiceWebhookRequest request) {
        logger.info("=== XENDIT WEBHOOK RECEIVED === token_present:{}, status:{}, external_id:{}, id:{}",
                requestCallbackToken != null && !requestCallbackToken.isBlank(),
                request != null ? request.getStatus() : "null",
                request != null ? request.getExternalId() : "null",
                request != null ? request.getId() : "null");

        validateCallbackToken(requestCallbackToken);
        if (request == null || isBlank(request.getExternalId())) {
            logger.warn("=== XENDIT WEBHOOK REJECTED === request null or missing external_id");
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payload webhook Xendit tidak valid");
        }

        Optional<Booking> found = bookingRepository.findByXenditExternalId(request.getExternalId());
        if (found.isEmpty()) {
            logger.warn("=== XENDIT WEBHOOK: not found by external_id='{}', trying invoice_id='{}'",
                    request.getExternalId(), request.getId());
            if (!isBlank(request.getId())) {
                found = bookingRepository.findByXenditInvoiceId(request.getId());
            }
        }

        Booking booking = found.orElseThrow(() -> {
            logger.error("=== XENDIT WEBHOOK: booking NOT FOUND for external_id='{}' invoice_id='{}'",
                    request.getExternalId(), request.getId());
            return new ResponseStatusException(HttpStatus.NOT_FOUND, Message.BOOKING_NOT_FOUND);
        });

        String status = normalizeStatus(request.getStatus());
        booking.setPaymentStatus(status);
        if (!isBlank(request.getId())) {
            booking.setXenditInvoiceId(request.getId());
        }

        if (STATUS_PAID.equals(status) || STATUS_SETTLED.equals(status)) {
            booking.setPaidAt(parsePaidAt(request.getPaidAt()));
            if (booking.getStatus() == BookingStatus.PENDING) {
                booking.setStatus(BookingStatus.CONFIRMED);
            }
        } else if (STATUS_EXPIRED.equals(status) && booking.getStatus() == BookingStatus.PENDING) {
            booking.setStatus(BookingStatus.CANCELLED);
        }

        bookingRepository.save(booking);
        logger.info("=== XENDIT WEBHOOK DONE === booking #{} bookingStatus={} paymentStatus={}",
                booking.getIdBooking(), booking.getStatus(), booking.getPaymentStatus());

        // Kirim email notifikasi async setelah transaksi selesai
        if (STATUS_PAID.equals(status) || STATUS_SETTLED.equals(status)) {
            emailNotificationService.sendPaymentSuccessEmail(booking);
        }
    }

    private Booking getBookingForCustomer(int bookingId, int customerId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, Message.BOOKING_NOT_FOUND));
        if (booking.getCustomerId() != customerId) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, Message.BOOKING_ACCESS_DENIED);
        }
        return booking;
    }

    private void validatePayableBooking(Booking booking) {
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, Message.BOOKING_ALREADY_PROCESSED);
        }

        if (booking.getTotalPrice() == null || booking.getTotalPrice() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, Message.ROOM_TYPE_PRICE_INVALID);
        }

        if (booking.getPaymentDeadline() != null && LocalDateTime.now().isAfter(booking.getPaymentDeadline())) {
            booking.setStatus(BookingStatus.CANCELLED);
            booking.setPaymentStatus(STATUS_EXPIRED);
            bookingRepository.save(booking);
            throw new ResponseStatusException(HttpStatus.GONE, Message.BOOKING_PAYMENT_DEADLINE_PASSED);
        }
    }

    private int calculateExpiryDurationSeconds(Booking booking) {
        if (booking.getPaymentDeadline() == null) {
            return 24 * 60 * 60;
        }
        long seconds = Duration.between(LocalDateTime.now(), booking.getPaymentDeadline()).getSeconds();
        return (int) Math.max(60, Math.min(seconds, 24L * 60L * 60L));
    }

    private XenditInvoiceResponse mapToInvoiceResponse(Booking booking) {
        return XenditInvoiceResponse.builder()
                .bookingId(booking.getIdBooking())
                .externalId(booking.getXenditExternalId())
                .xenditInvoiceId(booking.getXenditInvoiceId())
                .invoiceUrl(booking.getXenditInvoiceUrl())
                .status(booking.getPaymentStatus())
                .amount(booking.getTotalPrice())
                .build();
    }

    private void ensureApiKeyConfigured() {
        if (isBlank(apiKey)) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "API key Xendit belum dikonfigurasi");
        }
    }

    private void validateCallbackToken(String requestCallbackToken) {
        if (isBlank(callbackToken)) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Callback token Xendit belum dikonfigurasi");
        }

        if (!callbackToken.equals(requestCallbackToken)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Callback token Xendit tidak valid");
        }
    }

    private String normalizeStatus(String status) {
        return isBlank(status) ? STATUS_PENDING : status.trim().toUpperCase(Locale.ROOT);
    }

    private LocalDateTime parsePaidAt(String value) {
        if (isBlank(value)) {
            return LocalDateTime.now();
        }
        try {
            return OffsetDateTime.parse(value).toLocalDateTime();
        } catch (RuntimeException ex) {
            return LocalDateTime.now();
        }
    }

    private String readString(Map<String, Object> source, String key, String fallback) {
        Object value = source.get(key);
        return value != null ? String.valueOf(value) : fallback;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
