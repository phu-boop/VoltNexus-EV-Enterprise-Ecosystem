package com.ev.vehicle_service.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
@Data
public class VariantFeatureId implements Serializable {
    @Column(name = "variant_id")
    private Long variantId;

    @Column(name = "feature_id")
    private Long featureId;

    // Hibernate cần constructor mặc định, equals và hashCode
    public VariantFeatureId() {}

    public VariantFeatureId(Long variantId, Long featureId) {
        this.variantId = variantId;
        this.featureId = featureId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        VariantFeatureId that = (VariantFeatureId) o;
        return Objects.equals(variantId, that.variantId) && Objects.equals(featureId, that.featureId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(variantId, featureId);
    }
}
