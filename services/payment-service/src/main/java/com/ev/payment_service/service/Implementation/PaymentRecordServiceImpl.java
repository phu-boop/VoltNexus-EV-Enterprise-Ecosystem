package com.ev.payment_service.service.Implementation;

import com.ev.payment_service.entity.PaymentRecord;
import com.ev.payment_service.repository.PaymentRecordRepository;
import com.ev.payment_service.service.Interface.IPaymentRecordService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * Triển khai service cho việc quản lý PaymentRecord (công nợ).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentRecordServiceImpl implements IPaymentRecordService {

    private final PaymentRecordRepository paymentRecordRepository;

    /**
     * Tìm một PaymentRecord bằng OrderId.
     * Nếu không tìm thấy, một PaymentRecord mới sẽ được tạo ra.
     * Đảm bảo tính nhất quán (transactional).
     */
    @Override
    @Transactional
    public PaymentRecord findOrCreateRecord(UUID orderId, Long customerId, BigDecimal totalAmount) {

        // 1. Thử tìm bằng OrderId
        Optional<PaymentRecord> existingRecord = paymentRecordRepository.findByOrderId(orderId);

        if (existingRecord.isPresent()) {
            log.info("PaymentRecord already exists for OrderId: {}. Returning existing.", orderId);
            return existingRecord.get();
        }

        // 2. Nếu không có, tạo mới
        log.info("Creating new PaymentRecord for OrderId: {}", orderId);
        PaymentRecord newRecord = new PaymentRecord();
        newRecord.setOrderId(orderId);
        newRecord.setCustomerId(customerId);
        newRecord.setTotalAmount(totalAmount);
        newRecord.setAmountPaid(BigDecimal.ZERO); // Ban đầu chưa trả
        newRecord.setRemainingAmount(totalAmount); // Nợ toàn bộ
        newRecord.setStatus("PENDING"); // Trạng thái công nợ
        newRecord.setCreatedAt(LocalDateTime.now());
        newRecord.setUpdatedAt(LocalDateTime.now());

        // Lưu và trả về bản ghi mới
        return paymentRecordRepository.save(newRecord);
    }
}