package com.ev.sales_service.dto.outbound;

import com.ev.sales_service.enums.QuotationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateQuotationStatusDTO {

    @NotNull(message = "Status is required")
    private QuotationStatus status;

    // TODO: Có thể thêm 1 trường 'reason' nếu Manager REJECTED
    // private String reason;
}