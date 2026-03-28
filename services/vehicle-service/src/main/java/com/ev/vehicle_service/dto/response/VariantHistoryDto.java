package com.ev.vehicle_service.dto.response;

import com.ev.common_lib.model.enums.EVMAction;
import com.ev.common_lib.model.enums.VehicleStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VariantHistoryDto {
    private Long id;
    private Long variantId;
    private EVMAction action;
    private LocalDateTime actionDate;
    private String changedBy;
    private String versionName;
    private String color;
    private BigDecimal price;
    private VehicleStatus status;
}
