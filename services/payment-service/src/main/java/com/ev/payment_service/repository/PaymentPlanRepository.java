package com.ev.payment_service.repository;

import com.ev.payment_service.entity.PaymentPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface PaymentPlanRepository extends JpaRepository<PaymentPlan, UUID> {
    // Hiện tại chưa cần query tùy chỉnh, JpaRepository là đủ
}