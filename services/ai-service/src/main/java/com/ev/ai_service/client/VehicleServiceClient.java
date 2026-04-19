package com.ev.ai_service.client;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;


import com.ev.common_lib.dto.vehicle.FeatureDto;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;



import java.util.Collections;
import java.util.List;

/**
 * Client để gọi Vehicle Service API
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class VehicleServiceClient {

    private final WebClient.Builder webClientBuilder;

    @Value("${vehicle.service.url}")
    private String vehicleServiceUrl;

    public VehicleVariantInfo getVariantInfo(Long variantId) {
        if (variantId == null || variantId <= 0) {
            return null;
        }
        try {
            return webClientBuilder.build().get()
                    .uri(vehicleServiceUrl + "/vehicle-catalog/variants/" + variantId)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<ApiRespond<VehicleVariantInfo>>() {})
                    .map(ApiRespond::getData)
                    .block();
        } catch (Exception e) {
            log.error("Error fetching variant {}: {}", variantId, e.getMessage());
            return null;
        }
    }

    public List<VehicleVariantInfo> getAllVariants() {
        try {
            log.info("Fetching all variants from: {}/vehicle-catalog/variants/all-for-backfill", vehicleServiceUrl);
            ApiRespond<List<VehicleVariantInfo>> response = webClientBuilder.build()
                    .get()
                    .uri(vehicleServiceUrl + "/vehicle-catalog/variants/all-for-backfill") // Correct Endpoint
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<ApiRespond<List<VehicleVariantInfo>>>() {})
                    .block();

            return response != null && response.getData() != null ? response.getData() : Collections.emptyList();
        } catch (Exception e) {
            log.error("Error fetching all variants: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    @Data
    public static class ApiRespond<T> {
        private String status; // Assuming "SUCCESS" or "ERROR"
        private String message;
        private T data;
    }

    @Data
    public static class VehicleVariantInfo {
        private Long variantId; // Mapped from VariantDetailDto.variantId
        private String versionName; // Mapped from VariantDetailDto.versionName
        private String modelName;
        private String color;
        private Integer year; // May not be in VariantDetailDto, check mapping if null
        private Double price;
        // New fields for RAG
        private Integer rangeKm;
        private Integer batteryCapacity;
        private String description;
        private List<FeatureDto> features;
        private String specifications; // Placeholder if needed

        // Adapter method if needed, but Jackson should handle if names match
        public String getDisplayName() {
            return modelName + " " + versionName;
        }

        // Compatibility method for existing code using getVariantName
        public String getVariantName() {
            return versionName;
        }

        // Compatibility method for existing code using getId
        public Long getId() {
            return variantId;
        }
    }
}
