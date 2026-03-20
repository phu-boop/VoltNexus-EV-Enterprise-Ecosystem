package com.ev.customer_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartSummaryResponse {

    private Long customerId;
    private List<CartItemResponse> items;
    private Integer totalItems;
    private BigDecimal totalAmount;
    private BigDecimal estimatedTax; // Optional: estimated tax (10% VAT)
    private BigDecimal estimatedTotal; // Total + Tax
}
