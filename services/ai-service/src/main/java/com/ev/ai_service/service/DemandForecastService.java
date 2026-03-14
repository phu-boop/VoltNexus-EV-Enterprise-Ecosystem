package com.ev.ai_service.service;

import com.ev.ai_service.client.VehicleServiceClient;
import com.ev.ai_service.client.SalesServiceClient;
import com.ev.ai_service.client.InventoryServiceClient;
import com.ev.ai_service.dto.*;
import com.ev.ai_service.entity.*;
import com.ev.ai_service.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
@RequiredArgsConstructor
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
        // Lấy thông tin vehicle từ Vehicle Service
        String variantName = "Variant " + variantId;
        String modelName = "Model";
        VehicleServiceClient.VehicleVariantInfo variantInfo = vehicleServiceClient.getVariantInfo(variantId);
        if (variantInfo != null) {
            variantName = variantInfo.getVariantName() != null ? variantInfo.getVariantName() : variantName;
            modelName = variantInfo.getModelName() != null ? variantInfo.getModelName() : modelName;
        }

        // Chọn phương pháp dự báo
        String method = request.getForecastMethod() != null ? request.getForecastMethod() : "AUTO";

        Integer predictedDemand;
        Double confidence;
        String trend;

        // 🤖 SỬ DỤNG OPENAI NẾU CHỌN "OPENAI" METHOD
        if ("OPENAI".equalsIgnoreCase(method)) {
            log.info("🤖 Using OpenAI for forecasting variant {}", variantId);

            // Lấy dữ liệu lịch sử
            LocalDateTime endDate = LocalDateTime.now();
            LocalDateTime startDate = endDate.minusDays(historyDays);

            List<SalesHistory> salesHistory = salesHistoryRepository
                    .findByVariantIdAndDateRange(variantId, startDate, endDate);

            List<InventorySnapshot> inventorySnapshots = inventorySnapshotRepository
                    .findByVariantIdOrderBySnapshotDateDesc(variantId);

            // 🔄 CHECK IF DATA IS INSUFFICIENT - If so, fetch from REST APIs
            if (salesHistory.size() < 10) {
                log.warn("⚠️ Insufficient sales history data ({} records). Fetching from Sales Service...",
                        salesHistory.size());

                UUID dealerIdUUID = (request.getDealerId() != null && !request.getDealerId().isEmpty())
                        ? UUID.fromString(request.getDealerId())
                        : null;

                try {
                    // Call REST API to enrich data
                    enrichHistoricalDataFromRestApis(variantId, dealerIdUUID, historyDays);

                    // Re-fetch data after enrichment
                    salesHistory = salesHistoryRepository
                            .findByVariantIdAndDateRange(variantId, startDate, endDate);
                    inventorySnapshots = inventorySnapshotRepository
                            .findByVariantIdOrderBySnapshotDateDesc(variantId);

                    log.info("✅ After enrichment: {} sales records, {} inventory snapshots",
                            salesHistory.size(), inventorySnapshots.size());
                } catch (Exception e) {
                    log.error("❌ Failed to enrich data from REST APIs: {}", e.getMessage());
                }
            }

            // 🚨 STILL NO DATA? Return minimal forecast
            if (salesHistory.isEmpty() && inventorySnapshots.isEmpty()) {
                log.warn("⚠️ No historical data available after enrichment. Returning conservative forecast.");
                return ForecastResult.builder()
                        .variantId(variantId)
                        .variantName(variantName)
                        .modelName(modelName)
                        .forecastDate(LocalDate.now().plusDays(daysToForecast))
                        .predictedDemand(5) // Conservative estimate
                        .confidenceScore(0.3) // Low confidence
                        .forecastMethod("OPENAI_FALLBACK")
                        .historicalAverage(0)
                        .trend("STABLE")
                        .currentInventory(0)
                        .recommendedStock(5)
                        .build();
            }

            // Gọi OpenAI để dự báo
            ForecastResult aiResult = geminiAIService.generateForecastWithAI(
                    variantId,
                    variantName,
                    modelName,
                    salesHistory,
                    inventorySnapshots,
                    daysToForecast,
                    request.getRegion());

            predictedDemand = aiResult.getPredictedDemand();
            confidence = aiResult.getConfidenceScore();
            trend = aiResult.getTrend();
            method = "GEMINI";

        } else {
            // Sử dụng thuật toán truyền thống
            switch (method.toUpperCase()) {
                case "MOVING_AVERAGE":
                    predictedDemand = algorithmService.forecastWithMovingAverage(
                            variantId, historyDays, daysToForecast);
                    break;
                case "LINEAR_REGRESSION":
                    predictedDemand = algorithmService.forecastWithLinearRegression(
                            variantId, historyDays, daysToForecast);
                    break;
                case "WEIGHTED_AVERAGE":
                    predictedDemand = algorithmService.forecastWithWeightedAverage(
                            variantId, historyDays, daysToForecast);
                    break;
                case "AUTO":
                default:
                    predictedDemand = algorithmService.forecastAuto(
                            variantId, historyDays, daysToForecast);
                    method = "AUTO";
                    break;
            }

            // Tính confidence score
            confidence = algorithmService.calculateConfidence(variantId, historyDays);

            // Phân tích trend
            trend = algorithmService.analyzeTrend(variantId, historyDays);
        }

        // Lấy thông tin historical average
        Integer historicalAvg = calculateHistoricalAverage(variantId, historyDays);

        // Lấy current inventory
        Integer currentInventory = getCurrentInventory(variantId);

        // Tính recommended stock
        Integer recommendedStock = calculateRecommendedStock(predictedDemand, currentInventory);

        // Lưu forecast vào database
        DemandForecast forecast = DemandForecast.builder()
                .variantId(variantId)
                .dealerId(request.getDealerId() != null ? UUID.fromString(request.getDealerId()) : null)
                .region(request.getRegion())
                .forecastDate(LocalDate.now().plusDays(daysToForecast))
                .predictedDemand(predictedDemand)
                .confidenceScore(confidence)
                .forecastMethod(method)
                .createdAt(LocalDateTime.now())
                .build();

        forecastRepository.save(forecast);

        return ForecastResult.builder()
                .variantId(variantId)
                .variantName(variantName)
                .modelName(modelName)
                .forecastDate(LocalDate.now().plusDays(daysToForecast))
                .predictedDemand(predictedDemand)
                .confidenceScore(confidence)
                .forecastMethod(method)
                .historicalAverage(historicalAvg)
                .trend(trend)
                .currentInventory(currentInventory)
                .recommendedStock(recommendedStock)
                .build();
    }

    /**
     * Xác định danh sách variant IDs cần dự báo
     * Fix: Validate variant IDs, loại bỏ ID không hợp lệ
     */
    private List<Long> determineVariantIds(ForecastRequest request) {
        List<Long> variantIds = new ArrayList<>();

        // Case 1: Có danh sách variant IDs
        if (request.getVariantIds() != null && !request.getVariantIds().isEmpty()) {
            variantIds = request.getVariantIds().stream()
                    .filter(id -> id != null && id > 0) // ✅ Filter invalid IDs
                    .collect(Collectors.toList());

            if (!variantIds.isEmpty()) {
                log.info("Forecasting for {} specified variants", variantIds.size());
                return variantIds;
            }
        }

        // Case 2: Có single variant ID
        if (request.getVariantId() != null && request.getVariantId() > 0) {
            log.info("Forecasting for single variant: {}", request.getVariantId());
            return List.of(request.getVariantId());
        }

        // Case 3: Không có variant ID nào → Lấy top variants có sales history
        log.info("No variant IDs specified, fetching top selling variants...");

        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusDays(30);

        List<Object[]> topVariants = salesHistoryRepository
                .getTopSellingVariants(startDate, endDate);

        if (topVariants.isEmpty()) {
            log.warn("⚠️ No sales history found. Cannot generate forecast without historical data.");
            log.warn("💡 Suggestion: Seed test data using POST /api/ai/test/seed-data");
            return Collections.emptyList();
        }

        variantIds = topVariants.stream()
                .limit(10) // Lấy top 10
                .map(row -> (Long) row[0])
                .filter(id -> id != null && id > 0) // ✅ Double check
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
            // 1️⃣ Fetch Sales History from Sales Service
            log.info("📊 Fetching sales history from Sales Service...");
            List<SalesServiceClient.SalesHistoryDto> salesData = salesServiceClient.getSalesHistory(
                    variantId, dealerId, startDate, endDate, 1000);

            if (!salesData.isEmpty()) {
                log.info("✅ Fetched {} sales records. Saving to AI Service database...", salesData.size());

                int savedCount = 0;
                for (SalesServiceClient.SalesHistoryDto dto : salesData) {
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
                        savedCount++;
                    } catch (Exception e) {
                        log.warn("Failed to save sales record for order {}: {}", dto.getOrderId(), e.getMessage());
                    }
                }

                log.info("✅ Saved {} sales records to AI Service database", savedCount);
            } else {
                log.warn("⚠️ No sales data returned from Sales Service");
            }

            // 2️⃣ Fetch Inventory Snapshots from Inventory Service
            log.info("📦 Fetching inventory snapshots from Inventory Service...");
            List<InventoryServiceClient.InventorySnapshotDto> inventoryData = inventoryServiceClient
                    .getInventorySnapshots(variantId, dealerId, 1000);

            if (!inventoryData.isEmpty()) {
                log.info("✅ Fetched {} inventory snapshots. Saving to AI Service database...",
                        inventoryData.size());

                int savedCount = 0;
                for (InventoryServiceClient.InventorySnapshotDto dto : inventoryData) {
                    try {
                        // Create snapshot record
                        // Note: InventorySnapshot entity uses reservedQuantity, not allocatedQuantity
                        InventorySnapshot snapshot = InventorySnapshot.builder()
                                .variantId(dto.getVariantId())
                                .dealerId(dealerId != null ? dealerId : UUID.randomUUID()) // Use provided or generate
                                .region("Unknown") // Not provided by Inventory Service
                                .availableQuantity(dto.getAvailableQuantity())
                                .reservedQuantity(dto.getAllocatedQuantity() != null ? dto.getAllocatedQuantity() : 0)
                                .totalQuantity((dto.getAvailableQuantity() != null ? dto.getAvailableQuantity() : 0) +
                                        (dto.getAllocatedQuantity() != null ? dto.getAllocatedQuantity() : 0))
                                .snapshotDate(LocalDateTime.now())
                                .recordedAt(LocalDateTime.now())
                                .modelName(dto.getModelName())
                                .variantName(dto.getVersionName())
                                .build();

                        inventorySnapshotRepository.save(snapshot);
                        savedCount++;
                    } catch (Exception e) {
                        log.warn("Failed to save inventory snapshot for variant {}: {}",
                                dto.getVariantId(), e.getMessage());
                    }
                }

                log.info("✅ Saved {} inventory snapshots to AI Service database", savedCount);
            } else {
                log.warn("⚠️ No inventory data returned from Inventory Service");
            }

            log.info("🎉 Historical data enrichment completed successfully!");

        } catch (Exception e) {
            log.error("❌ Error enriching historical data from REST APIs: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to enrich historical data", e);
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
