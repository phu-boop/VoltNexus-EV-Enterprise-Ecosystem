package com.ev.common_lib.dto.inventory;

import lombok.Data;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

@Data
public class AllocationRequestDto {
    private List<AllocationItem> items;
    private UUID orderId;

    @Data
    public static class AllocationItem {
        @NotNull
        private Long variantId;
        @Min(1)
        private Integer quantity;
    }
}