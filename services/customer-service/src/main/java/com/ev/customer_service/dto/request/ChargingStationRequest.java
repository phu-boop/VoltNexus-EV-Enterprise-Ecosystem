package com.ev.customer_service.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * DTO for creating/updating charging stations
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChargingStationRequest {

    @NotBlank(message = "Station name is required")
    @Size(max = 200, message = "Station name must not exceed 200 characters")
    private String stationName;

    @NotBlank(message = "Address is required")
    @Size(max = 500, message = "Address must not exceed 500 characters")
    private String address;

    @Size(max = 100, message = "City must not exceed 100 characters")
    private String city;

    @Size(max = 100, message = "Province must not exceed 100 characters")
    private String province;

    @NotNull(message = "Latitude is required")
    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    private BigDecimal latitude;

    @NotNull(message = "Longitude is required")
    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    private BigDecimal longitude;

    @Min(value = 1, message = "Total chargers must be at least 1")
    private Integer totalChargers;

    @Min(value = 0, message = "Available chargers cannot be negative")
    private Integer availableChargers;

    @Size(max = 200, message = "Charger types must not exceed 200 characters")
    private String chargerTypes;

    @Min(value = 1, message = "Max power must be at least 1 kW")
    private Integer maxPowerKw;

    private String pricingInfo;

    private String status;

    @Size(max = 200, message = "Operating hours must not exceed 200 characters")
    private String operatingHours;

    @Size(max = 20, message = "Phone number must not exceed 20 characters")
    private String phoneNumber;

    private String description;

    @Size(max = 500, message = "Amenities must not exceed 500 characters")
    private String amenities;

    private Boolean isPublic;
}
