package com.ev.vehicle_service.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Entity

@Table(name = "variant_features") 
@Getter
@Setter
public class VariantFeature {
    @EmbeddedId
    private VariantFeatureId id;

    
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("variantId") 
    @JoinColumn(name = "variant_id") 
    private VehicleVariant vehicleVariant; 

    
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("featureId") 
    @JoinColumn(name = "feature_id")
    private VehicleFeature vehicleFeature;

    @Column(name = "is_standard")
    private boolean isStandard;

    @Column(name = "additional_cost")
    private BigDecimal additionalCost;
}