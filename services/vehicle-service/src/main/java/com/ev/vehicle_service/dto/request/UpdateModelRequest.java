package com.ev.vehicle_service.dto.request;

import com.ev.common_lib.model.enums.VehicleStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.Map;

@Data
public class UpdateModelRequest {

    @NotBlank(message = "Model name cannot be blank")
    private String modelName;

    @NotBlank(message = "Brand cannot be blank")
    private String brand;

    @NotNull(message = "Status is required")
    private VehicleStatus status;

    private String thumbnailUrl;

    private Integer baseRangeKm;
    private Integer baseMotorPower;
    private Integer baseBatteryCapacity;
    private Float baseChargingTime;

    private Map<String, Object> extendedSpecs;
}
