package com.ev.inventory_service.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.UUID;

@Data
public class CreateTransferRequestDto {
    @NotNull
    private Long variantId;
    @NotNull @Min(1)
    private Integer quantity;
    @NotNull
    private UUID toDealerId;
    @NotBlank @Email
    private String requesterEmail;
    private String notes;
}
