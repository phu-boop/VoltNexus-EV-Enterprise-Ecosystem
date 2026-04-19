package com.ev.vehicle_service.dto.request;

import com.ev.common_lib.model.enums.VehicleStatus;
// import com.ev.common_lib.model.enums.EVMAction;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import jakarta.validation.Valid;

@Data
public class CreateVariantRequest {

    @NotBlank(message = "Version name cannot be blank")
    private String versionName;

    @NotBlank(message = "Color cannot be blank")
    private String color;

    @NotBlank(message = "SKU code cannot be blank")
    private String skuCode;

    @NotNull(message = "Price is required")
    @Min(value = 0, message = "Price must be non-negative")
    private BigDecimal price;

    @Min(value = 0, message = "Wholesale price must be non-negative")
    private BigDecimal wholesalePrice;

    @NotNull(message = "Status is required")
    private VehicleStatus status; // Cập nhật trạng thái của Vehicle

    private String imageUrl;

    private Double batteryCapacity;
    private Float chargingTime;
    private Integer rangeKm; // Keeping Integer based on DTO review
    private Integer motorPower;

    // Additional technical specifications
    private Integer seatingCapacity;
    private Integer torque;
    private Float acceleration;
    private Integer topSpeed;
    private String dimensions;
    private Integer weight;
    private Integer warrantyYears;
    private String description;
    private String colorImages; // JSON string for color images
    private String exteriorImages; // JSON array of exterior image URLs
    private String interiorImages; // JSON array of interior image URLs

    @Valid
    private List<FeatureRequest> features;
}
