package com.example.reporting_service.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class VariantDetailDto {
    private Long variantId;
    private String versionName; 
    private Long modelId;
    private String modelName;
    private String skuCode;
    private String color;
}
