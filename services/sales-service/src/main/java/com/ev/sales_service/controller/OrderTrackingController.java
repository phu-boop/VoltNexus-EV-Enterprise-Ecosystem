package com.ev.sales_service.controller;

import com.ev.sales_service.dto.request.OrderTrackingRequest;
import com.ev.sales_service.dto.response.OrderTrackingResponse;
import com.ev.sales_service.service.Interface.OrderTrackingService;
import com.ev.common_lib.dto.respond.ApiRespond;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/order-tracking")
@RequiredArgsConstructor
@Slf4j
public class OrderTrackingController {

    private final OrderTrackingService orderTrackingService;

    @PostMapping
    public ResponseEntity<ApiRespond<OrderTrackingResponse>> createTrackingRecord(@RequestBody OrderTrackingRequest request) {
        log.info("Creating tracking record for order: {}", request.getOrderId());
        OrderTrackingResponse response = orderTrackingService.createTrackingRecord(request);
        return ResponseEntity.ok(ApiRespond.success("Tracking record created successfully", response));
    }

    @PutMapping("/{trackId}")
    public ResponseEntity<ApiRespond<OrderTrackingResponse>> updateTrackingRecord(
            @PathVariable UUID trackId,
            @RequestBody OrderTrackingRequest request) {
        log.info("Updating tracking record: {}", trackId);
        OrderTrackingResponse response = orderTrackingService.updateTrackingRecord(trackId, request);
        return ResponseEntity.ok(ApiRespond.success("Tracking record updated successfully", response));
    }

    @DeleteMapping("/{trackId}")
    public ResponseEntity<ApiRespond<?>> deleteTrackingRecord(@PathVariable UUID trackId) {
        log.info("Deleting tracking record: {}", trackId);
        orderTrackingService.deleteTrackingRecord(trackId);
        return ResponseEntity.ok(ApiRespond.success("Tracking record deleted successfully", null));
    }

    @GetMapping("/{trackId}")
    public ResponseEntity<ApiRespond<OrderTrackingResponse>> getTrackingRecordById(@PathVariable UUID trackId) {
        log.info("Fetching tracking record: {}", trackId);
        OrderTrackingResponse response = orderTrackingService.getTrackingRecordById(trackId);
        return ResponseEntity.ok(ApiRespond.success("Tracking record fetched successfully", response));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<ApiRespond<List<OrderTrackingResponse>>> getTrackingHistoryByOrderId(@PathVariable UUID orderId) {
        log.info("Fetching tracking history for order: {}", orderId);
        List<OrderTrackingResponse> responses = orderTrackingService.getTrackingHistoryByOrderId(orderId);
        return ResponseEntity.ok(ApiRespond.success("Tracking history fetched successfully", responses));
    }

    @GetMapping("/order/{orderId}/current")
    public ResponseEntity<ApiRespond<OrderTrackingResponse>> getCurrentStatus(@PathVariable UUID orderId) {
        log.info("Fetching current status for order: {}", orderId);
        OrderTrackingResponse response = orderTrackingService.getCurrentStatus(orderId);
        return ResponseEntity.ok(ApiRespond.success("Current status fetched successfully", response));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiRespond<List<OrderTrackingResponse>>> getTrackingByStatus(@PathVariable String status) {
        log.info("Fetching tracking records with status: {}", status);
        List<OrderTrackingResponse> responses = orderTrackingService.getTrackingByStatus(status);
        return ResponseEntity.ok(ApiRespond.success("Tracking records fetched successfully", responses));
    }

    @PostMapping("/order/{orderId}/note")
    public ResponseEntity<ApiRespond<OrderTrackingResponse>> addTrackingNote(
            @PathVariable UUID orderId,
            @RequestParam String notes,
            @RequestParam UUID updatedBy) {
        log.info("Adding tracking note for order: {}", orderId);
        OrderTrackingResponse response = orderTrackingService.addTrackingNote(orderId, notes, updatedBy);
        return ResponseEntity.ok(ApiRespond.success("Tracking note added successfully", response));
    }

}