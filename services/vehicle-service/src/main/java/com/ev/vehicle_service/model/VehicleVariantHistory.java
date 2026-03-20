package com.ev.vehicle_service.model;

import com.ev.common_lib.model.enums.VehicleStatus;
import com.ev.common_lib.model.enums.EVMAction;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "vehicle_variant_history")
@Data
public class VehicleVariantHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "variant_id", nullable = false)
    private Long variantId;

    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false)
    private EVMAction action;

    @Column(name = "action_date")
    private LocalDateTime actionDate;

    @Column(name = "changed_by")
    private String changedBy;

    private String versionName;
    private String color;
    private BigDecimal price;
    private VehicleStatus status;
}
