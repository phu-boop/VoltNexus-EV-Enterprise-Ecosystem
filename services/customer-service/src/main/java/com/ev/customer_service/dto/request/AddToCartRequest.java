package com.ev.customer_service.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddToCartRequest {

    @NotNull(message = "Variant ID is required")
    private Long variantId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    // Optional: Vehicle information (will be fetched from vehicle-service if not provided)
    private String vehicleName;
    private String vehicleColor;
    private String vehicleImageUrl;
    
    @Positive(message = "Unit price must be positive")
    private BigDecimal unitPrice;

    // Optional: selected features/accessories (JSON string or comma-separated IDs)
    private String selectedFeatures;

    private String notes;
}
