package com.ev.vehicle_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateFeatureRequest {

    @NotBlank(message = "Feature name is required")
    private String featureName;

    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    private String featureType;
}
