package com.ev.common_lib.dto.vehicle;

import com.ev.common_lib.model.enums.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class VariantDetailDto {
    private Long variantId;
    private String versionName;
    private String modelName;
    private String brand;
    private String color;
    private String skuCode;
    private BigDecimal price;
    private VehicleStatus status;
    private String imageUrl;
    private BigDecimal wholesalePrice;
    private Double batteryCapacity;
    private Float chargingTime;
    private Integer rangeKm;
    private Integer motorPower;
    private Long modelId;

    // Additional technical specifications
    private Integer seatingCapacity;
    private Integer torque; // Nm
    private Float acceleration; // 0-100km/h in seconds
    private Integer topSpeed; // km/h
    private String dimensions; // e.g. "4750 x 1934 x 1667"
    private Integer weight; // kg
    private Integer warrantyYears;
    private String description;
    
    // Color images stored as JSON string
    // Frontend will parse: [{"color":"Red","colorCode":"#FF0000","imageUrl":"...","isPrimary":true}]
    private String colorImages;

    // Exterior images stored as JSON array of URLs
    // Format: ["http://example.com/image1.jpg", "http://example.com/image2.jpg"]
    private String exteriorImages;

    // Interior images stored as JSON array of URLs
    // Format: ["http://example.com/image1.jpg", "http://example.com/image2.jpg"]
    private String interiorImages;

    private List<FeatureDto> features;
}
