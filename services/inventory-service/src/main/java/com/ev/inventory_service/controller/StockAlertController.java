package com.ev.inventory_service.controller;

import com.ev.common_lib.dto.respond.ApiRespond;
import com.ev.inventory_service.model.StockAlert;
import com.ev.inventory_service.services.Interface.StockAlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/inventory/alerts")
@RequiredArgsConstructor
public class StockAlertController {

    private final StockAlertService alertService;

    @GetMapping
    public ResponseEntity<ApiRespond<List<StockAlert>>> getActiveAlerts() {
        List<StockAlert> alerts = alertService.getActiveAlerts();
        return ResponseEntity.ok(ApiRespond.success("Fetched active alerts", alerts));
    }
}
