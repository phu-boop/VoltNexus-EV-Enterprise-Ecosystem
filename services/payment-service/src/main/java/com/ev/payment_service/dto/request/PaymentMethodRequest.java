package com.ev.payment_service.dto.request;

import com.ev.payment_service.enums.PaymentMethodType;
import com.ev.payment_service.enums.PaymentScope;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PaymentMethodRequest {

    @NotBlank(message = "METHOD_NAME_REQUIRED")
    private String methodName;

    @NotNull(message = "METHOD_TYPE_REQUIRED")
    private PaymentMethodType methodType;

    @NotNull(message = "SCOPE_REQUIRED")
    private PaymentScope scope;

    @NotNull(message = "IS_ACTIVE_REQUIRED")
    private boolean isActive;

    private String configJson; // Dạng chuỗi JSON
}