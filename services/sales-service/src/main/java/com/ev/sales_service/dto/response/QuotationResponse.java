package com.ev.sales_service.dto.response;

import com.ev.sales_service.enums.QuotationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor   // ✅ BẮT BUỘC CÓ
@AllArgsConstructor
public class QuotationResponse {
    private UUID quotationId;
    private UUID dealerId;
    private Long customerId;
    private Long modelId;
    private Long variantId;
    private UUID staffId;
    private LocalDateTime quotationDate;
    private LocalDateTime validUntil;
    private BigDecimal basePrice;
    private BigDecimal discountAmount;
    private BigDecimal finalPrice;
    private String termsConditions;
    private QuotationStatus status;
    private List<PromotionResponse> appliedPromotions;
   // private CustomerInfoResponse customerInfo;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
