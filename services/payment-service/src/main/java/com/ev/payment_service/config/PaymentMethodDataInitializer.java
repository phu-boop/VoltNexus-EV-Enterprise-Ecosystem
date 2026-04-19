package com.ev.payment_service.config;

import com.ev.payment_service.entity.PaymentMethod;
import com.ev.payment_service.repository.PaymentMethodRepository;
import com.ev.payment_service.enums.PaymentScope;
import com.ev.payment_service.enums.PaymentMethodType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Khởi tạo dữ liệu PaymentMethod khi ứng dụng start
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentMethodDataInitializer implements CommandLineRunner {

    private final PaymentMethodRepository paymentMethodRepository;

    @Override
    public void run(String... args) throws Exception {
        initializeVNPayMethod();
    }

    private void initializeVNPayMethod() {
        // Kiểm tra xem VNPAY đã tồn tại chưa
        if (paymentMethodRepository.findByMethodName("VNPAY").isEmpty()) {
            log.info("VNPAY payment method not found. Creating...");
            
            PaymentMethod vnpayMethod = PaymentMethod.builder()
                    .methodName("VNPAY")
                    .methodType(PaymentMethodType.GATEWAY)
                    .scope(PaymentScope.ALL)
                    .isActive(true)
                    .build();
            
            paymentMethodRepository.save(vnpayMethod);
            log.info("VNPAY payment method created successfully with ID: {}", vnpayMethod.getMethodId());
        } else {
            log.info("VNPAY payment method already exists. Skipping initialization.");
        }
    }
}
