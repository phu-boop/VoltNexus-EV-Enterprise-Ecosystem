package com.ev.sales_service.dto.request;

import com.ev.sales_service.enums.OrderStatusB2B;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ResolveDisputeRequest {

    @NotNull(message = "Trạng thái mới không được để trống")
    private OrderStatusB2B newStatus; // Chỉ cho phép 2 giá trị: IN_TRANSIT hoặc DELIVERED

    private String notes; // Ghi chú của Admin
}
