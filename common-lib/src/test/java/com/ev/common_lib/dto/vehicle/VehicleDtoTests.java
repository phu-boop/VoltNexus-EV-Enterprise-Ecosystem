package com.ev.common_lib.dto.vehicle;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

class VehicleDtoTests {

    @Test
    void comparisonDto_Test() {
        ComparisonDto dto = new ComparisonDto();
        dto.setDetails(new VariantDetailDto());
        dto.setInventory(new com.ev.common_lib.dto.inventory.InventoryComparisonDto());
        
        assertNotNull(dto.getDetails());
        assertNotNull(dto.getInventory());
    }

    @Test
    void featureDto_Test() {
        FeatureDto dto = new FeatureDto();
        dto.setFeatureName("Sunroof");
        dto.setCategory("Interior");
        
        assertEquals("Sunroof", dto.getFeatureName());
        assertEquals("Interior", dto.getCategory());
    }

    @Test
    void variantDetailDto_Test() {
        VariantDetailDto dto = new VariantDetailDto();
        dto.setVariantId(1L);
        dto.setVersionName("Standard");
        dto.setPrice(BigDecimal.valueOf(50000));
        dto.setFeatures(Collections.emptyList());
        
        assertEquals(1L, dto.getVariantId());
        assertEquals("Standard", dto.getVersionName());
        assertEquals(BigDecimal.valueOf(50000), dto.getPrice());
        assertTrue(dto.getFeatures().isEmpty());
    }
}
