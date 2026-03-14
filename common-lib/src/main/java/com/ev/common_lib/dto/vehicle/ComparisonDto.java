package com.ev.common_lib.dto.vehicle;

import com.ev.common_lib.dto.inventory.InventoryComparisonDto;
import lombok.Getter;
import lombok.Setter;

// DTO gộp cuối cùng (do Vehicle-Service trả về cho Frontend)
@Getter
@Setter
public class ComparisonDto {
    private VariantDetailDto details; // Thông tin chi tiết xe (đã có)
    private InventoryComparisonDto inventory; // Thông tin tồn kho (từ file trên)

    // Constructor để gộp dữ liệu
    public ComparisonDto(VariantDetailDto details, InventoryComparisonDto inventory) {
        this.details = details;
        this.inventory = inventory;
    }
    
    public ComparisonDto() {
    }
}
