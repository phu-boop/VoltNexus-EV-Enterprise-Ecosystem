package com.ev.dealer_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DealerResponse {

    private UUID dealerId;
    private String dealerCode;
    private String dealerName;
    private String address;
    private String city;
    private String region;
    private String phone;
    private String email;
    private String taxNumber;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
