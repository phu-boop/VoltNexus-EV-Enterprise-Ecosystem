package com.ev.sales_service.service.Implementation;

import com.ev.common_lib.exception.AppException;
import com.ev.common_lib.exception.ErrorCode;
import com.ev.sales_service.dto.request.OrderTrackingRequest;
import com.ev.sales_service.dto.response.OrderTrackingResponse;
import com.ev.sales_service.entity.OrderTracking;
import com.ev.sales_service.entity.SalesOrder;
import com.ev.sales_service.enums.OrderStatusB2C;
import com.ev.sales_service.enums.OrderTrackingStatus;
import com.ev.sales_service.repository.OrderTrackingRepository;
import com.ev.sales_service.repository.SalesOrderRepositoryB2C;
import com.ev.sales_service.service.Interface.OrderTrackingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class OrderTrackingServiceImpl implements OrderTrackingService {

    private final OrderTrackingRepository orderTrackingRepository;
    private final SalesOrderRepositoryB2C salesOrderRepository;
    private final ModelMapper modelMapper;

    @Override
    public OrderTrackingResponse createTrackingRecord(OrderTrackingRequest request) {
        log.info("Creating tracking record for order: {}", request.getOrderId());

        SalesOrder salesOrder = salesOrderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new AppException(ErrorCode.SALES_ORDER_NOT_FOUND));
        // ✅ Chỉ cho phép tạo nếu đơn hàng đang ở trạng thái IN_PRODUCTION
        if (salesOrder.getOrderStatusB2C() != (OrderStatusB2C.IN_PRODUCTION)) {
            throw new AppException(ErrorCode.INVALID_TRACKING_OPERATION_STATE);
        }
        OrderTracking orderTracking = OrderTracking.builder()
                .salesOrder(salesOrder)
                .statusB2C(request.getStatus())
                .updateDate(LocalDateTime.now())
                .notes(request.getNotes())
                .updatedBy(request.getUpdatedBy())
                .build();

        OrderTracking savedTracking = orderTrackingRepository.save(orderTracking);
         // ✅ Nếu tracking đã giao hàng -> cập nhật trạng thái đơn hàng
        if (request.getStatusB2C() == OrderTrackingStatus.DELIVERED) {
            salesOrder.setOrderStatusB2C(OrderStatusB2C.DELIVERED);
            salesOrderRepository.save(salesOrder);
        }

        log.info("Tracking record created successfully: {}", savedTracking.getTrackId());
        return mapToResponse(savedTracking);
    }

    @Override
    public OrderTrackingResponse updateTrackingRecord(UUID trackId, OrderTrackingRequest request) {
        log.info("Updating tracking record: {}", trackId);

        OrderTracking orderTracking = orderTrackingRepository.findById(trackId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_TRACKING_NOT_FOUND));

        SalesOrder salesOrder = salesOrderRepository.findById(orderTracking.getSalesOrder().getOrderId())
                .orElseThrow(() -> new AppException(ErrorCode.DATABASE_ERROR));

        // ✅ Chỉ cho phép cập nhật khi đơn hàng đang trong sản xuất
        if (salesOrder.getOrderStatusB2C() != OrderStatusB2C.IN_PRODUCTION) {
            throw new AppException(ErrorCode.INVALID_TRACKING_OPERATION_STATE);
        }

        // ✅ Cập nhật trạng thái tracking
        orderTracking.setStatusB2C(request.getStatusB2C());
        orderTracking.setNotes(request.getNotes());
        orderTracking.setUpdateDate(LocalDateTime.now());
        orderTracking.setUpdatedBy(request.getUpdatedBy());

        // ✅ Nếu tracking đã giao hàng -> cập nhật trạng thái đơn hàng
        if (request.getStatusB2C() == OrderTrackingStatus.DELIVERED) {
            salesOrder.setOrderStatusB2C(OrderStatusB2C.DELIVERED);
            salesOrderRepository.save(salesOrder);
        }

        OrderTracking updatedTracking = orderTrackingRepository.save(orderTracking);
        log.info("Tracking record updated successfully: {}", trackId);

        return mapToResponse(updatedTracking);
    }


    @Override
    public void deleteTrackingRecord(UUID trackId) {
        log.info("Deleting tracking record: {}", trackId);

        OrderTracking orderTracking = orderTrackingRepository.findById(trackId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_TRACKING_NOT_FOUND));

        orderTrackingRepository.delete(orderTracking);
        log.info("Tracking record deleted successfully: {}", trackId);
    }

    @Override
    public OrderTrackingResponse getTrackingRecordById(UUID trackId) {
        OrderTracking orderTracking = orderTrackingRepository.findById(trackId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_TRACKING_NOT_FOUND));
        return mapToResponse(orderTracking);
    }

    @Override
    public List<OrderTrackingResponse> getTrackingHistoryByOrderId(UUID orderId) {
        List<OrderTracking> trackingRecords = orderTrackingRepository.findBySalesOrder_OrderIdOrderByUpdateDateDesc(orderId);
        return trackingRecords.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public OrderTrackingResponse getCurrentStatus(UUID orderId) {
        OrderTracking latestTracking = orderTrackingRepository.findLatestByOrderId(orderId);
        if (latestTracking == null) {
            throw new AppException(ErrorCode.ORDER_TRACKING_NOT_FOUND);
        }
        return mapToResponse(latestTracking);
    }

    @Override
    public List<OrderTrackingResponse> getTrackingByStatus(String status) {
        List<OrderTracking> trackingRecords = orderTrackingRepository.findByOrderIdAndStatusB2C(null, status);
        return trackingRecords.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public OrderTrackingResponse addTrackingNote(UUID orderId, String notes, UUID updatedBy) {
        log.info("Adding tracking note for order: {}", orderId);

        SalesOrder salesOrder = salesOrderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.SALES_ORDER_NOT_FOUND));

        // Get current status from latest tracking record
        OrderTracking currentTracking = orderTrackingRepository.findLatestByOrderId(orderId);
        OrderTrackingStatus currentStatus = currentTracking != null ? currentTracking.getStatusB2C() : OrderTrackingStatus.CREATED;

        OrderTracking orderTracking = OrderTracking.builder()
                .salesOrder(salesOrder)
                .statusB2C(currentStatus)
                .updateDate(LocalDateTime.now())
                .notes(notes)
                .updatedBy(updatedBy)
                .build();

        OrderTracking savedTracking = orderTrackingRepository.save(orderTracking);
        log.info("Tracking note added successfully for order: {}", orderId);

        return mapToResponse(savedTracking);
    }

    private OrderTrackingResponse mapToResponse(OrderTracking orderTracking) {
        OrderTrackingResponse response = modelMapper.map(orderTracking, OrderTrackingResponse.class);
        // TODO: Add staff name from user service
        return response;
    }
}