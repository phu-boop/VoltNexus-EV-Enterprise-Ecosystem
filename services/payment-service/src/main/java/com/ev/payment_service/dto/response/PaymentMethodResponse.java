package com.ev.payment_service.dto.response;

import com.ev.payment_service.enums.PaymentMethodType;
import com.ev.payment_service.enums.PaymentScope;
import lombok.Data;
import java.util.UUID;

@Data
public class PaymentMethodResponse {
    private UUID methodId;
    private String methodName;
    private PaymentMethodType methodType;
    private PaymentScope scope;
    private boolean isActive;
    private String configJson;
}