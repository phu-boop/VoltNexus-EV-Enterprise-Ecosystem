package com.ev.payment_service.entity;

import com.ev.payment_service.enums.PaymentMethodType;
import com.ev.payment_service.enums.PaymentScope;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "payment_methods")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentMethod {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "method_id", columnDefinition = "BINARY(16)")
    private UUID methodId;

    @Column(name = "method_name", length = 100, nullable = false)
    private String methodName; // VNPAY, BANK_TRANSFER, CASH...

    @Enumerated(EnumType.STRING)
    @Column(name = "method_type", length = 50, nullable = false)
    private PaymentMethodType methodType;

    @Enumerated(EnumType.STRING)
    @Column(name = "scope", length = 50, nullable = false)
    private PaymentScope scope;

    @Column(name = "is_active", nullable = false)
    @Builder.Default // Giá trị default khi dùng Builder
    private boolean isActive = true;

    @Column(name = "config_json", columnDefinition = "JSON")
    private String configJson; // Lưu keys, endpoints, QR code info...
}