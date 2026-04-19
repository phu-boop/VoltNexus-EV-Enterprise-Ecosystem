package com.ev.vehicle_service.dto.response;

import com.ev.common_lib.dto.vehicle.VariantDetailDto;
import com.ev.common_lib.model.enums.VehicleStatus;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class ModelDetailDto {
    private Long modelId;
    private String modelName;
    private String brand;
    private VehicleStatus status;
    private String thumbnailUrl;
    private Integer baseRangeKm;
    private Integer baseMotorPower;
    private Integer baseBatteryCapacity;
    private Float baseChargingTime;
    private Map<String, Object> extendedSpecs;
    private List<VariantDetailDto> variants;
}
