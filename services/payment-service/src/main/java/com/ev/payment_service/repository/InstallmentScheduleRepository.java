package com.ev.payment_service.repository;

import com.ev.payment_service.entity.InstallmentSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface InstallmentScheduleRepository extends JpaRepository<InstallmentSchedule, UUID> {

    // Lấy tất cả lịch trình của một sổ thanh toán (PaymentRecord)
    List<InstallmentSchedule> findByPaymentRecord_RecordId(UUID recordId);
}