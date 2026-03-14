package com.ev.vehicle_service.model;

import com.ev.common_lib.model.enums.VehicleStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import org.hibernate.annotations.CreationTimestamp;
// import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "vehicle_variants")
@Getter
@Setter
public class VehicleVariant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "variant_id")
    private Long variantId;

    // Mối quan hệ ngược lại: Nhiều Variants thuộc về một Model
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "model_id", nullable = false)
    private VehicleModel vehicleModel;

    @Column(name = "version_name")
    private String versionName;

    private String color;

    @Column(name = "sku_code", unique = true) // Mã định danh sản phẩm
    private String skuCode;

    @Column(name = "battery_capacity")
    private Double batteryCapacity;

    @Column(name = "charging_time")
    private Float chargingTime;

    @Column(name = "range_km")
    private Integer rangeKm;

    @Column(name = "motor_power")
    private Integer motorPower;

    // Additional technical specifications
    @Column(name = "seating_capacity")
    private Integer seatingCapacity;

    @Column(name = "torque")
    private Integer torque; // Nm

    @Column(name = "acceleration")
    private Float acceleration; // 0-100km/h in seconds

    @Column(name = "top_speed")
    private Integer topSpeed; // km/h

    @Column(name = "dimensions")
    private String dimensions; // e.g. "4750 x 1934 x 1667"

    @Column(name = "weight")
    private Integer weight; // kg

    @Column(name = "warranty_years")
    private Integer warrantyYears;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    // Color images stored as JSON array
    // Format: [{"color":"Red","colorCode":"#FF0000","imageUrl":"http://...","isPrimary":true}, ...]
    @Column(name = "color_images", columnDefinition = "TEXT")
    private String colorImages;

    // Exterior images stored as JSON array of URLs
    // Format: ["http://example.com/image1.jpg", "http://example.com/image2.jpg"]
    @Column(name = "exterior_images", columnDefinition = "TEXT")
    private String exteriorImages;

    // Interior images stored as JSON array of URLs
    // Format: ["http://example.com/image1.jpg", "http://example.com/image2.jpg"]
    @Column(name = "interior_images", columnDefinition = "TEXT")
    private String interiorImages;

    private BigDecimal price;

    @Column(name = "wholesale_price")
    private BigDecimal wholesalePrice;

    @Enumerated(EnumType.STRING)
    private VehicleStatus status;

    // --- Audit Fields ---
    @Column(name = "created_by")
    private String createdBy;

    @CreationTimestamp
    @Column(name = "created_date", updatable = false)
    private LocalDateTime createdDate;

    @Column(name = "image_url")
    private String imageUrl;

    // ... updatedBy, updatedDate ...

    // --- Relationships (đã được di chuyển) ---
    @OneToMany(mappedBy = "vehicleVariant", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<PriceHistory> priceHistories = new HashSet<>();

    @OneToMany(mappedBy = "vehicleVariant", cascade = CascadeType.ALL, orphanRemoval = true)
    @org.hibernate.annotations.BatchSize(size = 20)
    private Set<VariantFeature> features = new HashSet<>();
}