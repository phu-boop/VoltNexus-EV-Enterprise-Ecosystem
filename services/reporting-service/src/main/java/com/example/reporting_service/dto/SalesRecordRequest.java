package com.example.reporting_service.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesRecordRequest {

    @NotNull(message = "orderId là bắt buộc")
    private UUID orderId;

    /**
     * totalAmount: Tổng tiền đơn hàng, không được âm.
     * BVA: -0.01 (invalid), 0.00 (min valid), 0.01 (valid)
     */
    @DecimalMin(value = "0.00", message = "Tổng tiền không được âm")
    private BigDecimal totalAmount;

    private LocalDateTime orderDate;

    /**
     * dealerName: Tên đại lý, tối đa 200 ký tự.
     * BVA: 199 (valid), 200 (max valid), 201 (invalid)
     */
    @Size(max = 200, message = "Tên đại lý không được vượt quá 200 ký tự")
    private String dealerName;

    private Long variantId;

    /**
     * modelName: Tên mẫu xe, tối đa 200 ký tự.
     * BVA: 199 (valid), 200 (max valid), 201 (invalid)
     */
    @Size(max = 200, message = "Tên mẫu xe không được vượt quá 200 ký tự")
    private String modelName;

    /**
     * region: Khu vực, tối đa 100 ký tự.
     * BVA: 99 (valid), 100 (max valid), 101 (invalid)
     */
    @Size(max = 100, message = "Khu vực không được vượt quá 100 ký tự")
    private String region;
}
