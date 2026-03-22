package com.ev.ai_service.service;

import com.ev.ai_service.client.VehicleServiceClient;
import com.ev.ai_service.client.SalesServiceClient;
import com.ev.ai_service.client.InventoryServiceClient;
import com.ev.ai_service.dto.*;
import com.ev.ai_service.entity.*;
import com.ev.ai_service.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service chính cho Demand Forecasting
 */
@Service
@Slf4j
public class DemandForecastService {

        private final ForecastAlgorithmService algorithmService;
        private final SalesHistoryRepository salesHistoryRepository;
        private final InventorySnapshotRepository inventorySnapshotRepository;
        private final DemandForecastRepository forecastRepository;
        private final ProductionPlanRepository productionPlanRepository;
        private final VehicleServiceClient vehicleServiceClient;
        private final GeminiAIService geminiAIService;
        private final SalesServiceClient salesServiceClient;
        private final InventoryServiceClient inventoryServiceClient;
        private final DemandForecastService self;

        public DemandForecastService(
                        ForecastAlgorithmService algorithmService,
                        SalesHistoryRepository salesHistoryRepository,
                        InventorySnapshotRepository inventorySnapshotRepository,
                        DemandForecastRepository forecastRepository,
                        ProductionPlanRepository productionPlanRepository,
                        VehicleServiceClient vehicleServiceClient,
                        GeminiAIService geminiAIService,
                        SalesServiceClient salesServiceClient,
                        InventoryServiceClient inventoryServiceClient,
                        @Lazy DemandForecastService self) {
                this.algorithmService = algorithmService;
                this.salesHistoryRepository = salesHistoryRepository;
                this.inventorySnapshotRepository = inventorySnapshotRepository;
                this.forecastRepository = forecastRepository;
                this.productionPlanRepository = productionPlanRepository;
                this.vehicleServiceClient = vehicleServiceClient;
                this.geminiAIService = geminiAIService;
                this.salesServiceClient = salesServiceClient;
                this.inventoryServiceClient = inventoryServiceClient;
                this.self = self;
        }

        /**
         * Tạo dự báo nhu cầu dựa trên request
         */
        @Transactional
        public ForecastResponse generateForecast(ForecastRequest request) {
                log.info("Generating forecast with request: {}", request);

                int daysToForecast = request.getDaysToForecast() != null ? request.getDaysToForecast() : 30;
                int historyDays = 60; // Sử dụng 60 ngày lịch sử

                List<ForecastResult> results = new ArrayList<>();

                // Xác định danh sách variants cần dự báo
                List<Long> variantIds = determineVariantIds(request);

                for (Long variantId : variantIds) {
                        try {
                                ForecastResult result = forecastForVariant(
                                                variantId,
                                                request,
                                                historyDays,
                                                daysToForecast);
                                results.add(result);
                        } catch (Exception e) {
                                log.error("Error forecasting for variant {}: {}", variantId, e.getMessage());
                        }
                }

                // Tạo summary
                ForecastSummary summary = createSummary(results);

                return ForecastResponse.builder()
                                .generatedAt(LocalDate.now())
                                .region(request.getRegion())
                                .dealerId(request.getDealerId())
                                .forecasts(results)
                                .summary(summary)
                                .build();
        }

        /**
         * Dự báo cho một variant cụ thể
         */
        private ForecastResult forecastForVariant(
                        Long variantId,
                        ForecastRequest request,
                        int historyDays,
                        int daysToForecast) {

                // 1. Lấy metadata của xe
                VariantMetadata metadata = getVariantMetadata(variantId);

                // 2. Chọn phương pháp dự báo
                String method = request.getForecastMethod() != null ? request.getForecastMethod() : "AUTO";

                ForecastCoreData coreData;

                // 🤖 SỬ DỤNG AI NẾU CHỌN "OPENAI" (hoặc GEMINI) METHOD
                if ("OPENAI".equalsIgnoreCase(method)) {
                        coreData = performAiForecast(variantId, metadata, request, historyDays, daysToForecast);
                } else {
                        coreData = performTraditionalForecast(variantId, method, historyDays, daysToForecast);
                }

                // 3. Thu thập dữ liệu bổ sung & Tính toán đề xuất
                Integer historicalAvg = calculateHistoricalAverage(variantId, historyDays);
                Integer currentInventory = getCurrentInventory(variantId);
                Integer recommendedStock = calculateRecommendedStock(coreData.getPredictedDemand(), currentInventory);

                // 4. Lưu và Trả về kết quả
                saveForecastToDb(variantId, request, daysToForecast, coreData);

                return buildForecastResult(variantId, metadata, daysToForecast, coreData, historicalAvg,
                                currentInventory,
                                recommendedStock);
        }

        private VariantMetadata getVariantMetadata(Long variantId) {
                String variantName = "Variant " + variantId;
                String modelName = "Model";
                VehicleServiceClient.VehicleVariantInfo variantInfo = vehicleServiceClient.getVariantInfo(variantId);

                if (variantInfo != null) {
                        variantName = variantInfo.getVariantName() != null ? variantInfo.getVariantName() : variantName;
                        modelName = variantInfo.getModelName() != null ? variantInfo.getModelName() : modelName;
                }

                return new VariantMetadata(variantName, modelName);
        }

        private ForecastCoreData performAiForecast(
                        Long variantId,
                        VariantMetadata metadata,
                        ForecastRequest request,
                        int historyDays,
                        int daysToForecast) {

                log.info("🤖 Using AI for forecasting variant {}", variantId);

                LocalDateTime endDate = LocalDateTime.now();
                LocalDateTime startDate = endDate.minusDays(historyDays);

                List<SalesHistory> salesHistory = salesHistoryRepository.findByVariantIdAndDateRange(variantId,
                                startDate,
                                endDate);
                List<InventorySnapshot> inventorySnapshots = inventorySnapshotRepository
                                .findByVariantIdOrderBySnapshotDateDesc(variantId);

                // 🔄 Enrich if data is insufficient
                if (salesHistory.size() < 10) {
                        enrichDataIfNecessary(variantId, request, historyDays);
                        // Re-fetch
                        salesHistory = salesHistoryRepository.findByVariantIdAndDateRange(variantId, startDate,
                                        endDate);
                        inventorySnapshots = inventorySnapshotRepository
                                        .findByVariantIdOrderBySnapshotDateDesc(variantId);
                }

                // 🚨 Still no data?
                if (salesHistory.isEmpty() && inventorySnapshots.isEmpty()) {
                        log.warn("⚠️ No historical data available. Returning conservative AI fallback.");
                        return new ForecastCoreData(5, 0.3, "STABLE", "OPENAI_FALLBACK");
                }

                ForecastResult aiResult = geminiAIService.generateForecastWithAI(
                                variantId, metadata.variantName, metadata.modelName,
                                salesHistory, inventorySnapshots, daysToForecast, request.getRegion());

                return new ForecastCoreData(
                                aiResult.getPredictedDemand(),
                                aiResult.getConfidenceScore(),
                                aiResult.getTrend(),
                                "GEMINI");
        }

        private void enrichDataIfNecessary(Long variantId, ForecastRequest request, int historyDays) {
                log.warn("⚠️ Insufficient sales history. Fetching from Sales Service...");
                UUID dealerIdUUID = (request.getDealerId() != null && !request.getDealerId().isEmpty())
                                ? UUID.fromString(request.getDealerId())
                                : null;

                try {
                        self.enrichHistoricalDataFromRestApis(variantId, dealerIdUUID, historyDays);
                } catch (Exception e) {
                        log.error("❌ Failed to enrich data: {}", e.getMessage());
                }
        }

        private ForecastCoreData performTraditionalForecast(Long variantId, String method, int historyDays,
                        int daysToForecast) {
                Integer predictedDemand;
                String effectiveMethod = method;

                switch (method.toUpperCase()) {
                        case "MOVING_AVERAGE":
                                predictedDemand = algorithmService.forecastWithMovingAverage(variantId, historyDays,
                                                daysToForecast);
                                break;
                        case "LINEAR_REGRESSION":
                                predictedDemand = algorithmService.forecastWithLinearRegression(variantId, historyDays,
                                                daysToForecast);
                                break;
                        case "WEIGHTED_AVERAGE":
                                predictedDemand = algorithmService.forecastWithWeightedAverage(variantId, historyDays,
                                                daysToForecast);
                                break;
                        case "AUTO":
                        default:
                                predictedDemand = algorithmService.forecastAuto(variantId, historyDays, daysToForecast);
                                effectiveMethod = "AUTO";
                                break;
                }

                Double confidence = algorithmService.calculateConfidence(variantId, historyDays);
                String trend = algorithmService.analyzeTrend(variantId, historyDays);

                return new ForecastCoreData(predictedDemand, confidence, trend, effectiveMethod);
        }

        private void saveForecastToDb(Long variantId, ForecastRequest request, int daysToForecast,
                        ForecastCoreData data) {
                DemandForecast forecast = DemandForecast.builder()
                                .variantId(variantId)
                                .dealerId(request.getDealerId() != null ? UUID.fromString(request.getDealerId()) : null)
                                .region(request.getRegion())
                                .forecastDate(LocalDate.now().plusDays(daysToForecast))
                                .predictedDemand(data.getPredictedDemand())
                                .confidenceScore(data.getConfidenceScore())
                                .forecastMethod(data.getMethod())
                                .createdAt(LocalDateTime.now())
                                .build();

                forecastRepository.save(forecast);
        }

        private ForecastResult buildForecastResult(
                        Long variantId,
                        VariantMetadata metadata,
                        int daysToForecast,
                        ForecastCoreData data,
                        Integer historicalAvg,
                        Integer currentInventory,
                        Integer recommendedStock) {

                return ForecastResult.builder()
                                .variantId(variantId)
                                .variantName(metadata.variantName)
                                .modelName(metadata.modelName)
                                .forecastDate(LocalDate.now().plusDays(daysToForecast))
                                .predictedDemand(data.getPredictedDemand())
                                .confidenceScore(data.getConfidenceScore())
                                .forecastMethod(data.getMethod())
                                .historicalAverage(historicalAvg)
                                .trend(data.getTrend())
                                .currentInventory(currentInventory)
                                .recommendedStock(recommendedStock)
                                .build();
        }

        @lombok.AllArgsConstructor
        @lombok.Getter
        private static class VariantMetadata {
                private final String variantName;
                private final String modelName;
        }

        @lombok.AllArgsConstructor
        @lombok.Getter
        private static class ForecastCoreData {
                private final Integer predictedDemand;
                private final Double confidenceScore;
                private final String trend;
                private final String method;
        }

        /**
         * Xác định danh sách variant IDs cần dự báo
         * Fix: Validate variant IDs, loại bỏ ID không hợp lệ
         */
        private List<Long> determineVariantIds(ForecastRequest request) {
                // Case 1: Có danh sách variant IDs
                List<Long> idsFromRequest = getVariantIdsFromRequest(request);
                if (!idsFromRequest.isEmpty()) {
                        log.info("Forecasting for {} specified variants", idsFromRequest.size());
                        return idsFromRequest;
                }

                // Case 2: Có single variant ID
                Long singleId = getSingleVariantIdFromRequest(request);
                if (singleId != null) {
                        log.info("Forecasting for single variant: {}", singleId);
                        return List.of(singleId);
                }

                // Case 3: Không có variant ID nào → Lấy top variants có sales history
                return getTopSellingVariantIds();
        }

        private List<Long> getVariantIdsFromRequest(ForecastRequest request) {
                if (request.getVariantIds() == null || request.getVariantIds().isEmpty()) {
                        return Collections.emptyList();
                }
                return request.getVariantIds().stream()
                                .filter(id -> id != null && id > 0)
                                .collect(Collectors.toList());
        }

        private Long getSingleVariantIdFromRequest(ForecastRequest request) {
                if (request.getVariantId() != null && request.getVariantId() > 0) {
                        return request.getVariantId();
                }
                return null;
        }

        private List<Long> getTopSellingVariantIds() {
                log.info("No variant IDs specified, fetching top selling variants...");

                LocalDateTime endDate = LocalDateTime.now();
                LocalDateTime startDate = endDate.minusDays(30);

                List<Object[]> topVariants = salesHistoryRepository.getTopSellingVariants(startDate, endDate);

                if (topVariants.isEmpty()) {
                        log.warn("⚠️ No sales history found. Cannot generate forecast without historical data.");
                        log.warn("💡 Suggestion: Seed test data using POST /api/ai/test/seed-data");
                        return Collections.emptyList();
                }

                List<Long> variantIds = topVariants.stream()
                                .limit(10)
                                .map(row -> (Long) row[0])
                                .filter(id -> id != null && id > 0)
                                .collect(Collectors.toList());

                log.info("Found {} variants with sales history", variantIds.size());
                return variantIds;
        }

        /**
         * 🚀 Enriches database with historical data from REST APIs
         * This method fetches sales history and inventory snapshots from other services
         * and stores them in the local AI Service database for analysis.
         * 
         * This should be called when:
         * - Cold start (no Kafka data collected yet)
         * - Insufficient historical data (< 30 days)
         * - User explicitly requests data refresh
         * 
         * @param variantId Optional variant ID to fetch data for (null = all variants)
         * @param dealerId  Optional dealer ID to filter by
         * @param daysBack  Number of days to fetch historical data for
         */
        @Transactional
        public void enrichHistoricalDataFromRestApis(Long variantId, UUID dealerId, int daysBack) {
                log.info("🔄 Enriching historical data from REST APIs: variantId={}, dealerId={}, daysBack={}",
                                variantId, dealerId, daysBack);

                LocalDate endDate = LocalDate.now();
                LocalDate startDate = endDate.minusDays(daysBack);

                try {
                        // 1️⃣ Fetch & Save Sales History
                        fetchAndSaveSalesHistory(variantId, dealerId, startDate, endDate);

                        // 2️⃣ Fetch & Save Inventory Snapshots
                        fetchAndSaveInventorySnapshots(variantId, dealerId);

                        log.info("🎉 Historical data enrichment completed successfully!");

                } catch (Exception e) {
                        log.error("❌ Error enriching historical data from REST APIs: {}", e.getMessage(), e);
                        throw new RuntimeException("Failed to enrich historical data", e);
                }
        }

        private void fetchAndSaveSalesHistory(Long variantId, UUID dealerId, LocalDate startDate, LocalDate endDate) {
                log.info("📊 Fetching sales history from Sales Service...");
                List<SalesServiceClient.SalesHistoryDto> salesData = salesServiceClient.getSalesHistory(
                                variantId, dealerId, startDate, endDate, 1000);

                if (salesData.isEmpty()) {
                        log.warn("⚠️ No sales data returned from Sales Service");
                        return;
                }

                log.info("✅ Fetched {} sales records. Saving to AI Service database...", salesData.size());
                int savedCount = 0;
                for (SalesServiceClient.SalesHistoryDto dto : salesData) {
                        if (saveSalesHistoryRecord(dto)) {
                                savedCount++;
                        }
                }
                log.info("✅ Saved {} sales records to AI Service database", savedCount);
        }

        private boolean saveSalesHistoryRecord(SalesServiceClient.SalesHistoryDto dto) {
                try {
                        SalesHistory history = SalesHistory.builder()
                                        .orderId(dto.getOrderId())
                                        .variantId(dto.getVariantId())
                                        .dealerId(dto.getDealerId())
                                        .region(dto.getRegion())
                                        .quantity(dto.getQuantity())
                                        .totalAmount(dto.getTotalAmount() != null
                                                        ? java.math.BigDecimal.valueOf(dto.getTotalAmount())
                                                        : null)
                                        .saleDate(dto.getOrderDate().atStartOfDay())
                                        .recordedAt(LocalDateTime.now())
                                        .orderStatus(dto.getOrderStatus())
                                        .modelName(dto.getModelName())
                                        .variantName(dto.getVariantName())
                                        .build();

                        salesHistoryRepository.save(history);
                        return true;
                } catch (Exception e) {
                        log.warn("Failed to save sales record for order {}: {}", dto.getOrderId(), e.getMessage());
                        return false;
                }
        }

        private void fetchAndSaveInventorySnapshots(Long variantId, UUID dealerId) {
                log.info("📦 Fetching inventory snapshots from Inventory Service...");
                List<InventoryServiceClient.InventorySnapshotDto> inventoryData = inventoryServiceClient
                                .getInventorySnapshots(variantId, dealerId, 1000);

                if (inventoryData.isEmpty()) {
                        log.warn("⚠️ No inventory data returned from Inventory Service");
                        return;
                }

                log.info("✅ Fetched {} inventory snapshots. Saving to AI Service database...", inventoryData.size());
                int savedCount = 0;
                for (InventoryServiceClient.InventorySnapshotDto dto : inventoryData) {
                        if (saveInventorySnapshotRecord(dto, dealerId)) {
                                savedCount++;
                        }
                }
                log.info("✅ Saved {} inventory snapshots to AI Service database", savedCount);
        }

        private boolean saveInventorySnapshotRecord(InventoryServiceClient.InventorySnapshotDto dto, UUID dealerId) {
                try {
                        InventorySnapshot snapshot = InventorySnapshot.builder()
                                        .variantId(dto.getVariantId())
                                        .dealerId(dealerId != null ? dealerId : UUID.randomUUID())
                                        .region("Unknown")
                                        .availableQuantity(dto.getAvailableQuantity())
                                        .reservedQuantity(
                                                        dto.getAllocatedQuantity() != null ? dto.getAllocatedQuantity()
                                                                        : 0)
                                        .totalQuantity((dto.getAvailableQuantity() != null ? dto.getAvailableQuantity()
                                                        : 0) +
                                                        (dto.getAllocatedQuantity() != null ? dto.getAllocatedQuantity()
                                                                        : 0))
                                        .snapshotDate(LocalDateTime.now())
                                        .recordedAt(LocalDateTime.now())
                                        .modelName(dto.getModelName())
                                        .variantName(dto.getVersionName())
                                        .build();

                        inventorySnapshotRepository.save(snapshot);
                        return true;
                } catch (Exception e) {
                        log.warn("Failed to save inventory snapshot for variant {}: {}", dto.getVariantId(),
                                        e.getMessage());
                        return false;
                }
        }

        /**
         * Tính trung bình lịch sử
         */
        private Integer calculateHistoricalAverage(Long variantId, int days) {
                LocalDateTime endDate = LocalDateTime.now();
                LocalDateTime startDate = endDate.minusDays(days);

                Integer total = salesHistoryRepository.sumQuantityByVariantAndDateRange(
                                variantId, startDate, endDate);

                return total != null ? total / days : 0;
        }

        /**
         * Lấy tồn kho hiện tại
         */
        private Integer getCurrentInventory(Long variantId) {
                return inventorySnapshotRepository
                                .findTopByVariantIdOrderBySnapshotDateDesc(variantId)
                                .map(InventorySnapshot::getAvailableQuantity)
                                .orElse(0);
        }

        /**
         * Tính recommended stock level
         */
        private Integer calculateRecommendedStock(Integer predictedDemand, Integer currentInventory) {
                // Safety stock = 20% của predicted demand
                int safetyStock = (int) (predictedDemand * 0.2);
                int recommendedTotal = predictedDemand + safetyStock;

                return Math.max(0, recommendedTotal - currentInventory);
        }

        /**
         * Tạo summary từ kết quả dự báo
         */
        private ForecastSummary createSummary(List<ForecastResult> results) {
                int totalPredicted = results.stream()
                                .mapToInt(ForecastResult::getPredictedDemand)
                                .sum();

                int totalInventory = results.stream()
                                .mapToInt(r -> r.getCurrentInventory() != null ? r.getCurrentInventory() : 0)
                                .sum();

                int productionGap = Math.max(0, totalPredicted - totalInventory);

                double avgConfidence = results.stream()
                                .mapToDouble(ForecastResult::getConfidenceScore)
                                .average()
                                .orElse(0.0);

                long highDemand = results.stream()
                                .filter(r -> r.getPredictedDemand() > r.getHistoricalAverage() * 1.2)
                                .count();

                long lowStock = results.stream()
                                .filter(r -> r.getCurrentInventory() < r.getPredictedDemand() * 0.5)
                                .count();

                // Phân tích overall trend
                Map<String, Long> trendCounts = results.stream()
                                .collect(Collectors.groupingBy(ForecastResult::getTrend, Collectors.counting()));

                String overallTrend = trendCounts.entrySet().stream()
                                .max(Map.Entry.comparingByValue())
                                .map(Map.Entry::getKey)
                                .orElse("STABLE");

                return ForecastSummary.builder()
                                .totalPredictedDemand(totalPredicted)
                                .totalCurrentInventory(totalInventory)
                                .productionGap(productionGap)
                                .averageConfidence(avgConfidence)
                                .highDemandVariants((int) highDemand)
                                .lowStockVariants((int) lowStock)
                                .overallTrend(overallTrend)
                                .build();
        }

        /**
         * Lấy forecast theo region
         */
        public List<ForecastResult> getForecastByRegion(String region, LocalDate startDate, LocalDate endDate) {
                List<DemandForecast> forecasts = forecastRepository
                                .findByRegionAndForecastDateBetween(region, startDate, endDate);

                return forecasts.stream()
                                .map(this::mapToForecastResult)
                                .collect(Collectors.toList());
        }

        /**
         * Lấy forecast theo dealer
         */
        public List<ForecastResult> getForecastByDealer(UUID dealerId, LocalDate startDate, LocalDate endDate) {
                List<DemandForecast> forecasts = forecastRepository
                                .findByDealerIdAndForecastDateBetween(dealerId, startDate, endDate);

                return forecasts.stream()
                                .map(this::mapToForecastResult)
                                .collect(Collectors.toList());
        }

        /**
         * Map entity to DTO
         */
        private ForecastResult mapToForecastResult(DemandForecast forecast) {
                return ForecastResult.builder()
                                .variantId(forecast.getVariantId())
                                .variantName(forecast.getVariantName())
                                .modelName(forecast.getModelName())
                                .forecastDate(forecast.getForecastDate())
                                .predictedDemand(forecast.getPredictedDemand())
                                .confidenceScore(forecast.getConfidenceScore())
                                .forecastMethod(forecast.getForecastMethod())
                                .build();
        }
}
