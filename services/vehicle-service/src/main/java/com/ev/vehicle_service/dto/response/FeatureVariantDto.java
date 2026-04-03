package com.ev.vehicle_service.dto.response;

import com.ev.common_lib.model.enums.VehicleStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeatureVariantDto {
    private Long variantId;
    private Long modelId;
    private String modelName;
    private String versionName;
    private BigDecimal price;
    private VehicleStatus status;
    private boolean isStandard;
    private BigDecimal additionalCost;
}
