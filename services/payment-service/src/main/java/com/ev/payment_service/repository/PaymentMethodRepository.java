package com.ev.payment_service.repository;

import com.ev.payment_service.entity.PaymentMethod;
import com.ev.payment_service.enums.PaymentScope;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query; // << Chú ý import
import java.util.List;
import java.util.UUID;
import java.util.Optional;

public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, UUID> {

    // Lấy PTTT đang hoạt động theo scope
    List<PaymentMethod> findByIsActiveTrueAndScope(PaymentScope scope);

    // Lấy PTTT đang hoạt động cho B2C (ALL hoặc B2C)
    @Query("SELECT pm FROM PaymentMethod pm WHERE pm.isActive = true AND (pm.scope = 'ALL' OR pm.scope = 'B2C')")
    List<PaymentMethod> findActiveB2CMethods();

    // Lấy PTTT đang hoạt động cho B2B (ALL hoặc B2B)
    @Query("SELECT pm FROM PaymentMethod pm WHERE pm.isActive = true AND (pm.scope = 'ALL' OR pm.scope = 'B2B')")
    List<PaymentMethod> findActiveB2BMethods();

    Optional<PaymentMethod> findByMethodName(String methodName);
}