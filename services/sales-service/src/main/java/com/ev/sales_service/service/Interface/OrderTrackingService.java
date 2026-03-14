package com.ev.sales_service.service.Interface;

import com.ev.sales_service.dto.request.OrderTrackingRequest;
import com.ev.sales_service.dto.response.OrderTrackingResponse;

import java.util.List;
import java.util.UUID;

public interface OrderTrackingService {
    OrderTrackingResponse createTrackingRecord(OrderTrackingRequest request);

    OrderTrackingResponse updateTrackingRecord(UUID trackId, OrderTrackingRequest request);

    void deleteTrackingRecord(UUID trackId);

    OrderTrackingResponse getTrackingRecordById(UUID trackId);

    List<OrderTrackingResponse> getTrackingHistoryByOrderId(UUID orderId);

    OrderTrackingResponse getCurrentStatus(UUID orderId);

    List<OrderTrackingResponse> getTrackingByStatus(String status);

    OrderTrackingResponse addTrackingNote(UUID orderId, String notes, UUID updatedBy);
}