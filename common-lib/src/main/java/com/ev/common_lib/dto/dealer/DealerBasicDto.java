package com.ev.common_lib.dto.dealer;

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
    private String region;
}
