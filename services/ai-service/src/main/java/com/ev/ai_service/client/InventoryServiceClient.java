package com.ev.ai_service.client;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

/**
 * Client để gọi Inventory Service API để lấy dữ liệu snapshot tồn kho
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryServiceClient {

    private final WebClient.Builder webClientBuilder;

    @Value("${inventory.service.url}")
    private String inventoryServiceUrl;

    /**
     * Lấy inventory snapshots từ Inventory Service để phân tích
     * 
     * @param variantId ID của variant (tùy chọn)
     * @param dealerId  ID của dealer (tùy chọn)
     * @param limit     Số lượng bản ghi tối đa
     * @return Danh sách inventory snapshots
     */
    public List<InventorySnapshotDto> getInventorySnapshots(Long variantId, UUID dealerId, Integer limit) {
        try {
            log.debug("Fetching inventory snapshots: variantId={}, dealerId={}, limit={}",
                    variantId, dealerId, limit);

            // Build query parameters
            StringBuilder uriBuilder = new StringBuilder(inventoryServiceUrl + "/analytics/snapshots?");

            if (variantId != null) {
                uriBuilder.append("variantId=").append(variantId).append("&");
            }
            if (dealerId != null) {
                uriBuilder.append("dealerId=").append(dealerId).append("&");
            }
            if (limit != null) {
                uriBuilder.append("limit=").append(limit).append("&");
            }

            String uri = uriBuilder.toString();
            // Remove trailing & or ?
            if (uri.endsWith("&")) {
                uri = uri.substring(0, uri.length() - 1);
            }

            log.debug("Calling Inventory Service API: {}", uri);

            InventorySnapshotResponse response = webClientBuilder
                    .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                    .defaultHeader(HttpHeaders.ACCEPT_CHARSET, StandardCharsets.UTF_8.name())
                    .build()
                    .get()
                    .uri(uri)
                    .acceptCharset(StandardCharsets.UTF_8)
                    .retrieve()
                    .onStatus(
                            status -> status.is4xxClientError(),
                            clientResponse -> {
                                if (clientResponse.statusCode().value() == 401) {
                                    log.error("401 Unauthorized when calling Inventory Service. Check authentication.");
                                } else if (clientResponse.statusCode().value() == 404) {
                                    log.warn("Inventory Service endpoint not found (404)");
                                }
                                return Mono.empty();
                            })
                    .bodyToMono(InventorySnapshotResponse.class)
                    .timeout(Duration.ofSeconds(10))
                    .onErrorResume(WebClientResponseException.Unauthorized.class, e -> {
                        log.error("❌ 401 Unauthorized for Inventory Service. Configure proper credentials.");
                        return Mono.just(new InventorySnapshotResponse());
                    })
                    .onErrorResume(WebClientResponseException.NotFound.class, e -> {
                        log.warn("Inventory Service endpoint not found (404)");
                        return Mono.just(new InventorySnapshotResponse());
                    })
                    .onErrorResume(Exception.class, e -> {
                        log.error("Error calling Inventory Service: {} - {}",
                                e.getClass().getSimpleName(), e.getMessage());
                        return Mono.just(new InventorySnapshotResponse());
                    })
                    .block();

            if (response != null && response.getData() != null) {
                log.info("✅ Successfully fetched {} inventory snapshots from Inventory Service",
                        response.getData().size());
                return response.getData();
            }

            log.warn("Empty response from Inventory Service");
            return Collections.emptyList();

        } catch (Exception e) {
            log.error("Unexpected error calling Inventory Service: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    /**
     * Response wrapper từ Inventory Service
     */
    @Data
    public static class InventorySnapshotResponse {
        private String status;
        private String message;
        private List<InventorySnapshotDto> data;
    }

    /**
     * DTO cho inventory snapshot
     */
    @Data
    public static class InventorySnapshotDto {
        private Long variantId;
        private String modelName;
        private String versionName;
        private String color;
        private String skuCode;
        private Integer availableQuantity;
        private Integer allocatedQuantity;
        private Integer reorderLevel;
        private String status;
    }
}
