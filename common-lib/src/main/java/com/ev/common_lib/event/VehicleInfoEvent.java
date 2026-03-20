package com.ev.common_lib.event;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data 
@Builder 
@NoArgsConstructor 
@AllArgsConstructor
public class VehicleInfoEvent {
    private Long variantId;
    private String variantName;
    private Long modelId;
    private String modelName;
}
