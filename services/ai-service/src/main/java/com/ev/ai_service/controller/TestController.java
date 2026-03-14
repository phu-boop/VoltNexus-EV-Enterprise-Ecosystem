package com.ev.ai_service.controller;

import com.ev.ai_service.entity.InventorySnapshot;
import com.ev.ai_service.entity.SalesHistory;
import com.ev.ai_service.repository.InventorySnapshotRepository;
import com.ev.ai_service.repository.SalesHistoryRepository;
import com.ev.common_lib.dto.respond.ApiRespond;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.UUID;

/**
 * Controller để test và seed dữ liệu cho AI service
 */
@RestController
@RequestMapping("/api/ai/test")
@RequiredArgsConstructor
@Slf4j
public class TestController {

    private final SalesHistoryRepository salesHistoryRepository;
    private final InventorySnapshotRepository inventorySnapshotRepository;

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<ApiRespond<String>> healthCheck() {
        return ResponseEntity.ok(
                ApiRespond.success("AI Service is running", "OK"));
    }

    /**
     * Kiểm tra số lượng dữ liệu trong database
     */
    @GetMapping("/data-status")
    public ResponseEntity<ApiRespond<DataStatus>> getDataStatus() {
        long salesCount = salesHistoryRepository.count();
        long inventoryCount = inventorySnapshotRepository.count();

        DataStatus status = DataStatus.builder()
                .salesHistoryCount(salesCount)
                .inventorySnapshotCount(inventoryCount)
                .hasData(salesCount > 0 && inventoryCount > 0)
                .message(salesCount > 0 ? "Data available for forecasting" : "No data - please seed data first")
                .build();

        return ResponseEntity.ok(
                ApiRespond.success("Data status retrieved", status));
    }

    /**
     * Seed dữ liệu mẫu cho testing
     */
    @PostMapping("/seed-data")
    public ResponseEntity<ApiRespond<String>> seedData(
            @RequestParam(defaultValue = "5") int variants,
            @RequestParam(defaultValue = "60") int days) {
        log.info("Seeding {} variants with {} days of data", variants, days);

        try {
            Random random = new Random();
            List<SalesHistory> salesList = new ArrayList<>();
            List<InventorySnapshot> inventoryList = new ArrayList<>();

            UUID[] dealerIds = {
                    UUID.randomUUID(),
                    UUID.randomUUID(),
                    UUID.randomUUID()
            };

            String[] regions = { "North", "South", "Central" };
            String[] models = { "Model S", "Model X", "Model Y", "Model 3", "Model Z" };

            // Tạo sales history cho mỗi variant
            for (long variantId = 1; variantId <= variants; variantId++) {
                String modelName = models[(int) ((variantId - 1) % models.length)];
                String variantName = modelName + " Variant " + variantId;

                // Tạo trend ngẫu nhiên cho mỗi variant
                int baseSales = 5 + random.nextInt(15); // 5-20 sales/day
                double trend = -0.1 + (random.nextDouble() * 0.3); // -10% to +20% trend

                for (int day = 0; day < days; day++) {
                    LocalDateTime saleDate = LocalDateTime.now().minusDays(days - day);

                    // Tính số lượng bán với trend và noise
                    int trendEffect = (int) (baseSales * trend * day / days);
                    int noise = random.nextInt(5) - 2; // -2 to +2
                    int quantity = Math.max(0, baseSales + trendEffect + noise);

                    if (quantity > 0) {
                        UUID dealerId = dealerIds[random.nextInt(dealerIds.length)];
                        String region = regions[random.nextInt(regions.length)];

                        SalesHistory sales = SalesHistory.builder()
                                .orderId(UUID.randomUUID())
                                .variantId(variantId)
                                .dealerId(dealerId)
                                .region(region)
                                .quantity(quantity)
                                .totalAmount(BigDecimal.valueOf(quantity * 30000000L)) // 30M VND per car
                                .saleDate(saleDate)
                                .recordedAt(LocalDateTime.now())
                                .orderStatus("COMPLETED")
                                .modelName(modelName)
                                .variantName(variantName)
                                .build();

                        salesList.add(sales);
                    }
                }

                // Tạo inventory snapshot hiện tại
                int currentStock = 10 + random.nextInt(50); // 10-60 units
                int reservedStock = random.nextInt(5);
                InventorySnapshot inventory = InventorySnapshot.builder()
                        .variantId(variantId)
                        .dealerId(dealerIds[0])
                        .availableQuantity(currentStock)
                        .reservedQuantity(reservedStock)
                        .totalQuantity(currentStock + reservedStock)
                        .snapshotDate(LocalDateTime.now())
                        .recordedAt(LocalDateTime.now())
                        .region(regions[0])
                        .modelName(modelName)
                        .variantName(variantName)
                        .build();

                inventoryList.add(inventory);
            }

            // Lưu vào database
            salesHistoryRepository.saveAll(salesList);
            inventorySnapshotRepository.saveAll(inventoryList);

            String message = String.format(
                    "Seeded %d sales records and %d inventory snapshots for %d variants over %d days",
                    salesList.size(), inventoryList.size(), variants, days);

            log.info(message);
            return ResponseEntity.ok(
                    ApiRespond.success(message, null));

        } catch (Exception e) {
            log.error("Error seeding data: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(
                    ApiRespond.error("ERROR", "Failed to seed data: " + e.getMessage(), null));
        }
    }

    /**
     * Xóa tất cả dữ liệu test
     */
    @DeleteMapping("/clear-data")
    public ResponseEntity<ApiRespond<String>> clearData() {
        try {
            salesHistoryRepository.deleteAll();
            inventorySnapshotRepository.deleteAll();

            return ResponseEntity.ok(
                    ApiRespond.success("All test data cleared", null));
        } catch (Exception e) {
            log.error("Error clearing data: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(
                    ApiRespond.error("ERROR", "Failed to clear data: " + e.getMessage(), null));
        }
    }

    /**
     * Test forecast với dữ liệu mock (không cần database)
     */
    @GetMapping("/mock-forecast")
    public ResponseEntity<ApiRespond<Object>> getMockForecast() {
        // Tạo mock forecast data để test frontend
        java.util.List<java.util.Map<String, Object>> forecasts = new java.util.ArrayList<>();

        String[] models = { "Tesla Model S", "Tesla Model 3", "Tesla Model X", "BYD Han", "VinFast VF8" };
        String[] trends = { "INCREASING", "STABLE", "DECREASING" };
        Random random = new Random();

        for (int i = 0; i < 5; i++) {
            int predicted = 50 + random.nextInt(100);
            int inventory = 20 + random.nextInt(50);

            java.util.Map<String, Object> forecast = new java.util.HashMap<>();
            forecast.put("variantId", (long) (i + 1));
            forecast.put("variantName", models[i] + " Standard");
            forecast.put("modelName", models[i]);
            forecast.put("predictedDemand", predicted);
            forecast.put("currentInventory", inventory);
            forecast.put("historicalAverage", 40 + random.nextInt(40));
            forecast.put("recommendedStock", Math.max(0, predicted - inventory));
            forecast.put("trend", trends[random.nextInt(trends.length)]);
            forecast.put("confidenceScore", 0.7 + (random.nextDouble() * 0.25));
            forecast.put("forecastMethod", "MOCK");
            forecast.put("forecastDate", java.time.LocalDate.now().plusDays(30));

            forecasts.add(forecast);
        }

        java.util.Map<String, Object> summary = new java.util.HashMap<>();
        summary.put("totalPredictedDemand", forecasts.stream()
                .mapToInt(f -> (Integer) f.get("predictedDemand")).sum());
        summary.put("totalCurrentInventory", forecasts.stream()
                .mapToInt(f -> (Integer) f.get("currentInventory")).sum());
        summary.put("productionGap", forecasts.stream()
                .mapToInt(f -> (Integer) f.get("recommendedStock")).sum());
        summary.put("averageConfidence", 0.82);
        summary.put("highDemandVariants", 2);
        summary.put("lowStockVariants", 3);
        summary.put("overallTrend", "INCREASING");

        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("generatedAt", java.time.LocalDate.now());
        response.put("forecasts", forecasts);
        response.put("summary", summary);

        return ResponseEntity.ok(
                ApiRespond.success("Mock forecast data generated", response));
    }

    @lombok.Data
    @lombok.Builder
    private static class DataStatus {
        private long salesHistoryCount;
        private long inventorySnapshotCount;
        private boolean hasData;
        private String message;
    }
}
