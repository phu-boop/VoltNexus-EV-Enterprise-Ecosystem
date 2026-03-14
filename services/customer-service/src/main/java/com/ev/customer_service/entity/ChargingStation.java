package com.ev.customer_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ChargingStation Entity
 * Represents an EV charging station location
 */
@Entity
@Table(name = "charging_stations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChargingStation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "station_id")
    private Long stationId;

    @Column(name = "station_name", nullable = false, length = 200)
    private String stationName;

    @Column(name = "address", nullable = false, length = 500)
    private String address;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "province", length = 100)
    private String province;

    @Column(name = "latitude", nullable = false, precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(name = "longitude", nullable = false, precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(name = "total_chargers")
    private Integer totalChargers;

    @Column(name = "available_chargers")
    private Integer availableChargers;

    @Column(name = "charger_types", length = 200)
    private String chargerTypes; // e.g., "CCS, CHAdeMO, Type 2"

    @Column(name = "max_power_kw")
    private Integer maxPowerKw; // Maximum charging power in kW

    @Column(name = "pricing_info", columnDefinition = "TEXT")
    private String pricingInfo; // Pricing information text

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private StationStatus status = StationStatus.ACTIVE;

    @Column(name = "operating_hours", length = 200)
    private String operatingHours; // e.g., "24/7" or "06:00-22:00"

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "amenities", length = 500)
    private String amenities; // e.g., "WiFi, Restroom, Coffee Shop"

    @Column(name = "is_public")
    private Boolean isPublic = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum StationStatus {
        ACTIVE,
        INACTIVE,
        MAINTENANCE,
        COMING_SOON
    }
}
