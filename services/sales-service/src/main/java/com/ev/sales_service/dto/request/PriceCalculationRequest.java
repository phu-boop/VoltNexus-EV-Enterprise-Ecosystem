package com.ev.sales_service.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@Builder
public class PriceCalculationRequest {
    @NotNull
    private UUID quotationId;

    private List<UUID> promotionIds; // Danh sách khuyến mãi áp dụng
}