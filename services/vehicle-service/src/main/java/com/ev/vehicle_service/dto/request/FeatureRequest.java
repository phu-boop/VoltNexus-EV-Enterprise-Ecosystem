package com.ev.vehicle_service.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class FeatureRequest {
    @NotNull(message = "Feature ID is required")
    private Long featureId;

    private boolean isStandard = true;

    private BigDecimal additionalCost = BigDecimal.ZERO;
}
