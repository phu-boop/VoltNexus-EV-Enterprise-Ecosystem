package com.ev.vehicle_service.dto.request;

import com.ev.common_lib.model.enums.VehicleStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class UpdateVariantRequest {

    @NotBlank(message = "Version name cannot be blank")
    private String versionName;

    @NotBlank(message = "Color cannot be blank")
    private String color;

    @NotNull(message = "Price is required")
    @Min(value = 0, message = "Price must be non-negative")
    private BigDecimal price;

    private String imageUrl;

    @NotNull(message = "Status is required")
    private VehicleStatus status;

    private Double batteryCapacity;
    private Float chargingTime;
    private Integer rangeKm;
    private Integer motorPower;

    // Additional technical specifications
    private Integer seatingCapacity;
    private Integer torque; // Nm
    private Float acceleration; // 0-100km/h in seconds
    private Integer topSpeed; // km/h
    private String dimensions; // e.g. "4750 x 1934 x 1667"
    private Integer weight; // kg
    private Integer warrantyYears;
    private String description;
    
    private String colorImages; // JSON string
    private String exteriorImages; // JSON array of exterior image URLs
    private String interiorImages; // JSON array of interior image URLs

    private BigDecimal wholesalePrice;

    private String reason;
}
