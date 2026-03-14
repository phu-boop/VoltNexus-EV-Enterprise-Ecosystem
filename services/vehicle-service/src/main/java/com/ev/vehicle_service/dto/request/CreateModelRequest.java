package com.ev.vehicle_service.dto.request;

import com.ev.common_lib.model.enums.VehicleStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class CreateModelRequest {

    @NotBlank(message = "Model name cannot be blank")
    private String modelName;

    @NotBlank(message = "Brand cannot be blank")
    private String brand;

    @NotNull(message = "Status is required")
    private VehicleStatus status;
    
    private String createdBy; // Email người tạo
    
    private String thumbnailUrl;

    private Integer baseRangeKm;
    private Integer baseMotorPower;
    private Integer baseBatteryCapacity;
    private Float baseChargingTime;

    //Map cho các trường mở rộng (sẽ được chuyển thành JSON)
    private Map<String, Object> extendedSpecs;

    @Valid
    private List<CreateVariantRequest> variants;
}
