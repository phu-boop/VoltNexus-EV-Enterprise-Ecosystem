package com.ev.ai_service.client;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

/**
 * Client để gọi Sales Service API để lấy dữ liệu lịch sử bán hàng
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SalesServiceClient {

    private final WebClient.Builder webClientBuilder;

    @Value("${sales.service.url}")
    private String salesServiceUrl;

    /**
     * Lấy lịch sử bán hàng từ Sales Service để phân tích
     * 
     * @param variantId ID của variant (tùy chọn)
     * @param dealerId  ID của dealer (tùy chọn)
     * @param startDate Ngày bắt đầu (tùy chọn)
     * @param endDate   Ngày kết thúc (tùy chọn)
     * @param limit     Số lượng bản ghi tối đa
     * @return Danh sách lịch sử bán hàng
     */
    public List<SalesHistoryDto> getSalesHistory(Long variantId, UUID dealerId,
            LocalDate startDate, LocalDate endDate,
            Integer limit) {
        try {
            log.debug("Fetching sales history: variantId={}, dealerId={}, startDate={}, endDate={}, limit={}",
                    variantId, dealerId, startDate, endDate, limit);

            // Build query parameters
            StringBuilder uriBuilder = new StringBuilder(salesServiceUrl + "/api/sales/analytics/history?");

            if (variantId != null) {
                uriBuilder.append("variantId=").append(variantId).append("&");
            }
            if (dealerId != null) {
                uriBuilder.append("dealerId=").append(dealerId).append("&");
            }
            if (startDate != null) {
                uriBuilder.append("startDate=").append(startDate).append("&");
            }
            if (endDate != null) {
                uriBuilder.append("endDate=").append(endDate).append("&");
            }
            if (limit != null) {
                uriBuilder.append("limit=").append(limit).append("&");
            }

            String uri = uriBuilder.toString();
            // Remove trailing & or ?
            if (uri.endsWith("&")) {
                uri = uri.substring(0, uri.length() - 1);
            }

            log.debug("Calling Sales Service API: {}", uri);

            SalesHistoryResponse response = webClientBuilder
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
                                    log.error("401 Unauthorized when calling Sales Service. Check authentication.");
                                } else if (clientResponse.statusCode().value() == 404) {
                                    log.warn("Sales Service endpoint not found (404)");
                                }
                                return Mono.empty();
                            })
                    .bodyToMono(SalesHistoryResponse.class)
                    .timeout(Duration.ofSeconds(10))
                    .onErrorResume(WebClientResponseException.Unauthorized.class, e -> {
                        log.error("❌ 401 Unauthorized for Sales Service. Configure proper credentials.");
                        return Mono.just(new SalesHistoryResponse());
                    })
                    .onErrorResume(WebClientResponseException.NotFound.class, e -> {
                        log.warn("Sales Service endpoint not found (404)");
                        return Mono.just(new SalesHistoryResponse());
                    })
                    .onErrorResume(Exception.class, e -> {
                        log.error("Error calling Sales Service: {} - {}",
                                e.getClass().getSimpleName(), e.getMessage());
                        return Mono.just(new SalesHistoryResponse());
                    })
                    .block();

            if (response != null && response.getData() != null) {
                log.info("✅ Successfully fetched {} sales records from Sales Service", response.getData().size());
                return response.getData();
            }

            log.warn("Empty response from Sales Service");
            return Collections.emptyList();

        } catch (Exception e) {
            log.error("Unexpected error calling Sales Service: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    /**
     * Response wrapper từ Sales Service
     */
    @Data
    public static class SalesHistoryResponse {
        private String status;
        private String message;
        private List<SalesHistoryDto> data;
    }

    /**
     * DTO cho lịch sử bán hàng
     */
    @Data
    public static class SalesHistoryDto {
        private UUID orderId;
        private Long variantId;
        private UUID dealerId;
        private String region;
        private Integer quantity;
        private Double totalAmount;
        private Double unitPrice;
        private LocalDate orderDate;
        private String orderStatus;
        private String modelName;
        private String variantName;
    }
}
