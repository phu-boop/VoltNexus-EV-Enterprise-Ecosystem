package com.ev.dealer_service.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DealerBasicDto {
    private UUID dealerId;
    private String dealerName;
}
