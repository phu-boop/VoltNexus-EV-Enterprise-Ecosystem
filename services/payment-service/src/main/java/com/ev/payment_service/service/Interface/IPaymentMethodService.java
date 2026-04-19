package com.ev.payment_service.service.Interface;

import com.ev.payment_service.dto.request.PaymentMethodRequest;
import com.ev.payment_service.dto.response.PaymentMethodResponse;
import java.util.List;
import java.util.UUID;

public interface IPaymentMethodService {

    /**
     * (ADMIN) Tạo một PTTT mới
     */
    PaymentMethodResponse createPaymentMethod(PaymentMethodRequest request);

    /**
     * (ADMIN) Cập nhật một PTTT
     */
    PaymentMethodResponse updatePaymentMethod(UUID methodId, PaymentMethodRequest request);

    /**
     * (ADMIN) Lấy tất cả PTTT (kể cả active/inactive)
     */
    List<PaymentMethodResponse> getAllPaymentMethods();

    /**
     * (PUBLIC - B2C) Lấy các PTTT đang hoạt động cho luồng B2C
     */
    List<PaymentMethodResponse> getActivePublicMethods();

    /**
     * (Internal) Lấy PTTT theo ID
     */
    PaymentMethodResponse getPaymentMethodById(UUID methodId);

    /**
     * (DEALER_MANAGER) Lấy các PTTT đang hoạt động cho luồng B2B (scope B2B hoặc ALL)
     */
    List<PaymentMethodResponse> getActiveB2BMethods();
}