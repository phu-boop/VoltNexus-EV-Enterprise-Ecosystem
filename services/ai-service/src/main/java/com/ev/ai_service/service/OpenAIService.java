// package com.ev.ai_service.service;

// import com.ev.ai_service.dto.ForecastResult;
// import com.ev.ai_service.entity.InventorySnapshot;
// import com.ev.ai_service.entity.SalesHistory;
// import com.theokanning.openai.completion.chat.ChatCompletionRequest;
// import com.theokanning.openai.completion.chat.ChatMessage;
// import com.theokanning.openai.completion.chat.ChatMessageRole;
// import com.theokanning.openai.service.OpenAiService;
// import lombok.extern.slf4j.Slf4j;
// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.stereotype.Service;

// import java.time.Duration;
// import java.time.LocalDate;
// import java.time.format.DateTimeFormatter;
// import java.util.ArrayList;
// import java.util.List;
// import java.util.Map;
// import java.util.regex.Matcher;
// import java.util.regex.Pattern;

// /**
// * Service tích hợp OpenAI để dự báo thông minh
// */
// @Service
// @Slf4j
// public class OpenAIService {

// private final OpenAiService openAiService;
// private final String model;

// public OpenAIService(
// @Value("${openai.api.key}") String apiKey,
// @Value("${openai.model}") String model,
// @Value("${openai.timeout:60}") int timeout
// ) {
// this.openAiService = new OpenAiService(apiKey, Duration.ofSeconds(timeout));
// this.model = model;
// log.info("✅ OpenAI Service initialized with model: {}", model);
// }

// /**
// * Dự báo nhu cầu sử dụng OpenAI
// */
// public ForecastResult generateForecastWithAI(
// Long variantId,
// String variantName,
// String modelName,
// List<SalesHistory> salesHistory,
// List<InventorySnapshot> inventorySnapshots,
// int daysToForecast,
// String region
// ) {
// log.info("🤖 Generating AI forecast for variant {} ({} days)", variantId,
// daysToForecast);

// // Tạo prompt cho OpenAI
// String prompt = buildForecastPrompt(
// variantId,
// variantName,
// modelName,
// salesHistory,
// inventorySnapshots,
// daysToForecast,
// region
// );

// // Gọi OpenAI API
// String aiResponse = callOpenAI(prompt);

// // Parse kết quả từ AI
// ForecastResult result = parseAIResponse(
// aiResponse,
// variantId,
// variantName,
// modelName,
// daysToForecast
// );

// log.info("✅ AI forecast completed: {} units predicted",
// result.getPredictedDemand());
// return result;
// }

// /**
// * Phân tích và đề xuất kế hoạch sản xuất
// */
// public String generateProductionRecommendations(
// List<ForecastResult> forecasts,
// LocalDate planMonth
// ) {
// log.info("🤖 Generating production recommendations for {} variants",
// forecasts.size());

// String prompt = buildProductionPrompt(forecasts, planMonth);
// String recommendations = callOpenAI(prompt);

// log.info("✅ Production recommendations generated");
// return recommendations;
// }

// /**
// * Xây dựng prompt cho forecast
// */
// private String buildForecastPrompt(
// Long variantId,
// String variantName,
// String modelName,
// List<SalesHistory> salesHistory,
// List<InventorySnapshot> inventorySnapshots,
// int daysToForecast,
// String region
// ) {
// StringBuilder prompt = new StringBuilder();

// prompt.append("Bạn là chuyên gia phân tích dữ liệu và dự báo nhu cầu cho
// ngành ô tô điện.\n\n");

// prompt.append("📊 THÔNG TIN SẢN PHẨM:\n");
// prompt.append(String.format("- Model: %s\n", modelName));
// prompt.append(String.format("- Variant: %s (ID: %d)\n", variantName,
// variantId));
// if (region != null) {
// prompt.append(String.format("- Khu vực: %s\n", region));
// }
// prompt.append("\n");

// // Dữ liệu bán hàng
// prompt.append("📈 LỊCH SỬ BÁN HÀNG (60 ngày gần nhất):\n");
// if (salesHistory.isEmpty()) {
// prompt.append("- ⚠️ KHÔNG CÓ DỮ LIỆU BÁN HÀNG THỰC TẾ\n");
// prompt.append("- Đây là sản phẩm MỚI hoặc chưa có đơn hàng nào được hoàn
// thành\n");
// } else {
// DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
// for (SalesHistory sale : salesHistory) {
// prompt.append(String.format("- %s: %d xe, Giá: %.0f VNĐ, Dealer: %s\n",
// sale.getSaleDate().format(formatter),
// sale.getQuantity(),
// sale.getTotalAmount(),
// sale.getDealerId() != null ? sale.getDealerId() : "N/A"
// ));
// }

// // Thống kê
// int totalSold =
// salesHistory.stream().mapToInt(SalesHistory::getQuantity).sum();
// double avgDaily = totalSold / (double) salesHistory.size();
// prompt.append(String.format("\nTổng bán: %d xe | TB/ngày: %.2f xe\n",
// totalSold, avgDaily));
// }
// prompt.append("\n");

// // Dữ liệu tồn kho
// prompt.append("📦 TÌNH TRẠNG TỒN KHO:\n");
// if (inventorySnapshots.isEmpty()) {
// prompt.append("- ⚠️ KHÔNG CÓ DỮ LIỆU TỒN KHO\n");
// prompt.append("- Có thể sản phẩm chưa được nhập kho hoặc chưa được phân
// bổ\n");
// } else {
// InventorySnapshot latest = inventorySnapshots.get(0);
// prompt.append(String.format("- Tồn kho khả dụng: %d xe\n",
// latest.getAvailableQuantity()));
// prompt.append(String.format("- Đã đặt trước: %d xe\n",
// latest.getReservedQuantity()));
// prompt.append(String.format("- Tổng tồn: %d xe\n",
// latest.getTotalQuantity()));
// }
// prompt.append("\n");

// // Yêu cầu dự báo
// prompt.append("🎯 YÊU CẦU DỰ BÁO:\n");
// prompt.append(String.format("Hãy dự báo NHU CẦU trong %d ngày tới dựa
// trên:\n", daysToForecast));
// prompt.append("1. Xu hướng bán hàng lịch sử (nếu có)\n");
// prompt.append("2. Mùa vụ và thời điểm trong năm\n");
// prompt.append("3. Tình trạng tồn kho hiện tại (nếu có)\n");
// prompt.append("4. Đặc thù thị trường ô tô điện Việt Nam\n");
// if (salesHistory.isEmpty()) {
// prompt.append("\n⚠️ LƯU Ý: Do KHÔNG CÓ dữ liệu lịch sử, hãy dự báo dựa
// trên:\n");
// prompt.append("- Thị trường ô tô điện Việt Nam nói chung\n");
// prompt.append("- Nhu cầu trung bình cho loại xe " + modelName + "\n");
// prompt.append("- Đề xuất MỨC BẢO THỦ (10-20 xe/tháng cho sản phẩm mới)\n");
// }
// prompt.append("\n");

// prompt.append("📋 ĐỊNH DẠNG TRẢ LỜI (BẮT BUỘC):\n");
// prompt.append("PREDICTED_DEMAND: [số xe dự báo]\n");
// prompt.append("CONFIDENCE_SCORE: [0.0-1.0]\n");
// prompt.append("TREND: [INCREASING/STABLE/DECREASING]\n");
// prompt.append("ANALYSIS: [phân tích chi tiết]\n");
// prompt.append("RECOMMENDATIONS: [khuyến nghị]\n");

// return prompt.toString();
// }

// /**
// * Xây dựng prompt cho production planning
// */
// private String buildProductionPrompt(List<ForecastResult> forecasts,
// LocalDate planMonth) {
// StringBuilder prompt = new StringBuilder();

// prompt.append("Bạn là chuyên gia lập kế hoạch sản xuất cho nhà máy ô tô
// điện.\n\n");

// prompt.append(String.format("📅 KẾ HOẠCH THÁNG: %s\n\n",
// planMonth.format(DateTimeFormatter.ofPattern("MM/yyyy"))));

// prompt.append("📊 DỮ LIỆU DỰ BÁO CHO CÁC VARIANT:\n");
// for (ForecastResult forecast : forecasts) {
// prompt.append(String.format("\n🚗 %s - %s:\n", forecast.getModelName(),
// forecast.getVariantName()));
// prompt.append(String.format(" - Nhu cầu dự báo: %d xe\n",
// forecast.getPredictedDemand()));
// prompt.append(String.format(" - Tồn kho hiện tại: %d xe\n",
// forecast.getCurrentInventory()));
// prompt.append(String.format(" - Chênh lệch: %d xe\n",
// forecast.getRecommendedStock()));
// prompt.append(String.format(" - Xu hướng: %s\n", forecast.getTrend()));
// prompt.append(String.format(" - Độ tin cậy: %.1f%%\n",
// forecast.getConfidenceScore() * 100));
// }

// prompt.append("\n🎯 YÊU CẦU:\n");
// prompt.append("1. Phân tích tổng quan nhu cầu sản xuất\n");
// prompt.append("2. Đề xuất số lượng sản xuất cho từng variant\n");
// prompt.append("3. Xác định độ ưu tiên (HIGH/MEDIUM/LOW)\n");
// prompt.append("4. Đưa ra khuyến nghị về thời gian và nguồn lực\n");
// prompt.append("5. Cảnh báo rủi ro và giải pháp\n\n");

// prompt.append("Trả lời bằng tiếng Việt, rõ ràng và có cấu trúc.");

// return prompt.toString();
// }

// /**
// * Gọi OpenAI API
// */
// private String callOpenAI(String prompt) {
// try {
// List<ChatMessage> messages = new ArrayList<>();
// messages.add(new ChatMessage(ChatMessageRole.SYSTEM.value(),
// "Bạn là chuyên gia phân tích dữ liệu và dự báo cho ngành ô tô điện."));
// messages.add(new ChatMessage(ChatMessageRole.USER.value(), prompt));

// ChatCompletionRequest request = ChatCompletionRequest.builder()
// .model(model)
// .messages(messages)
// .temperature(0.3) // Low temperature for consistent predictions
// .maxTokens(1500)
// .build();

// var response = openAiService.createChatCompletion(request);
// String content = response.getChoices().get(0).getMessage().getContent();

// log.debug("OpenAI response: {}", content);
// return content;

// } catch (Exception e) {
// log.error("❌ Error calling OpenAI API: {}", e.getMessage());
// throw new RuntimeException("Failed to get AI forecast: " + e.getMessage(),
// e);
// }
// }

// /**
// * Parse kết quả từ AI response
// */
// private ForecastResult parseAIResponse(
// String aiResponse,
// Long variantId,
// String variantName,
// String modelName,
// int daysToForecast
// ) {
// try {
// // Extract values using regex
// Integer predictedDemand = extractInteger(aiResponse, "PREDICTED_DEMAND");
// Double confidenceScore = extractDouble(aiResponse, "CONFIDENCE_SCORE");
// String trend = extractString(aiResponse, "TREND");
// String analysis = extractString(aiResponse, "ANALYSIS");
// String recommendations = extractString(aiResponse, "RECOMMENDATIONS");

// // Validate and set defaults
// if (predictedDemand == null || predictedDemand < 0) {
// log.warn("Invalid predicted demand from AI, using fallback value");
// predictedDemand = 10; // Default to 10 units for new products
// }

// // Ensure minimum demand for realistic forecasting
// if (predictedDemand == 0) {
// log.info("AI predicted 0 demand, adjusting to minimum of 5 units");
// predictedDemand = 5;
// }

// if (confidenceScore == null || confidenceScore < 0 || confidenceScore > 1) {
// log.warn("Invalid confidence score, using default 0.5");
// confidenceScore = 0.5; // Lower default confidence when no data
// }

// if (trend == null || !trend.matches("INCREASING|STABLE|DECREASING")) {
// log.warn("Invalid trend, using STABLE");
// trend = "STABLE";
// }

// return ForecastResult.builder()
// .variantId(variantId)
// .variantName(variantName)
// .modelName(modelName)
// .forecastDate(LocalDate.now().plusDays(daysToForecast))
// .predictedDemand(predictedDemand)
// .confidenceScore(confidenceScore)
// .forecastMethod("OPENAI")
// .trend(trend)
// .currentInventory(0) // Will be updated by service
// .recommendedStock(predictedDemand)
// .build();

// } catch (Exception e) {
// log.error("Error parsing AI response: {}", e.getMessage());
// throw new RuntimeException("Failed to parse AI forecast", e);
// }
// }

// // Helper methods for parsing
// private Integer extractInteger(String text, String key) {
// Pattern pattern = Pattern.compile(key + ":\\s*(\\d+)");
// Matcher matcher = pattern.matcher(text);
// if (matcher.find()) {
// return Integer.parseInt(matcher.group(1));
// }
// return null;
// }

// private Double extractDouble(String text, String key) {
// Pattern pattern = Pattern.compile(key + ":\\s*([0-9.]+)");
// Matcher matcher = pattern.matcher(text);
// if (matcher.find()) {
// return Double.parseDouble(matcher.group(1));
// }
// return null;
// }

// private String extractString(String text, String key) {
// Pattern pattern = Pattern.compile(key + ":\\s*(.+?)(?=\\n[A-Z_]+:|$)",
// Pattern.DOTALL);
// Matcher matcher = pattern.matcher(text);
// if (matcher.find()) {
// return matcher.group(1).trim();
// }
// return null;
// }
// }
