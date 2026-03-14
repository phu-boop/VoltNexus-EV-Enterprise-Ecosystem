package com.ev.customer_service.dto.response;

import com.ev.customer_service.entity.ChargingStation;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for charging station responses
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChargingStationResponse {

    private Long stationId;
    private String stationName;
    private String address;
    private String city;
    private String province;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Integer totalChargers;
    private Integer availableChargers;
    private String chargerTypes;
    private Integer maxPowerKw;
    private String pricingInfo;
    private String status;
    private String operatingHours;
    private String phoneNumber;
    private String description;
    private String amenities;
    private Boolean isPublic;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Distance from search location (optional, calculated)
    private Double distanceKm;

    /**
     * Convert entity to response DTO
     */
    public static ChargingStationResponse fromEntity(ChargingStation station) {
        ChargingStationResponse response = new ChargingStationResponse();
        response.setStationId(station.getStationId());
        response.setStationName(station.getStationName());
        response.setAddress(station.getAddress());
        response.setCity(station.getCity());
        response.setProvince(station.getProvince());
        response.setLatitude(station.getLatitude());
        response.setLongitude(station.getLongitude());
        response.setTotalChargers(station.getTotalChargers());
        response.setAvailableChargers(station.getAvailableChargers());
        response.setChargerTypes(station.getChargerTypes());
        response.setMaxPowerKw(station.getMaxPowerKw());
        response.setPricingInfo(station.getPricingInfo());
        response.setStatus(station.getStatus().name());
        response.setOperatingHours(station.getOperatingHours());
        response.setPhoneNumber(station.getPhoneNumber());
        response.setDescription(station.getDescription());
        response.setAmenities(station.getAmenities());
        response.setIsPublic(station.getIsPublic());
        response.setCreatedAt(station.getCreatedAt());
        response.setUpdatedAt(station.getUpdatedAt());
        return response;
    }
}
