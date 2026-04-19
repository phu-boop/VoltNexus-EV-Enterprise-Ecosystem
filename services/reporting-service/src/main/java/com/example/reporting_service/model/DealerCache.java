package com.example.reporting_service.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.UUID;

@Entity 
@Table(name = "cache_dealer_info") 
@Data
public class DealerCache {
    @Id 
    private UUID dealerId; // Hoặc Long (phải khớp với ID của bạn)
    private String dealerName;
    private String region;
}
