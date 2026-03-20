package com.ev.ai_service.controller;

import com.ev.ai_service.service.GeminiAIService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Slf4j
public class ForecastController {

    private final GeminiAIService geminiAIService;

    @GetMapping(value = "/forecast/{variantId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getSalesForecast(@PathVariable String variantId) {
        log.info("Received forecast request for variantId: {}", variantId);
        String forecastJson = geminiAIService.generateForecast(variantId);
        return ResponseEntity.ok(forecastJson);
    }
}
