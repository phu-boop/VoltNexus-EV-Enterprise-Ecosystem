package com.ev.payment_service.service.Interface;

import com.ev.payment_service.entity.PaymentRecord;
import java.math.BigDecimal;
import java.util.UUID;

/**
 * Service interface cho việc quản lý PaymentRecord (công nợ).
 */
public interface IPaymentRecordService {

    /**
     * Tìm một PaymentRecord bằng OrderId.
     * Nếu không tìm thấy, một PaymentRecord mới sẽ được tạo ra.
     *
     * @param orderId ID của đơn hàng (Sales Order)
     * @param customerId ID của khách hàng
     * @param totalAmount Tổng giá trị của đơn hàng
     * @return PaymentRecord đã tồn tại hoặc vừa được tạo mới.
     */
    PaymentRecord findOrCreateRecord(UUID orderId, Long customerId, BigDecimal totalAmount);
}