package com.ev.sales_service.dto.outbound;

import com.ev.sales_service.enums.QuotationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateQuotationStatusDTO {

    @NotNull(message = "Status is required")
    private QuotationStatus status;

    // private String reason;
}