package com.ngninep.booking.service;

import com.ngninep.booking.dto.req.XenditInvoiceWebhookRequest;
import com.ngninep.booking.dto.res.XenditInvoiceResponse;

public interface XenditPaymentService {

    XenditInvoiceResponse createInvoice(int bookingId, int customerId);

    void handleInvoiceWebhook(String callbackToken, XenditInvoiceWebhookRequest request);
}
