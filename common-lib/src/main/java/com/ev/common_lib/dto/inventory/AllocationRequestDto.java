package com.ev.common_lib.dto.inventory;

import lombok.Data;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

@Data
public class AllocationRequestDto {
    @NotEmpty(message = "MISSING_REQUIRED_FIELD")
    @Valid
    private List<AllocationItem> items;

    @NotNull(message = "MISSING_REQUIRED_FIELD")
    private UUID orderId;

    @Data
    public static class AllocationItem {
        @NotNull
        private Long variantId;
        @Min(1)
        private Integer quantity;
    }
}