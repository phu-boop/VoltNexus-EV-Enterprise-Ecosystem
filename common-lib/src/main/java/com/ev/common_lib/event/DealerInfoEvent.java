package com.ev.common_lib.event;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.UUID;

@Data 
@Builder 
@NoArgsConstructor 
@AllArgsConstructor
public class DealerInfoEvent {
    private UUID dealerId; // Hoặc UUID (phải đồng nhất)
    private String dealerName;
    private String region;
}
