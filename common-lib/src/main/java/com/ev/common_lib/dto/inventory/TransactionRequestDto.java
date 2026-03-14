package com.ev.common_lib.dto.inventory;

import com.ev.common_lib.model.enums.TransactionType; 
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.UUID;

@Data
public class TransactionRequestDto {

    @NotNull
    private TransactionType transactionType;

    @NotNull
    private Long variantId;

    @NotNull
    @Min(1)
    private Integer quantity; // Số lượng xe cần chuyển

    private UUID fromDealerId; // Cần thiết cho các giao dịch điều chuyển
    private UUID toDealerId;   // Cần thiết cho các giao dịch điều chuyển

    private String notes;
    private String staffId;
    private String referenceId; // Id của phiếu xuất/ nhập kho
}