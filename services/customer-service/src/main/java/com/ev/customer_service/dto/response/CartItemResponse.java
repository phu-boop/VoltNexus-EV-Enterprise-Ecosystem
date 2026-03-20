package com.ev.customer_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemResponse {

    private Long cartItemId;
    private Long customerId;
    private Long variantId;
    private Integer quantity;
    
    // Vehicle information
    private String vehicleName;
    private String vehicleColor;
    private String vehicleImageUrl;
    
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    
    private String selectedFeatures;
    private String notes;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
