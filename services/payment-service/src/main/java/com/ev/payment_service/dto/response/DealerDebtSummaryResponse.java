package com.ev.payment_service.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class DealerDebtSummaryResponse {
    private UUID dealerId;
    private BigDecimal totalOwed;
    private BigDecimal totalPaid;
    private BigDecimal currentBalance;
    private LocalDateTime lastUpdated;
}





