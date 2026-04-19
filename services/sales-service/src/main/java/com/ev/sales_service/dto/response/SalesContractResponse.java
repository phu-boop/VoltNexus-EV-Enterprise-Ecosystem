package com.ev.sales_service.dto.response;

import com.ev.sales_service.enums.ContractStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class SalesContractResponse {
    private UUID contractId;
    private UUID orderId;
    private LocalDateTime contractDate;
    private String contractTerms;
    private LocalDateTime signingDate;
    private ContractStatus contractStatus;
    private String digitalSignature;
    private String contractFileUrl;
}
