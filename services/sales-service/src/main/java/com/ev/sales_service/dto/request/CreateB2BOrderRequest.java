package com.ev.sales_service.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;    
import lombok.AllArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
public class CreateB2BOrderRequest {

    private UUID dealerId;

    @Valid
    @NotEmpty(message = "Đơn hàng phải có ít nhất một sản phẩm")
    private List<Item> items;

    private String notes;

    @Data
    @NoArgsConstructor    
    @AllArgsConstructor
    public static class Item {
        
        @NotNull(message = "variantId là bắt buộc")
        private Long variantId; 

        @NotNull
        @Min(value = 1, message = "Số lượng phải lớn hơn 0")
        private Integer quantity;
    }
}
