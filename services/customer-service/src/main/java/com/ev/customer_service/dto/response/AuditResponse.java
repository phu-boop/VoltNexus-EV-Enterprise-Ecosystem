package com.ev.customer_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditResponse {
    
    private Long auditId;
    private Long customerId;
    private String changedBy;
    private String changesJson;
    private LocalDateTime changedAt;
}
