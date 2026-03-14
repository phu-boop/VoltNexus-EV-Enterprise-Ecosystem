package com.ev.vehicle_service.model;

import org.hibernate.annotations.UpdateTimestamp;
import com.ev.common_lib.model.enums.VehicleStatus;

import jakarta.persistence.*;
// import lombok.Data;
import lombok.Getter;
import lombok.Setter;
// import lombok.EqualsAndHashCode;
// import lombok.ToString;

import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "vehicle_models")
@Getter 
@Setter 
// @EqualsAndHashCode(exclude = {"features", "priceHistories"}) // Thêm và loại trừ để tránh vòng lặp
// @ToString(exclude = {"features", "priceHistories"}) // Thêm và loại trừ để tránh vòng lặp
public class VehicleModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "model_id")
    private Long modelId;

    @Column(name = "model_name", nullable = false)
    private String modelName;

    private String brand;

    @Column(name = "created_by")
    // private Long createdBy; // Giả sử là ID của User 
    private String createdBy; // Email của user (tạm thời)

    @CreationTimestamp
    @Column(name = "created_date", updatable = false)
    private LocalDateTime createdDate;

    @Column(name = "updated_by")
    private String updatedBy; // Để lưu email người cập nhật/xóa

    @UpdateTimestamp
    @Column(name = "updated_date")
    private LocalDateTime updatedDate; // Tự động cập nhật thời gian

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VehicleStatus status;

    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    // Đây là các thông số cơ bản của mẫu xe, làm giá trị mặc định
    @Column(name = "base_range_km")
    private Integer baseRangeKm;

    @Column(name = "base_motor_power")
    private Integer baseMotorPower;

    @Column(name = "base_battery_capacity")
    private Integer baseBatteryCapacity;
    
    @Column(name = "base_charging_time")
    private Float baseChargingTime;

    // --- THÔNG SỐ MỞ RỘNG (EXTENDED SPECS) ---
    // Dùng cho các thông số phụ hoặc sẽ phát sinh trong tương lai
    @Column(name = "extended_specs_json", columnDefinition = "json")
    private String extendedSpecsJson;

    // --- Relationships ---
    // <<< Mối quan hệ mới: Một Model có nhiều Variants >>>
    @OneToMany(mappedBy = "vehicleModel", cascade = CascadeType.ALL, orphanRemoval = true)
    @org.hibernate.annotations.BatchSize(size = 20)
    private Set<VehicleVariant> variants = new HashSet<>();

}
