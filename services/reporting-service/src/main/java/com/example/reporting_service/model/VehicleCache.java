package com.example.reporting_service.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity 
@Table(name = "cache_vehicle_info") 
@Data
public class VehicleCache {
    @Id 
    private Long variantId;
    private String variantName;
    private Long modelId;
    private String modelName;
}
