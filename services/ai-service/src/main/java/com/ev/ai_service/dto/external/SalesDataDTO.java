package com.ev.ai_service.dto.external;

import lombok.Data;
import java.time.LocalDate;

@Data
public class SalesDataDTO {
    private String variantId;
    private int quantity;
    private LocalDate date;
}
