package com.ev.sales_service.service.Implementation;

import com.ev.common_lib.dto.respond.ApiRespond;
import com.ev.common_lib.exception.AppException;
import com.ev.common_lib.exception.ErrorCode;
import com.ev.sales_service.client.CustomerClient;
import com.ev.sales_service.dto.request.CreateOrderFromDepositRequest;
import com.ev.sales_service.dto.request.SalesOrderB2CCreateRequest;
import com.ev.sales_service.dto.response.*;
import com.ev.sales_service.entity.*;
import com.ev.sales_service.enums.*;
import com.ev.sales_service.repository.OrderItemRepository;
import com.ev.sales_service.repository.QuotationRepository;
import com.ev.sales_service.repository.SalesOrderRepositoryB2C;
import com.ev.sales_service.service.Interface.EmailService;
import com.ev.sales_service.service.Interface.SalesContractService;
import com.ev.sales_service.service.Interface.SalesOrderServiceB2C;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import java.util.concurrent.CompletableFuture;


import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.ev.sales_service.entity.Outbox;
import com.ev.sales_service.entity.Notification;
import com.ev.sales_service.enums.NotificationAudience;


@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class SalesOrderServiceB2CImpl implements SalesOrderServiceB2C {

    private final SalesOrderRepositoryB2C salesOrderRepository;
    private final QuotationRepository quotationRepository;
    private final OrderItemRepository orderItemRepository;
    private final SalesContractService salesContractService;
    private final EmailService emailService;
    private final CustomerClient customerClient;
    private final RestTemplate restTemplate;
    
    // Injected for Outbox/Notification
    private final com.ev.sales_service.repository.OutboxRepository outboxRepository;
    private final com.ev.sales_service.repository.NotificationRepository notificationRepository;
    private final ObjectMapper objectMapper;

    @org.springframework.beans.factory.annotation.Value("${payment-service.url}")
    private String paymentServiceUrl;

    @org.springframework.beans.factory.annotation.Value("${dealer-service.url}")
    private String dealerServiceUrl;

    @org.springframework.beans.factory.annotation.Value("${vehicle-service.uri}")
    private String vehicleServiceUri;

    @org.springframework.beans.factory.annotation.Value("${reporting-service.url}")
    private String reportingServiceUrl;


    @Override
    public SalesOrderB2CResponse createSalesOrderFromQuotation(UUID quotationId) {
        Quotation quotation = quotationRepository.findById(quotationId)
                .orElseThrow(() -> new AppException(ErrorCode.QUOTATION_NOT_FOUND));

        // Validate quotation status (ACCEPTED or COMPLETE are both valid)
        if (quotation.getStatus() != QuotationStatus.ACCEPTED && quotation.getStatus() != QuotationStatus.COMPLETE) {
            throw new AppException(ErrorCode.INVALID_QUOTATION_STATUS);
        }

        // Check if sales order already exists
        if (quotation.getSalesOrder() != null) {
            throw new AppException(ErrorCode.SALES_ORDER_ALREADY_EXISTS);
        }

        // Create Sales Order from Quotation
        SalesOrder salesOrder = SalesOrder.builder()
                .quotation(quotation)
                .dealerId(quotation.getDealerId())
                .customerId(quotation.getCustomerId())
                .staffId(quotation.getStaffId())
                .orderDate(LocalDateTime.now())
                .orderStatusB2C(OrderStatusB2C.PENDING)
                .totalAmount(quotation.getFinalPrice())
                .downPayment(BigDecimal.ZERO) // TODO: Calculate based on business rules
                .managerApproval(false)
                .typeOder(SaleOderType.B2C)
                .build();

        // Create Sales Contract
        SalesContract salesContract = SalesContract.builder()
                .salesOrder(salesOrder)
                .contractDate(LocalDateTime.now())
                .contractStatus(ContractStatus.DRAFT)
                .contractTerms(quotation.getTermsConditions())
                .build();

        salesOrder.setSalesContract(salesContract);

        // Create initial order tracking
        OrderTracking orderTracking = OrderTracking.builder()
                .salesOrder(salesOrder)
                .statusB2C(OrderTrackingStatus.CREATED)
                .updateDate(LocalDateTime.now())
                .notes("Order created from quotation")
                .updatedBy(quotation.getStaffId())
                .build();

        salesOrder.setOrderTrackings(List.of(orderTracking));

        SalesOrder savedSalesOrder = salesOrderRepository.save(salesOrder);
        log.info("Created B2C sales order from quotation: {}", quotationId);

        // --- NOTIFICATION & EVENT ---
        try {
            // 1. Create Notification for Dealer
            String message = String.format("Đơn hàng B2C mới (từ Báo giá). Khách: %s. Mã ĐH: %s", 
                    savedSalesOrder.getCustomerName(), savedSalesOrder.getOrderId().toString().substring(0, 8));
            
            Notification notification = Notification.builder()
                    .type("ORDER_PLACED")
                    .message(message)
                    .link("/evm/b2c-orders/" + savedSalesOrder.getOrderId())
                    .audience(NotificationAudience.DEALER) // Audience is DEALER
                    .dealerId(savedSalesOrder.getDealerId()) // Important: Set Dealer ID
                    .isRead(false)
                    .createdAt(LocalDateTime.now())
                    .build();
            
            notificationRepository.save(notification);
            
            // 2. Publish B2COrderPlacedEvent to Outbox
            com.ev.common_lib.event.B2COrderPlacedEvent event = com.ev.common_lib.event.B2COrderPlacedEvent.builder()
                    .orderId(savedSalesOrder.getOrderId())
                    .dealerId(savedSalesOrder.getDealerId())
                    .totalAmount(savedSalesOrder.getTotalAmount())
                    .orderDate(savedSalesOrder.getOrderDate())
                    .customerId(savedSalesOrder.getCustomerId())
                    .customerName(savedSalesOrder.getCustomerName())
                    .customerPhone(savedSalesOrder.getCustomerPhone())
                    .modelName(fetchModelName(quotation.getModelId()))
                    .variantName(fetchVariantName(quotation.getVariantId())) // Assuming helper exists or null
                    .build();
            
            saveOutboxEvent(savedSalesOrder.getOrderId(), "SalesOrder", "B2COrderPlaced", event);
            log.info("Published B2COrderPlacedEvent for Order {}", savedSalesOrder.getOrderId());
            
        } catch (Exception e) {
            log.error("Failed to publish B2C Order Event: {}", e.getMessage(), e);
            // Don't rollback transaction for notification failure
        }


        // Async Report
        String modelName = fetchModelName(quotation.getModelId());
        sendSalesReport(savedSalesOrder, modelName, quotation.getVariantId(), null);

        return mapToResponse(savedSalesOrder);
    }

    @Override
    @Transactional
    public SalesOrderB2CResponse createOrderFromBookingDeposit(CreateOrderFromDepositRequest request) {
        log.info("Creating sales order from booking deposit - RecordId: {}", request.getRecordId());
        log.info("Using Payment Service URL: {}", paymentServiceUrl);

        // 1. Fetch PaymentRecord from payment-service
        Map<String, Object> paymentRecord;
        try {
            String url = paymentServiceUrl + "/api/v1/payments/admin/payment-records/" + request.getRecordId();
            log.info("Calling Payment Service: {}", url);

            // Create headers
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            // Simulate an internal system call or use the current user's context if
            // available
            // For now, using a system-level admin identity for this reliable internal
            // operation
            headers.set("X-User-Email", "system@vms.com");
            headers.set("X-User-Role", "ADMIN");
            headers.set("X-User-ProfileId", UUID.randomUUID().toString()); // Dummy ID for system

            org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(headers);

            org.springframework.http.ResponseEntity<Map> responseEntity = restTemplate.exchange(
                    url,
                    org.springframework.http.HttpMethod.GET,
                    entity,
                    Map.class);

            Map<String, Object> response = responseEntity.getBody();

            if (response == null || !"1000".equals(response.get("code"))) {
                log.error("Payment service response invalid: {}", response);
                throw new AppException(ErrorCode.DATA_NOT_FOUND);
            }

            paymentRecord = (Map<String, Object>) response.get("data");
            if (paymentRecord == null) {
                log.error("Payment record data is null");
                throw new AppException(ErrorCode.DATA_NOT_FOUND);
            }
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            log.error("HTTP Error calling Payment Service: {} - Body: {}", e.getStatusCode(),
                    e.getResponseBodyAsString());
            throw new AppException(ErrorCode.INTERNAL_ERROR);
        } catch (Exception e) {
            log.error("Failed to fetch payment record: {}", request.getRecordId(), e);
            throw new AppException(ErrorCode.INTERNAL_ERROR);
        }

        // 2. Validate Payment Record Status
        String status = (String) paymentRecord.get("status");
        if (!"PENDING_DEPOSIT".equals(status) && !"PARTIALLY_PAID".equals(status)) {
            log.error("Invalid payment record status: {}", status);
            throw new AppException(ErrorCode.INVALID_STATE);
        }

        // 3. Parse Metadata to get Vehicle Info
        String metadataJson = (String) paymentRecord.get("metadata");
        if (metadataJson == null) {
            log.error("Payment record metadata is null");
            throw new AppException(ErrorCode.DATA_NOT_FOUND);
        }

        Map<String, Object> metadata;
        try {
            ObjectMapper mapper = new ObjectMapper();
            metadata = mapper.readValue(metadataJson, new TypeReference<Map<String, Object>>() {
            });
        } catch (Exception e) {
            log.error("Failed to parse metadata: {}", metadataJson, e);
            throw new AppException(ErrorCode.INVALID_JSON_FORMAT);
        }

        if (metadata.get("variantId") == null) {
            log.error("Variant ID missing in metadata");
            throw new AppException(ErrorCode.INVALID_DATA);
        }
        Long variantId = ((Number) metadata.get("variantId")).longValue();
        String customerName = (String) paymentRecord.get("customerName");
        String customerPhone = (String) paymentRecord.get("customerPhone");
        String customerEmail = (String) paymentRecord.get("customerEmail");
        
        // 3.5 Get Customer ID from PaymentRecord if available
        Long customerId = null;
        if (paymentRecord.get("customerId") != null) {
            try {
                customerId = ((Number) paymentRecord.get("customerId")).longValue();
                log.info("Found customerId {} in PaymentRecord for order from booking deposit", customerId);
            } catch (Exception e) {
                log.warn("Failed to parse customerId from PaymentRecord: {}", e.getMessage());
            }
        }
        
        // 4. Create Sales Order
        SalesOrder salesOrder = new SalesOrder();
        salesOrder.setOrderDate(LocalDateTime.now());
        salesOrder.setOrderStatusB2C(OrderStatusB2C.PENDING);
        salesOrder.setPaymentStatus(PaymentStatus.PARTIALLY_PAID); // Đã cọc
        salesOrder.setTypeOder(SaleOderType.B2C);
        salesOrder.setPaymentMethod((String) paymentRecord.get("paymentMethodName"));
        
        // Link to customer if customerId exists
        if (customerId != null) {
            salesOrder.setCustomerId(customerId);
            log.info("Linked SalesOrder to Customer ID: {}", customerId);
        }

        // 3. Get Dealer ID
        if (request.getDealerId() != null) {
            salesOrder.setDealerId(request.getDealerId());
        } else if (metadata.containsKey("dealerId") && metadata.get("dealerId") != null) {
            try {
                salesOrder.setDealerId(UUID.fromString(metadata.get("dealerId").toString()));
            } catch (IllegalArgumentException e) {
                log.warn("Invalid dealerId UUID in metadata: {}", metadata.get("dealerId"));
            }
        } else if (metadata.containsKey("showroomId") && metadata.get("showroomId") != null) {
            // ... legacy check
            try {
                salesOrder.setDealerId(UUID.fromString(metadata.get("showroomId").toString()));
            } catch (IllegalArgumentException e) {
                log.warn("Invalid showroomId UUID in metadata: {}", metadata.get("showroomId"));
            }
        }

        if (salesOrder.getDealerId() == null && metadata.get("showroom") != null) {
            String showroom = metadata.get("showroom").toString();
            try {
                // Try to parse as UUID first
                salesOrder.setDealerId(UUID.fromString(showroom));
            } catch (Exception e) {
                log.warn("Showroom value is not a UUID: {}. Trying to find by name.", showroom);
                // Fallback: Look up dealer by name
                try {
                    UUID dealerId = findDealerByName(showroom);
                    if (dealerId != null) {
                        salesOrder.setDealerId(dealerId);
                        log.info("Resolved dealerId {} for showroom name: {}", dealerId, showroom);
                    }
                } catch (Exception ex) {
                    log.error("Failed to resolve dealer by name: {}", showroom, ex);
                }
            }
        }

        if (salesOrder.getDealerId() == null) {
            log.error("Dealer ID not found in metadata. Available keys: {}", metadata.keySet());
            throw new AppException(ErrorCode.INVALID_DATA);
        }

        // Map amounts
        BigDecimal totalAmount = new BigDecimal(paymentRecord.get("totalAmount").toString());
        BigDecimal depositAmount = request.getDepositAmount(); // Or from payment record if partial

        salesOrder.setTotalAmount(totalAmount);
        salesOrder.setDownPayment(depositAmount); // Tiền đã cọc

        // Customer info specific to B2C guest/user
        salesOrder.setCustomerName(customerName);
        salesOrder.setCustomerPhone(customerPhone);
        salesOrder.setCustomerEmail(customerEmail);
        salesOrder.setShippingAddress((String) paymentRecord.get("shippingAddress"));

        // ... (Guest customer handling if needed)

        // 5. Create Order Item
        OrderItem orderItem = new OrderItem();
        orderItem.setVariantId(variantId);
        orderItem.setVariantName((String) metadata.get("variantName"));
        orderItem.setModelName((String) metadata.get("modelName"));

        // Combine colors if needed
        String color = (String) metadata.get("exteriorColor");
        if (metadata.get("interiorColor") != null) {
            color += " / " + metadata.get("interiorColor");
        }
        orderItem.setColor(color);

        String imageUrl = (String) metadata.get("imageUrl");
        if (imageUrl == null || imageUrl.isBlank() || "/placeholder-car.png".equals(imageUrl)) {
            // Try fetch from vehicle-service as fallback
            try {
                String variantUrl = vehicleServiceUri + "/vehicle-catalog/variants/" + variantId;
                ApiRespond<Map<String, Object>> variantResponse = restTemplate.exchange(
                        variantUrl,
                        org.springframework.http.HttpMethod.GET,
                        null,
                        new org.springframework.core.ParameterizedTypeReference<ApiRespond<Map<String, Object>>>() {
                        }).getBody();

                if (variantResponse != null && variantResponse.getData() != null) {
                    imageUrl = (String) variantResponse.getData().get("imageUrl");
                }
            } catch (Exception e) {
                log.warn("Failed to fetch fallback image for variant {}: {}", variantId, e.getMessage());
            }
        }
        orderItem.setImageUrl(imageUrl);

        orderItem.setQuantity(1);
        orderItem.setUnitPrice(totalAmount); // Simplified
        orderItem.setFinalPrice(totalAmount);
        orderItem.setSalesOrder(salesOrder);

        salesOrder.setOrderItems(List.of(orderItem));

        // 6. Create Tracking
        OrderTracking tracking = new OrderTracking();
        tracking.setSalesOrder(salesOrder);
        tracking.setStatusB2C(OrderTrackingStatus.CREATED);
        tracking.setUpdateDate(LocalDateTime.now());
        tracking.setNotes("Đơn hàng được tạo từ Booking Deposit: " + request.getRecordId());

        salesOrder.setOrderTrackings(List.of(tracking));

        // 7. Save
        // 7. Save
        SalesOrder savedOrder = salesOrderRepository.save(salesOrder);

        // --- NOTIFICATION & EVENT ---
        try {
            // 1. Create Notification for Dealer
            String message = String.format("Đơn hàng B2C mới (Booking). Khách: %s. Mã ĐH: %s", 
                    savedOrder.getCustomerName(), savedOrder.getOrderId().toString().substring(0, 8));
            
            Notification notification = Notification.builder()
                    .type("ORDER_PLACED")
                    .message(message)
                    .link("/evm/b2c-orders/" + savedOrder.getOrderId())
                    .audience(NotificationAudience.DEALER) 
                    .dealerId(savedOrder.getDealerId())
                    .isRead(false)
                    .createdAt(LocalDateTime.now())
                    .build();
            
            notificationRepository.save(notification);
            
            // 2. Publish B2COrderPlacedEvent to Outbox
            com.ev.common_lib.event.B2COrderPlacedEvent event = com.ev.common_lib.event.B2COrderPlacedEvent.builder()
                    .orderId(savedOrder.getOrderId())
                    .dealerId(savedOrder.getDealerId())
                    .totalAmount(savedOrder.getTotalAmount())
                    .orderDate(savedOrder.getOrderDate())
                    .customerId(savedOrder.getCustomerId())
                    .customerName(savedOrder.getCustomerName())
                    .customerPhone(savedOrder.getCustomerPhone())
                    .modelName((String) metadata.get("modelName"))
                    .variantName((String) metadata.get("variantName"))
                    .build();
            
            saveOutboxEvent(savedOrder.getOrderId(), "SalesOrder", "B2COrderPlaced", event);
            log.info("Published B2COrderPlacedEvent for Order {}", savedOrder.getOrderId());
            
        } catch (Exception e) {
             log.error("Failed to publish B2C Order Event: {}", e.getMessage(), e);
        }


        // Async Report
        Long rptVariantId = variantId;
        String rptModelName = (String) metadata.get("modelName");
        String rptDealerName = (metadata.get("dealerName") != null) ? (String) metadata.get("dealerName") : "N/A";
        // Attempt to find region if possible, or leave null
        sendSalesReport(savedOrder, rptModelName, rptVariantId, rptDealerName);

        // 8. Send confirmation email to customer
        try {
            String fullName = savedOrder.getCustomerName();
            String firstName = fullName;
            String lastName = "";
            if (fullName != null && fullName.trim().contains(" ")) {
                int lastSpaceIndex = fullName.trim().lastIndexOf(" ");
                firstName = fullName.trim().substring(0, lastSpaceIndex);
                lastName = fullName.trim().substring(lastSpaceIndex + 1);
            }

            CustomerResponse customer = CustomerResponse.builder()
                    .customerId(savedOrder.getCustomerId())
                    .firstName(firstName)
                    .lastName(lastName)
                    .email(savedOrder.getCustomerEmail())
                    .phone(savedOrder.getCustomerPhone())
                    .build();

            // Fetch showroom/dealer name
            String showroomName = "N/A";
            try {
                String dealerUrl = dealerServiceUrl + "/api/dealers/" + savedOrder.getDealerId();
                ApiRespond<Map<String, Object>> dealerResponse = restTemplate.exchange(
                        dealerUrl,
                        org.springframework.http.HttpMethod.GET,
                        null,
                        new org.springframework.core.ParameterizedTypeReference<ApiRespond<Map<String, Object>>>() {
                        }).getBody();

                if (dealerResponse != null && dealerResponse.getData() != null) {
                    showroomName = (String) dealerResponse.getData().get("dealerName");
                }
            } catch (Exception e) {
                log.warn("Failed to fetch dealer name for email: {}", e.getMessage());
            }

            emailService.sendOrderConfirmedEmail(savedOrder, customer, showroomName);
            log.info("Order confirmation email sent to: {} with showroom: {}", savedOrder.getCustomerEmail(),
                    showroomName);
        } catch (Exception e) {
            log.error("Failed to send order confirmation email for order {}: {}", savedOrder.getOrderId(),
                    e.getMessage());
        }

        return mapToResponse(savedOrder);
    }

    @Override
    public SalesOrderB2CResponse createSalesOrder(SalesOrderB2CCreateRequest request) {
        // TODO: Implement direct sales order creation without quotation
        throw new UnsupportedOperationException("Direct sales order creation not implemented yet");
    }

    @Override
    public SalesOrderB2CResponse getSalesOrderById(UUID orderId) {
        SalesOrder salesOrder = salesOrderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.SALES_ORDER_NOT_FOUND));

        // Validate B2C type
        if (salesOrder.getTypeOder() != SaleOderType.B2C) {
            throw new AppException(ErrorCode.INVALID_ORDER_TYPE);
        }

        return mapToResponse(salesOrder);
    }

    @Override
    public List<SalesOrderB2CResponse> getSalesOrdersByDealer(UUID dealerId) {
        List<SalesOrder> salesOrders = salesOrderRepository.findByDealerIdAndTypeOder(dealerId, SaleOderType.B2C);
        return salesOrders.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<SalesOrderB2CResponse> getSalesOrdersByCustomer(Long customerId) {
        List<SalesOrder> salesOrders = salesOrderRepository.findByCustomerIdAndTypeOder(customerId, SaleOderType.B2C);
        return salesOrders.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<SalesOrderB2CResponse> getSalesOrdersByProfileId(String profileId) {
        log.info("Fetching orders for profileId: {}", profileId);
        
        // Get customer by profileId from customer-service
        try {
            ApiRespond<CustomerResponse> customerRespond = customerClient.getCustomerByProfileId(profileId);
            
            if (customerRespond == null || customerRespond.getData() == null) {
                log.warn("No customer found for profileId: {}", profileId);
                return List.of(); // Return empty list if customer not found
            }
            
            CustomerResponse customer = customerRespond.getData();
            Long customerId = customer.getCustomerId();
            
            log.info("Found customerId: {} for profileId: {}", customerId, profileId);
            
            // Fetch orders by customerId
            return getSalesOrdersByCustomer(customerId);
            
        } catch (Exception e) {
            log.error("Error fetching customer by profileId: {}", profileId, e);
            return List.of(); // Return empty list on error
        }
    }

    @Override
    public SalesOrderB2CResponse updateSalesOrderStatus(UUID orderId, String status) {
        SalesOrder salesOrder = salesOrderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.SALES_ORDER_NOT_FOUND));

        // Validate B2C type
        if (salesOrder.getTypeOder() != SaleOderType.B2C) {
            throw new AppException(ErrorCode.INVALID_ORDER_TYPE);
        }

        // TODO: Add status transition validation
        salesOrder.setOrderStatusB2C(OrderStatusB2C.valueOf(status));

        // Add tracking entry
        OrderTracking tracking = OrderTracking.builder()
                .salesOrder(salesOrder)
                .status(status)
                .updateDate(LocalDateTime.now())
                .notes("Status updated to " + status)
                .updatedBy(salesOrder.getStaffId()) // TODO: Get current user from security context
                .build();

        salesOrder.getOrderTrackings().add(tracking);

        SalesOrder updatedSalesOrder = salesOrderRepository.save(salesOrder);
        return mapToResponse(updatedSalesOrder);
    }

    @Override
    public SalesOrderB2CResponse approveSalesOrder(UUID orderId, UUID managerId) {
        SalesOrder salesOrder = salesOrderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.SALES_ORDER_NOT_FOUND));

        if (salesOrder.getOrderStatusB2C() != OrderStatusB2C.EDITED &&
                salesOrder.getOrderStatusB2C() != OrderStatusB2C.PENDING &&
                salesOrder.getOrderStatusB2C() != OrderStatusB2C.CONFIRMED) {
            throw new AppException(ErrorCode.INVALID_ORDER_STATUS);
        }

        // Validate B2C type
        if (salesOrder.getTypeOder() != SaleOderType.B2C) {
            throw new AppException(ErrorCode.INVALID_ORDER_TYPE);
        }

        salesOrder.setManagerApproval(true);
        salesOrder.setApprovedBy(managerId);
        salesOrder.setApprovalDate(LocalDateTime.now());
        salesOrder.setOrderStatusB2C(OrderStatusB2C.APPROVED);

        // Add tracking entry
        OrderTracking tracking = OrderTracking.builder()
                .salesOrder(salesOrder)
                .statusB2C(OrderTrackingStatus.CREATED)
                .updateDate(LocalDateTime.now())
                .notes("Order approved by manager")
                .updatedBy(managerId)
                .build();

        salesOrder.getOrderTrackings().add(tracking);

        SalesOrder approvedSalesOrder = salesOrderRepository.save(salesOrder);

        // --- Lấy thông tin khách hàng ---
        CustomerResponse customer;
        if (salesOrder.getCustomerId() != null) {
            customer = getCustomerInfo(salesOrder.getCustomerId());
        } else {
            // Trường hợp khách vãng lai (guest) từ booking deposit
            customer = CustomerResponse.builder()
                    .firstName(salesOrder.getCustomerName())
                    .email(salesOrder.getCustomerEmail())
                    .phone(salesOrder.getCustomerPhone())
                    .build();
        }

        // --- Gửi email xác nhận ---
        try {
            emailService.sendOrderConfirmedEmail(salesOrder, customer, "EV Automotive Showroom");
            log.info("Order confirmation email sent to customer: {}", customer.getEmail());
        } catch (Exception e) {
            log.error("Failed to send confirmation email for order: {}", orderId, e);
            // Không throw exception để không ảnh hưởng business logic chính
        }
        return mapToResponse(approvedSalesOrder);
    }

    private SalesOrderB2CResponse mapToResponse(SalesOrder salesOrder) {
        if (salesOrder == null)
            return null;

        SalesOrderB2CResponse response = new SalesOrderB2CResponse();
        response.setOrderId(salesOrder.getOrderId());
        response.setDealerId(salesOrder.getDealerId());
        response.setCustomerId(salesOrder.getCustomerId());
        response.setStaffId(salesOrder.getStaffId());
        response.setOrderDate(salesOrder.getOrderDate());
        response.setDeliveryDate(salesOrder.getDeliveryDate());
        response.setOrderStatusB2C(salesOrder.getOrderStatusB2C());
        response.setTotalAmount(salesOrder.getTotalAmount());
        response.setDownPayment(salesOrder.getDownPayment());
        response.setManagerApproval(salesOrder.getManagerApproval());
        response.setApprovedBy(salesOrder.getApprovedBy());
        response.setTypeOder(salesOrder.getTypeOder());
        response.setApprovalDate(salesOrder.getApprovalDate());
        response.setPaymentStatus(salesOrder.getPaymentStatus()); // Payment status

        response.setCustomerName(salesOrder.getCustomerName());
        response.setCustomerEmail(salesOrder.getCustomerEmail());
        response.setCustomerPhone(salesOrder.getCustomerPhone());
        response.setShippingAddress(salesOrder.getShippingAddress());
        response.setNotes(salesOrder.getNotes());
        response.setPaymentMethod(salesOrder.getPaymentMethod());

        // Map Quotation
        if (salesOrder.getQuotation() != null) {
            QuotationResponse quotationResponse = new QuotationResponse();
            quotationResponse.setQuotationId(salesOrder.getQuotation().getQuotationId());
            quotationResponse.setModelId(salesOrder.getQuotation().getModelId());
            quotationResponse.setVariantId(salesOrder.getQuotation().getVariantId());
            quotationResponse.setCustomerId(salesOrder.getQuotation().getCustomerId());
            quotationResponse.setStaffId(salesOrder.getQuotation().getStaffId());
            quotationResponse.setBasePrice(salesOrder.getQuotation().getBasePrice());
            quotationResponse.setDiscountAmount(salesOrder.getQuotation().getDiscountAmount());
            quotationResponse.setFinalPrice(salesOrder.getQuotation().getFinalPrice());
            quotationResponse.setStatus(salesOrder.getQuotation().getStatus());
            response.setQuotation(quotationResponse);
        }

        // Map SalesContract
        if (salesOrder.getSalesContract() != null) {
            SalesContractResponse contractResponse = new SalesContractResponse();
            contractResponse.setContractId(salesOrder.getSalesContract().getContractId());
            contractResponse.setContractDate(salesOrder.getSalesContract().getContractDate());
            contractResponse.setContractStatus(salesOrder.getSalesContract().getContractStatus());
            contractResponse.setContractTerms(salesOrder.getSalesContract().getContractTerms());
            contractResponse.setSigningDate(salesOrder.getSalesContract().getSigningDate());
            contractResponse.setContractFileUrl(salesOrder.getSalesContract().getContractFileUrl());
            contractResponse.setDigitalSignature(salesOrder.getSalesContract().getDigitalSignature());
            response.setSalesContract(contractResponse);
        }

        // Map OrderItems
        if (salesOrder.getOrderItems() != null) {
            List<OrderItemResponse> itemResponses = salesOrder.getOrderItems().stream()
                    .map(item -> {
                        OrderItemResponse itemResponse = new OrderItemResponse();
                        itemResponse.setVariantId(item.getVariantId());
                        itemResponse.setVariantName(item.getVariantName());
                        itemResponse.setModelName(item.getModelName());
                        itemResponse.setColor(item.getColor());

                        String imageUrl = item.getImageUrl();
                        if (imageUrl == null || imageUrl.isBlank() || "/placeholder-car.png".equals(imageUrl)) {
                            imageUrl = fetchVariantImage(item.getVariantId());
                        }
                        itemResponse.setImageUrl(imageUrl);

                        itemResponse.setQuantity(item.getQuantity());
                        itemResponse.setUnitPrice(item.getUnitPrice());
                        itemResponse.setDiscount(item.getDiscount());
                        itemResponse.setFinalPrice(item.getFinalPrice());
                        itemResponse.setPrice(item.getFinalPrice()); // Frontend alias
                        return itemResponse;
                    }).toList();
            response.setOrderItems(itemResponses);
        }

        // Map OrderTrackings
        if (salesOrder.getOrderTrackings() != null) {
            List<OrderTrackingResponse> trackingResponses = salesOrder.getOrderTrackings().stream()
                    .map(track -> {
                        OrderTrackingResponse trackResp = new OrderTrackingResponse();
                        trackResp.setTrackId(track.getTrackId());
                        trackResp.setStatus(track.getStatusB2C());
                        trackResp.setUpdateDate(track.getUpdateDate());
                        trackResp.setNotes(track.getNotes());
                        trackResp.setUpdatedBy(track.getUpdatedBy());
                        return trackResp;
                    }).toList();
            response.setOrderTrackings(trackingResponses);
        }

        return response;
    }

    public Long getModelIdBySalesOrderId(UUID salesOrderId) {
        SalesOrder salesOrder = salesOrderRepository.findById(salesOrderId)
                .orElseThrow(() -> new RuntimeException("SalesOrder not found with ID: " + salesOrderId));

        if (salesOrder.getQuotation() == null) {
            throw new RuntimeException("Quotation not found for this SalesOrder");
        }

        return salesOrder.getQuotation().getModelId();
    }

    @Override
    @Transactional
    public SalesOrderB2CResponse addOrderItemsToSalesOrder(UUID orderId) {
        log.info("Processing existing order items for sales order: {}", orderId);

        SalesOrder salesOrder = salesOrderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.SALES_ORDER_NOT_FOUND));

        // Kiểm tra loại đơn
        if (salesOrder.getTypeOder() != SaleOderType.B2C) {
            throw new AppException(ErrorCode.INVALID_ORDER_TYPE);
        }

        // Chỉ cho phép khi đang ở trạng thái PENDING
        if (salesOrder.getOrderStatusB2C() != OrderStatusB2C.PENDING) {
            throw new AppException(ErrorCode.INVALID_ORDER_STATUS);
        }

        List<OrderItem> existingItems = salesOrder.getOrderItems();
        if (existingItems == null || existingItems.isEmpty()) {
            throw new AppException(ErrorCode.ORDER_ITEMS_REQUIRED);
        }

        // Duyệt và validate từng item
        for (OrderItem item : existingItems) {
            if (item.getVariantId() == null) {
                throw new AppException(ErrorCode.VARIANT_ID_REQUIRED);
            }
            if (item.getQuantity() == null || item.getQuantity() <= 0) {
                throw new AppException(ErrorCode.INVALID_QUANTITY);
            }
            if (item.getUnitPrice() == null || item.getUnitPrice().compareTo(BigDecimal.ZERO) <= 0) {
                throw new AppException(ErrorCode.INVALID_UNIT_PRICE);
            }

            BigDecimal discount = item.getDiscount() != null ? item.getDiscount() : BigDecimal.ZERO;
            BigDecimal finalPrice = calculateFinalPrice(item.getUnitPrice(), item.getQuantity(), discount);
            item.setFinalPrice(finalPrice);
            item.setSalesOrder(salesOrder);
        }

        // Lưu danh sách item hiện tại (không thay collection)
        orderItemRepository.saveAll(existingItems);

        // Tính tổng tiền
        BigDecimal newTotalAmount = calculateOrderTotalFromItems(existingItems);
        salesOrder.setTotalAmount(newTotalAmount);

        // Tính tiền đặt cọc (30%)
        BigDecimal newDownPayment = calculateDownPayment(newTotalAmount);
        salesOrder.setDownPayment(newDownPayment);

        // Cập nhật trạng thái và reset phê duyệt
        salesOrder.setManagerApproval(false);
        salesOrder.setApprovedBy(null);
        salesOrder.setApprovalDate(null);

        SalesOrder updatedSalesOrder = salesOrderRepository.save(salesOrder);
        log.info("Recalculated {} order items for sales order {}, total amount: {}",
                existingItems.size(), orderId, newTotalAmount);

        return mapToResponse(updatedSalesOrder);
    }

    //
    // ==========================
    // Helper methods
    // ==========================

    /**
     * Tính giá cuối cùng sau khi áp dụng chiết khấu.
     *
     * @param unitPrice Đơn giá
     * @param quantity  Số lượng
     * @param discount  Phần trăm chiết khấu (0–100)
     * @return Giá cuối cùng sau khi giảm
     */
    private BigDecimal calculateFinalPrice(BigDecimal unitPrice, Integer quantity, BigDecimal discount) {
        BigDecimal total = unitPrice.multiply(BigDecimal.valueOf(quantity));
        BigDecimal discountAmount = total.multiply(discount.divide(BigDecimal.valueOf(100)));
        return total.subtract(discountAmount);
    }

    /**
     * Tính tổng tiền của toàn bộ order items.
     *
     * @param orderItems Danh sách OrderItem
     * @return Tổng tiền đơn hàng
     */
    private BigDecimal calculateOrderTotalFromItems(List<OrderItem> orderItems) {
        return orderItems.stream()
                .map(OrderItem::getFinalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Tính tiền đặt cọc (ví dụ 30% tổng đơn hàng).
     *
     * @param totalAmount Tổng tiền đơn hàng
     * @return Số tiền đặt cọc
     */
    private BigDecimal calculateDownPayment(BigDecimal totalAmount) {
        BigDecimal downPaymentPercentage = new BigDecimal("0.30"); // 30%
        return totalAmount.multiply(downPaymentPercentage);
    }

    private CustomerResponse getCustomerInfo(Long customerId) {
        try {
            ApiRespond<CustomerResponse> response = customerClient.getCustomerById(customerId);
            if (response != null && "1000".equals(response.getCode()) && response.getData() != null) {
                return response.getData();
            }
            throw new AppException(ErrorCode.CUSTOMER_NOT_FOUND);
        } catch (Exception e) {
            log.error("Failed to get customer info for id: {}", customerId, e);
            throw new AppException(ErrorCode.CUSTOMER_SERVICE_UNAVAILABLE);
        }
    }

    @Override
    @Transactional
    public SalesOrderB2CResponse rejectSalesOrder(UUID orderId, String reason) {
        SalesOrder salesOrder = salesOrderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.SALES_ORDER_NOT_FOUND));

        if (salesOrder.getOrderStatusB2C() != OrderStatusB2C.PENDING &&
            salesOrder.getOrderStatusB2C() != OrderStatusB2C.EDITED) {
            throw new AppException(ErrorCode.INVALID_ORDER_STATUS);
        }

        salesOrder.setOrderStatusB2C(OrderStatusB2C.CANCELLED);
        
         // Add tracking entry
        OrderTracking tracking = OrderTracking.builder()
                .salesOrder(salesOrder)
                .statusB2C(OrderTrackingStatus.CANCELLED)
                .updateDate(LocalDateTime.now())
                .notes("Order rejected by manager. Reason: " + reason)
                // .updatedBy(managerId) // TODO
                .build();

        salesOrder.getOrderTrackings().add(tracking);

        salesOrderRepository.save(salesOrder);
        return mapToResponse(salesOrder);
    }

    // =================================================================================================
    // HELPER METHODS
    // =================================================================================================

    private void saveOutboxEvent(UUID aggregateId, String aggregateType, String eventType, Object payloadObject) {
        try {
            // 1. Convert DTO to JSON
            String payload = objectMapper.writeValueAsString(payloadObject);
            String eventId = UUID.randomUUID().toString();

            // 2. Build Outbox entity
            Outbox out = Outbox.builder()
                    .id(eventId)
                    .aggregateType(aggregateType)
                    .aggregateId(aggregateId.toString())
                    .eventType(eventType)
                    .payload(payload)
                    .status("NEW")
                    .attempts(0)
                    .createdAt(LocalDateTime.now())
                    .build();

            // 3. Save to DB
            outboxRepository.save(out);

        } catch (Exception e) {
            log.error("CRITICAL: Failed to create and save outbox event for {}: {}", eventType, aggregateId, e);
            throw new AppException(ErrorCode.DATABASE_ERROR);
        }
    }
    
    // Add helper if missing
    private String fetchVariantName(Long variantId) {
         try {
            String url = vehicleServiceUri + "/vehicle-catalog/variants/" + variantId;
            ApiRespond<Map<String, Object>> response = restTemplate.exchange(
                    url,
                    org.springframework.http.HttpMethod.GET,
                    null,
                    new org.springframework.core.ParameterizedTypeReference<ApiRespond<Map<String, Object>>>() {}
            ).getBody();
            if (response != null && response.getData() != null) {
                return (String) response.getData().get("versionName");
            }
        } catch (Exception e) {
            log.warn("Failed to fetch variant name: {}", e.getMessage());
        }
        return "Unknown Variant";
    }

    private UUID findDealerByName(String name) {
        try {
            String url = dealerServiceUrl + "/api/dealers/list-all";

            // Or use search endpoint: /api/dealers?search=name
            // We use list-all here as it returns simpler DTOs and we can filter.
            // Or better, search directly if API supports strict search.
            // Based on DealerController, /api/dealers?search=... calls
            // searchDealers(search)

            String searchUrl = dealerServiceUrl + "/api/dealers?search="
                    + java.net.URLEncoder.encode(name, java.nio.charset.StandardCharsets.UTF_8);
            org.springframework.http.ResponseEntity<Map> responseEntity = restTemplate.exchange(
                    searchUrl,
                    org.springframework.http.HttpMethod.GET,
                    null,
                    Map.class);

            Map<String, Object> response = responseEntity.getBody();
            if (response != null && Boolean.TRUE.equals(response.get("success"))) {
                List<Map<String, Object>> dealers = (List<Map<String, Object>>) response.get("data");
                if (dealers != null && !dealers.isEmpty()) {
                    // Pick the first one
                    String idStr = (String) dealers.get(0).get("dealerId");
                    return UUID.fromString(idStr);
                }
            }
            return null;
        } catch (Exception e) {
            log.error("Error calling Dealer Service to find dealer: {}", name, e);
            return null;
        }
    }

    @Override
    @Transactional
    public SalesContractResponse convertToContract(UUID orderId) {
        // Lấy đơn hàng
        SalesOrder order = salesOrderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.SALES_ORDER_NOT_FOUND));

        // Kiểm tra trạng thái đơn hàng
        if (order.getOrderStatusB2C() != OrderStatusB2C.CONFIRMED) {
            throw new AppException(ErrorCode.INVALID_ORDER_STATUS);
            // Nếu muốn thêm chi tiết, có thể dùng constructor: new
            // AppException(ErrorCode.INVALID_ORDER_STATUS, "Chi tiết thêm")
        }

        // Kiểm tra hợp đồng đã tồn tại chưa
        if (order.getSalesContract() != null) {
            throw new AppException(ErrorCode.SALES_CONTRACT_ALREADY_EXISTS);
        }

        // Tạo contract từ template
        SalesContractResponse response = salesContractService.generateContractFromTemplate(orderId);

        log.info("Sales order [{}] converted to contract successfully.", orderId);
        return response;
    }

    @Override
    @Transactional
    public SalesOrderB2CResponse convertToComplete(UUID orderId) {
        // Lấy đơn hàng
        SalesOrder order = salesOrderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.SALES_ORDER_NOT_FOUND));

        // Kiểm tra trạng thái đơn hàng
        if (order.getOrderStatusB2C() != OrderStatusB2C.IN_PRODUCTION) {
            throw new AppException(ErrorCode.INVALID_ORDER_STATUS);
            // Nếu muốn thêm chi tiết, có thể dùng constructor: new
            // AppException(ErrorCode.INVALID_ORDER_STATUS, "Chi tiết thêm")
        }

        // Kiểm tra hợp đồng đã tồn tại chưa
        if (order.getOrderTrackings() != null) {
            throw new AppException(ErrorCode.SALES_CONTRACT_ALREADY_EXISTS);
        }

        order.setOrderStatusB2C(OrderStatusB2C.DELIVERED);
        salesOrderRepository.save(order);

        return mapToResponse(order);
    }

    @Override
    public void handleCustomerOrderConfirmation(UUID orderId, boolean confirmed) {
        SalesOrder order = salesOrderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.DATABASE_ERROR));

        if (confirmed) {
            order.setOrderStatusB2C(OrderStatusB2C.CONFIRMED);
            log.info("Order {} confirmed by customer", orderId);
        } else {
            order.setOrderStatusB2C(OrderStatusB2C.CANCELLED);
            log.info("Order {} cancelled by customer", orderId);
        }

        salesOrderRepository.save(order);
    }

    @Override
    @Transactional
    public SalesOrderB2CResponse markOrderAsEdited(UUID orderId, UUID staffId) {
        SalesOrder salesOrder = salesOrderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.SALES_ORDER_NOT_FOUND));

        // Kiểm tra loại đơn B2C
        if (salesOrder.getTypeOder() != SaleOderType.B2C) {
            throw new AppException(ErrorCode.INVALID_ORDER_TYPE);
        }

        // Chỉ cho phép nếu trạng thái hiện tại là PENDING (có thể tuỳ business)
        if (salesOrder.getOrderStatusB2C() != OrderStatusB2C.PENDING) {
            throw new AppException(ErrorCode.INVALID_ORDER_STATUS);
        }

        // Cập nhật trạng thái
        salesOrder.setOrderStatusB2C(OrderStatusB2C.EDITED);

        SalesOrder updatedOrder = salesOrderRepository.save(salesOrder);
        log.info("Sales order {} marked as EDITED by staff {}", orderId, staffId);

        return mapToResponse(updatedOrder);
    }

    @Override
    public Page<SalesOrderB2CResponse> getAllB2COrders(String status, Pageable pageable) {
        Page<SalesOrder> orderPage;

        if (status != null && !status.isBlank()) {
            try {
                OrderStatusB2C statusEnum = OrderStatusB2C.valueOf(status.toUpperCase());
                orderPage = salesOrderRepository.findByTypeOderAndOrderStatusB2C(
                        SaleOderType.B2C, statusEnum, pageable);
            } catch (IllegalArgumentException e) {
                throw new AppException(ErrorCode.BAD_REQUEST);
            }
        } else {
            // Lấy tất cả đơn hàng B2C
            orderPage = salesOrderRepository.findByTypeOder(SaleOderType.B2C, pageable);
        }

        return orderPage.map(this::mapToResponse);
    }

    private String fetchVariantImage(Long variantId) {
        if (variantId == null)
            return "/placeholder-car.png";
        try {
            String variantUrl = vehicleServiceUri + "/vehicle-catalog/variants/" + variantId;
            ApiRespond<Map<String, Object>> variantResponse = restTemplate.exchange(
                    variantUrl,
                    org.springframework.http.HttpMethod.GET,
                    null,
                    new org.springframework.core.ParameterizedTypeReference<ApiRespond<Map<String, Object>>>() {
                    }).getBody();

            if (variantResponse != null && variantResponse.getData() != null) {
                return (String) ((Map<String, Object>) variantResponse.getData()).get("imageUrl");
            }
        } catch (Exception e) {
            log.warn("Failed to fetch fallback image for variant {}: {}", variantId, e.getMessage());
        }
        return "/placeholder-car.png";
    }

    @Override
    public List<SalesOrderB2CResponse> getAllSalesForReporting(java.time.LocalDateTime since) {
        List<com.ev.sales_service.entity.SalesOrder> orders;
        if (since != null) {
            // Assuming orderDate is the main timestamp. ideally we use updatedAt if available.
            // Using orderDate for now as per entity definition availability.
            orders = salesOrderRepository.findAll().stream()
                    .filter(o -> o.getOrderDate().isAfter(since))
                    .collect(Collectors.toList());
        } else {
            orders = salesOrderRepository.findAll();
        }
        
        return orders.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private String fetchModelName(Long modelId) {
        if (modelId == null) return "Unknown Model";
        try {
            String url = vehicleServiceUri + "/vehicle-catalog/models/" + modelId;
            ApiRespond<Map<String, Object>> response = restTemplate.exchange(
                    url,
                    org.springframework.http.HttpMethod.GET,
                    null,
                    new org.springframework.core.ParameterizedTypeReference<ApiRespond<Map<String, Object>>>() {
                    }).getBody();

            if (response != null && response.getData() != null) {
                return (String) response.getData().get("modelName");
            }
        } catch (Exception e) {
            log.warn("Failed to fetch model name for id {}: {}", modelId, e.getMessage());
        }
        return "Unknown Model";
    }

    private void sendSalesReport(SalesOrder salesOrder, String modelName, Long variantId, String dealerName) {
        CompletableFuture.runAsync(() -> {
            try {
                String url = reportingServiceUrl + "/api/reports/sales";
                
                Map<String, Object> body = new java.util.HashMap<>();
                body.put("orderId", salesOrder.getOrderId());
                body.put("totalAmount", salesOrder.getTotalAmount());
                body.put("orderDate", salesOrder.getOrderDate());
                body.put("modelName", modelName);
                body.put("variantId", variantId);
                body.put("dealerName", dealerName);
                // Region could be inferred from dealer or address
                
                log.info("Sending sales report for Order ID: {}", salesOrder.getOrderId());
                restTemplate.postForObject(url, body, String.class);
            } catch (Exception e) {
                log.error("Failed to send sales report: {}", e.getMessage());
            }
        });
    }
}