package com.ev.vehicle_service.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "vehicle_features")
@Data
public class VehicleFeature {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "feature_id")
    private Long featureId;

    @Column(name = "feature_name", nullable = false)
    private String featureName;

    private String description;
    
    private String category;
    
    @Column(name = "feature_type")
    private String featureType;
}
