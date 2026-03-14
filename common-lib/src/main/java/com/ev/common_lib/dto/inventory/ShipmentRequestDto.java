package com.ev.common_lib.dto.inventory;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class ShipmentRequestDto {
    
    @NotNull
    private UUID orderId;
    
    @NotNull
    private UUID dealerId; // Đại lý nhận
    
    @NotEmpty
    private List<ShipmentItem> items;

    @Data
    public static class ShipmentItem {
        @NotNull
        private Long variantId;
        
        @NotEmpty
        private List<String> vins; // Danh sách các số VIN cụ thể được giao

        private Long modelId; 
        private String modelName;
        private String variantName;
    }
}
