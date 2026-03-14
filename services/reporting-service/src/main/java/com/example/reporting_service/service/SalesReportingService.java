package com.example.reporting_service.service;

import com.example.reporting_service.dto.ApiRespond;
import com.example.reporting_service.dto.DealerInventoryDto;
import com.example.reporting_service.dto.SaleEventDTO;
import com.example.reporting_service.dto.VariantDetailDto;
import com.example.reporting_service.dto.DealerResponse;
import com.example.reporting_service.model.DealerCache;
import com.example.reporting_service.model.DealerStockSnapshot;
import com.example.reporting_service.model.SalesRecord;
import com.example.reporting_service.model.VehicleCache;
import com.example.reporting_service.repository.DealerCacheRepository;
import com.example.reporting_service.repository.DealerStockSnapshotRepository;
import com.example.reporting_service.repository.SalesRecordRepository;
import com.example.reporting_service.repository.VehicleCacheRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.sql.Timestamp;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;
import java.util.UUID;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
public class SalesReportingService {

    private final SalesRecordRepository salesRecordRepository;
    private final RestTemplate restTemplate;
    private final GeminiForecastingService geminiForecastingService;
    private final DealerCacheRepository dealerCacheRepository;
    private final VehicleCacheRepository vehicleCacheRepository;
    private final DealerStockSnapshotRepository dealerStockSnapshotRepository;

    @Value("${app.services.sales.url}")
    private String salesServiceUrl;

    @Value("${app.services.catalog.url}")
    private String vehicleServiceUrl;

    @Value("${app.services.dealer.url}")
    private String dealerServiceUrl;

    @Value("${app.services.inventory.url}")
    private String inventoryServiceUrl;

    // ===========================================
    // SALES REPORTING
    // ===========================================

    @Transactional
    public void recordSale(SalesRecord record) {
        log.info("Recording sale for order: {}", record.getOrderId());
        salesRecordRepository.save(record);
    }

    public List<SalesRecord> getAllRecords() {
        return salesRecordRepository.findAll();
    }

    public void processSaleEvent(SaleEventDTO event) {
        log.info("Processing sale event: {}", event);

        UUID orderUuid;
        try {
            orderUuid = UUID.fromString(event.getOrderId());
        } catch (Exception e) {
            log.warn("Invalid UUID in processSaleEvent: {}", event.getOrderId());
            return;
        }

        SalesRecord record = SalesRecord.builder()
                .id(orderUuid)
                .orderId(orderUuid)
                .dealerName(event.getDealershipName())
                .region(event.getRegion())
                .modelName(event.getModelName())
                .variantId(event.getVariantId())
                .totalAmount(BigDecimal.valueOf(event.getSalePrice() != null ? event.getSalePrice() : 0.0))
                .orderDate(event.getSaleTimestamp() != null ? event.getSaleTimestamp().toLocalDateTime()
                        : LocalDateTime.now())
                .reportedAt(LocalDateTime.now())
                .build();

        salesRecordRepository.save(record);
    }

    public void syncSalesData() {
        try {
            LocalDateTime lastSync = salesRecordRepository.findMaxOrderDate();
            String url = salesServiceUrl + "/api/v1/sales-orders/internal/all-for-reporting";
            if (lastSync != null) {
                url += "?since=" + lastSync.toString();
            }
            log.info("Syncing sales data from: {}", url);

            ParameterizedTypeReference<List<SaleEventDTO>> responseType = new ParameterizedTypeReference<>() {
            };

            ResponseEntity<List<SaleEventDTO>> responseEntity = restTemplate.exchange(url, HttpMethod.GET, null,
                    responseType);

            List<SaleEventDTO> dataList = responseEntity.getBody();

            if (dataList != null) {
                if (dataList.isEmpty()) {
                    log.info("No new sales data to sync.");
                    return;
                }

                int count = 0;
                for (SaleEventDTO dto : dataList) {

                    UUID orderUuid;
                    try {
                        orderUuid = UUID.fromString(dto.getOrderId());
                    } catch (Exception e) {
                        log.warn("Skipping invalid UUID during sync: {}", dto.getOrderId());
                        continue;
                    }

                    if (!salesRecordRepository.existsById(orderUuid)) {

                        SalesRecord record = SalesRecord.builder()
                                .id(orderUuid)
                                .orderId(orderUuid)
                                .totalAmount(BigDecimal.valueOf(dto.getSalePrice() != null ? dto.getSalePrice() : 0.0))
                                .orderDate(dto.getSaleTimestamp() != null ? dto.getSaleTimestamp().toLocalDateTime()
                                        : LocalDateTime.now())
                                .dealerName(dto.getDealershipName() != null ? dto.getDealershipName() : "Unknown")
                                .modelName(dto.getModelName() != null ? dto.getModelName() : "Unknown")
                                .variantId(dto.getVariantId())
                                .region(dto.getRegion() != null ? dto.getRegion() : "Unknown")
                                .reportedAt(LocalDateTime.now())
                                .build();

                        salesRecordRepository.save(record);
                        count++;
                    }
                }
                log.info("Synced {} new records.", count);
            }

        } catch (Exception e) {
            log.error("Failed to sync sales data", e);
            throw new RuntimeException("Sync failed: " + e.getMessage());
        }
    }

    // ===========================================
    // AI FORECASTING
    // ===========================================

    public String getDemandForecast(String modelName) {
        List<SalesRecord> records;
        if (modelName != null && !modelName.isEmpty()) {
            records = salesRecordRepository.findByModelName(modelName);
        } else {
            records = salesRecordRepository.findAll();
        }

        if (records.isEmpty()) {
            return "No data available for forecasting.";
        }

        String context = records.stream()
                .map(r -> String.format("[%s] Model: %s, Amount: %s, Region: %s",
                        r.getOrderDate().format(DateTimeFormatter.ISO_LOCAL_DATE),
                        r.getModelName(),
                        r.getTotalAmount(),
                        r.getRegion()))
                .collect(Collectors.joining("; "));

        return geminiForecastingService.generateForecast(context, modelName);
    }

    public String generateDemandForecast(String modelName) {
        return getDemandForecast(modelName);
    }

    public boolean checkForecastCache(String modelName) {
        return geminiForecastingService.hasCachedForecast(modelName);
    }

    // ===========================================
    // METADATA SYNC (Vehicle & Dealer)
    // ===========================================

    public void syncMetadata() {
        syncVehicleCache();
        syncDealerCache();
    }

    private void syncVehicleCache() {
        try {
            String url = vehicleServiceUrl + "/vehicle-catalog/variants/all-for-backfill";
            log.info("Syncing Vehicle Cache from: {}", url);

            ParameterizedTypeReference<ApiRespond<List<VariantDetailDto>>> responseType = new ParameterizedTypeReference<>() {
            };

            ResponseEntity<ApiRespond<List<VariantDetailDto>>> response = restTemplate.exchange(url, HttpMethod.GET,
                    null, responseType);

            if (response.getBody() != null && response.getBody().getData() != null) {
                List<VariantDetailDto> variants = response.getBody().getData();
                List<VehicleCache> cacheList = variants.stream().map(v -> {
                    VehicleCache p = new VehicleCache();
                    p.setVariantId(v.getVariantId());
                    p.setVariantName(v.getVersionName());
                    p.setModelId(v.getModelId());
                    p.setModelName(v.getModelName());
                    return p;
                }).collect(Collectors.toList());

                vehicleCacheRepository.saveAll(cacheList);
                log.info("Synced {} vehicles to cache.", cacheList.size());
            }
        } catch (Exception e) {
            log.error("Failed to sync Vehicle cache: " + e.getMessage());
        }
    }

    private void syncDealerCache() {
        try {
            String url = dealerServiceUrl + "/api/dealers";
            log.info("Syncing Dealer Cache from: {}", url);

            ParameterizedTypeReference<ApiRespond<List<DealerResponse>>> responseType = new ParameterizedTypeReference<>() {
            };

            ResponseEntity<ApiRespond<List<DealerResponse>>> response = restTemplate.exchange(url, HttpMethod.GET, null,
                    responseType);

            if (response.getBody() != null && response.getBody().getData() != null) {
                List<DealerResponse> dealers = response.getBody().getData();
                List<DealerCache> cacheList = dealers.stream().map(d -> {
                    DealerCache dc = new DealerCache();
                    dc.setDealerId(d.getDealerId());
                    dc.setDealerName(d.getDealerName());
                    dc.setRegion(d.getCity());
                    return dc;
                }).collect(Collectors.toList());

                dealerCacheRepository.saveAll(cacheList);
                log.info("Synced {} dealers to cache.", cacheList.size());
            }
        } catch (Exception e) {
            log.error("Failed to sync Dealer cache: " + e.getMessage());
        }
    }

    // ===========================================
    // INVENTORY SYNC
    // ===========================================

    public void syncInventoryData() {
        try {
            String url = inventoryServiceUrl + "/inventory/analytics/snapshots?limit=1000";
            log.info("Syncing inventory data from: {}", url);

            ParameterizedTypeReference<ApiRespond<List<DealerInventoryDto>>> responseType = new ParameterizedTypeReference<>() {
            };

            ResponseEntity<ApiRespond<List<DealerInventoryDto>>> responseEntity = restTemplate.exchange(url,
                    HttpMethod.GET, null, responseType);

            ApiRespond<List<DealerInventoryDto>> apiResponse = responseEntity.getBody();

            if (apiResponse != null && apiResponse.getData() != null) {
                List<DealerInventoryDto> dtos = apiResponse.getData();

                List<DealerStockSnapshot> entities = dtos.stream()
                        .filter(dto -> dto.getDealerId() != null && dto.getVariantId() != null)
                        .map(dto -> new DealerStockSnapshot(
                                dto.getDealerId(),
                                dto.getVariantId(),
                                (long) dto.getAvailableQuantity()))
                        .collect(Collectors.toList());

                if (!entities.isEmpty()) {
                    dealerStockSnapshotRepository.saveAll(entities);
                }

                log.info("Synced {} inventory snapshots to live table.", entities.size());
            } else {
                log.warn("Inventory API returned empty data.");
            }

        } catch (Exception e) {
            log.error("Failed to sync Inventory data: " + e.getMessage());
        }
    }
}
