package com.ev.vehicle_service.dto.response;

import com.ev.common_lib.model.enums.VehicleStatus;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ModelSummaryDto {
    private Long modelId;
    private String modelName;
    private String brand;
    private VehicleStatus status;
    private String thumbnailUrl;
    private Integer baseRangeKm;
    private Integer baseBatteryCapacity;
    private Float baseChargingTime;
    private Integer baseMotorPower;
    // Giá thấp nhất từ các variants
    private BigDecimal basePrice;
}
