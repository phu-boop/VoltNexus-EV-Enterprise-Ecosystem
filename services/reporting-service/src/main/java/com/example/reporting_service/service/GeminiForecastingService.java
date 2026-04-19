package com.example.reporting_service.service;

import com.example.reporting_service.model.ForecastLog;
import com.example.reporting_service.repository.ForecastLogRepository;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class GeminiForecastingService {

    @Value("${gemini.api-key}")
    private String geminiApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final ForecastLogRepository forecastLogRepository;

    @Value("${gemini.model}")
    private String geminiModel;

    private static final String GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/";

    public String generateForecast(String contextData, String modelName) {
        String cacheKey = (modelName == null || modelName.isEmpty()) ? "ALL" : modelName;

        // 1. Check Cache
        Optional<ForecastLog> cached = forecastLogRepository.findTopByModelNameOrderByCreatedAtDesc(cacheKey);
        if (cached.isPresent()) {
            // Valid for 24 hours
            if (cached.get().getCreatedAt().isAfter(LocalDateTime.now().minusHours(24))) {
                log.info("Returning cached forecast for: {}", cacheKey);
                return cached.get().getResponseJson();
            }
        }

        // 2. Call API
        try {
            String url = GEMINI_BASE_URL + geminiModel + ":generateContent?key=" + geminiApiKey;

            // Prepare Request Body
            Map<String, Object> part = new HashMap<>();
            String prompt = String.format(
                "Role: Professional Business Intelligence Analyst for an EV manufacturer.\n" +
                "Task: Analyze the sales data below and predict future demand trends.\n" +
                "Tone: Objective, Formal, Third-person (Do not use 'I', 'We', 'Friends'). Use Business Report style.\n" +
                "Response format: JSON ONLY in one line. No markdown formatting (no ```json code blocks).\n" +
                "Structure:\n" +
                "{\n" +
                "  \"analysis_vi\": \"Comprehensive analysis in Vietnamese. Use clear structure: \\n1. General Trend (Xu hướng chung)... \\n2. Model Performance (Hiệu suất mẫu xe)... \\n3. Assessment (Đánh giá)... \\nUse Unicode bullet points (•) for details. Avoid conversational filler.\",\n" +
                "  \"recommendation_vi\": \"Strategic recommendations in Vietnamese. Structured and actionable.\",\n" +
                "  \"forecast_data\": [\n" +
                "    {\"label\": \"Next Month 1\", \"value\": 100},\n" +
                "    {\"label\": \"Next Month 2\", \"value\": 120}\n" +
                "  ]\n" +
                "}\n" +
                "Data: %s", 
                contextData
            );
            
            part.put("text", prompt);
            
            Map<String, Object> content = new HashMap<>();
            content.put("parts", List.of(part));
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", List.of(content));

            // Headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            // Execute
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                String rawText = extractTextFromResponse(response.getBody());
                // Clean up markdown code blocks if gemini returns them despite instructions
                if (rawText.startsWith("```json")) {
                    rawText = rawText.replace("```json", "").replace("```", "");
                } else if (rawText.startsWith("```")) {
                    rawText = rawText.replace("```", "");
                }
                
                String cleanJson = rawText.trim();
                
                // 3. Save to Cache
                ForecastLog logEntry = ForecastLog.builder()
                        .modelName(cacheKey)
                        .responseJson(cleanJson)
                        .createdAt(LocalDateTime.now())
                        .build();
                forecastLogRepository.save(logEntry);

                return cleanJson;
            } else {
                log.error("Gemini API Error: {}", response.getStatusCode());
                return "{\"analysis_vi\": \"Error calling AI service.\"}";
            }

        } catch (Exception e) {
            log.error("Failed to generate forecast", e);
            return "Forecast unavailable.";
        }
    }

    private String extractTextFromResponse(String jsonResponse) {
        try {
            JsonNode root = objectMapper.readTree(jsonResponse);
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode content = candidates.get(0).path("content");
                JsonNode parts = content.path("parts");
                if (parts.isArray() && !parts.isEmpty()) {
                    return parts.get(0).path("text").asText();
                }
            }
        } catch (Exception e) {
            log.error("Error parsing Gemini response", e);
        }
        return "Could not parse forecast result.";
    }

    public boolean hasCachedForecast(String modelName) {
        String cacheKey = (modelName == null || modelName.isEmpty()) ? "ALL" : modelName;
        Optional<ForecastLog> cached = forecastLogRepository.findTopByModelNameOrderByCreatedAtDesc(cacheKey);
        
        return cached.isPresent() && 
               cached.get().getCreatedAt().isAfter(LocalDateTime.now().minusHours(24));
    }
}
