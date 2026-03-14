package com.ev.sales_service.dto.response;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerResponseRequest {
    @NotNull(message = "ACCEPTED_FIELD_REQUIRED")
    private Boolean accepted;

    private String customerNote; // Lý do từ chối hoặc ghi chú
}