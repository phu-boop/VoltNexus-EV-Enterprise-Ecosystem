package com.ev.vehicle_service.dto.response;

import com.ev.common_lib.model.enums.VehicleStatus; // Giả sử bạn có import này
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class VariantCatalogDto {

    // ===== CÁC TRƯỜNG MÀ LOG CỦA BẠN ĐÃ CÓ =====
    private Long variantId;
    private String versionName;
    private String color;
    private String skuCode;
    private BigDecimal price;
    private VehicleStatus status; // (Cần import enum VehicleStatus)
    private String imageUrl;
    private BigDecimal wholesalePrice;
    private Integer batteryCapacity;
    private Float chargingTime;
    private Integer rangeKm;
    private Integer motorPower;

    // (Trường "features": [] có thể bạn không cần trả ra ở đây,
    //  nhưng nếu cần thì thêm: private List<FeatureDto> features;)

    // ===== TRƯỜNG QUAN TRỌNG ĐỂ SỬA LỖI =====
    private Long modelId;
}
