package com.example.reporting_service.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class DealerResponse {
    private UUID dealerId;
    private String dealerName;
    private String city;
    private String address;
    private String phone;
    private String status;
}
