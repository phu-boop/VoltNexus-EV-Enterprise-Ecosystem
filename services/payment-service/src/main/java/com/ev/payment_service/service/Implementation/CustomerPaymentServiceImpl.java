package com.ev.payment_service.service.Implementation;

import com.ev.common_lib.dto.respond.ApiRespond;
import com.ev.common_lib.exception.AppException;
import com.ev.common_lib.exception.ErrorCode;
import com.ev.payment_service.dto.external.CustomerInfo;
import com.ev.payment_service.dto.external.SalesOrderData;
import com.ev.payment_service.dto.request.InitiatePaymentRequest;
import com.ev.payment_service.dto.response.InitiatePaymentResponse;
import com.ev.payment_service.dto.response.PaymentRecordResponse;
import com.ev.payment_service.dto.response.PaymentStatisticsResponse;
import com.ev.payment_service.dto.response.TransactionResponse;
import com.ev.payment_service.entity.PaymentMethod;
import com.ev.payment_service.entity.PaymentRecord;
import com.ev.payment_service.entity.Transaction;
import com.ev.payment_service.mapper.TransactionMapper;
import com.ev.payment_service.repository.PaymentMethodRepository;
import com.ev.payment_service.repository.PaymentRecordRepository;
import com.ev.payment_service.repository.TransactionRepository;
import com.ev.payment_service.service.Interface.ICustomerPaymentService;
import com.ev.payment_service.service.Interface.IPaymentRecordService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomerPaymentServiceImpl implements ICustomerPaymentService {

    private final PaymentRecordRepository paymentRecordRepository;
    private final TransactionRepository transactionRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final TransactionMapper transactionMapper;
    private final IPaymentRecordService paymentRecordService;
    private final com.ev.payment_service.repository.CustomerRepository customerRepository;

    // === DYNAMIC CALL (SỬ DỤNG RestTemplate) ===
    private final RestTemplate restTemplate;

    @Value("${sales-service.url}") // Lấy URL từ application.properties
    private String salesServiceUrl;

    @Value("${customer-service.url}") // URL customer service
    private String customerServiceBaseUrl;

    @Override
    @Transactional
    public InitiatePaymentResponse initiatePayment(UUID orderId, InitiatePaymentRequest request, String userEmail,
            UUID userProfileId) {

        // 1. GỌI API ĐỘNG: Lấy thông tin đơn hàng từ sales-service (B2B hoặc B2C)
        log.info("Fetching order details from sales-service for orderId: {}", orderId);
        SalesOrderData orderData = fetchOrderFromSalesService(orderId);

        // (Từ Bước 2 -> 6: Logic giữ nguyên y hệt kế hoạch trước)

        // 2. Kiểm tra totalAmount của đơn hàng
        if (orderData.getTotalAmount() == null || orderData.getTotalAmount().compareTo(BigDecimal.ZERO) <= 0) {
            log.error("Invalid totalAmount in order - OrderId: {}, TotalAmount: {}",
                    orderId, orderData.getTotalAmount());
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        // 3. Lấy (hoặc tạo mới) Sổ thanh toán (PaymentRecord)
        log.info("Finding or creating PaymentRecord for orderId: {}", orderId);
        PaymentRecord record = paymentRecordService.findOrCreateRecord(
                orderData.getOrderId(),
                orderData.getCustomerId(), // customerId giờ đã là Long
                orderData.getTotalAmount());

        // Cập nhật totalAmount nếu SalesOrder có totalAmount khác (đồng bộ với
        // SalesOrder)
        BigDecimal salesOrderTotalAmount = orderData.getTotalAmount();
        if (salesOrderTotalAmount != null &&
                (record.getTotalAmount() == null || record.getTotalAmount().compareTo(salesOrderTotalAmount) != 0)) {
            log.info("Updating PaymentRecord totalAmount - RecordId: {}, Old TotalAmount: {}, New TotalAmount: {}",
                    record.getRecordId(), record.getTotalAmount(), salesOrderTotalAmount);

            // Tính lại remainingAmount dựa trên totalAmount mới và amountPaid hiện tại
            BigDecimal currentAmountPaid = record.getAmountPaid() != null ? record.getAmountPaid() : BigDecimal.ZERO;
            BigDecimal newRemainingAmount = salesOrderTotalAmount.subtract(currentAmountPaid);

            record.setTotalAmount(salesOrderTotalAmount);
            record.setRemainingAmount(newRemainingAmount);

            // Cập nhật status nếu cần
            if (newRemainingAmount.compareTo(BigDecimal.ZERO) <= 0 && !"PAID".equals(record.getStatus())) {
                record.setStatus("PAID");
            } else if (newRemainingAmount.compareTo(BigDecimal.ZERO) > 0 &&
                    salesOrderTotalAmount.compareTo(currentAmountPaid) > 0 &&
                    "PAID".equals(record.getStatus())) {
                record.setStatus("PARTIALLY_PAID");
            }

            record = paymentRecordRepository.save(record);
            log.info(
                    "PaymentRecord updated - RecordId: {}, TotalAmount: {}, AmountPaid: {}, RemainingAmount: {}, Status: {}",
                    record.getRecordId(), record.getTotalAmount(), record.getAmountPaid(),
                    record.getRemainingAmount(), record.getStatus());
        }

        log.info("PaymentRecord found/created - RecordId: {}, OrderId: {}, TotalAmount: {}, RemainingAmount: {}",
                record.getRecordId(), record.getOrderId(), record.getTotalAmount(), record.getRemainingAmount());

        // 4. Xác thực số tiền
        BigDecimal remainingAmount = record.getRemainingAmount();
        log.info("Validating amount - Request Amount: {}, Remaining Amount: {}", request.getAmount(), remainingAmount);

        // Kiểm tra số tiền phải > 0
        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            log.error("Amount validation failed - Request amount must be greater than 0, got: {}", request.getAmount());
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        // Kiểm tra số tiền không được vượt quá số tiền còn lại
        if (request.getAmount().compareTo(remainingAmount) > 0) {
            log.error("Amount validation failed - Request amount {} is greater than remaining amount {}",
                    request.getAmount(), remainingAmount);
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        // Kiểm tra PaymentRecord không được đã thanh toán đầy đủ
        if ("PAID".equals(record.getStatus())) {
            log.error("PaymentRecord is already PAID - RecordId: {}, OrderId: {}", record.getRecordId(), orderId);
            throw new AppException(ErrorCode.INVALID_STATE);
        }

        // 5. Lấy PTTT
        log.info("Finding PaymentMethod with id: {}", request.getPaymentMethodId());
        PaymentMethod method = paymentMethodRepository.findById(request.getPaymentMethodId())
                .orElseThrow(() -> {
                    log.error("PaymentMethod not found with id: {}", request.getPaymentMethodId());
                    return new AppException(ErrorCode.DATA_NOT_FOUND);
                });
        log.info("PaymentMethod found - MethodId: {}, MethodName: {}, MethodType: {}",
                method.getMethodId(), method.getMethodName(), method.getMethodType());

        // 6. Tạo Giao dịch (Transaction)
        log.info("Creating Transaction - OrderId: {}, Amount: {}, PaymentMethodId: {}",
                orderId, request.getAmount(), request.getPaymentMethodId());
        Transaction transaction = Transaction.builder()
                .paymentRecord(record)
                .paymentMethod(method)
                .amount(request.getAmount())
                .status("PENDING")
                .notes(request.getNotes())
                .build();
        Transaction savedTransaction = transactionRepository.save(transaction);
        log.info("Transaction created successfully - TransactionId: {}", savedTransaction.getTransactionId());

        // 7. Xử lý theo loại PTTT
        if (method.getMethodType() == com.ev.payment_service.enums.PaymentMethodType.MANUAL) {
            return InitiatePaymentResponse.builder()
                    .transactionId(savedTransaction.getTransactionId())
                    .status("PENDING_CONFIRMATION")
                    .message("Đã tạo yêu cầu thanh toán. Chờ đại lý xác nhận.")
                    .build();
        } else {
            // (Logic VNPAY)
            return InitiatePaymentResponse.builder()
                    .transactionId(savedTransaction.getTransactionId())
                    .status("PENDING_GATEWAY")
                    .paymentUrl("https://sandbox.vnpayment.vn/...") // (URL giả lập)
                    .message("Đang chuyển đến cổng thanh toán...")
                    .build();
        }
    }

    /**
     * Fetch order từ Sales Service - Thử cả B2B và B2C, ưu tiên endpoint nào trả về
     * data hợp lệ
     * Logic: Thử B2B trước, nếu không tìm thấy (404) hoặc không có customerId (có
     * thể là B2B order nhưng payment service cần customerId),
     * thì thử B2C. Nếu cả 2 đều fail, throw error.
     */
    private SalesOrderData fetchOrderFromSalesService(UUID orderId) {
        // Thử B2B endpoint trước
        SalesOrderData b2bOrderData = null;
        try {
            log.info("Attempting to fetch order from B2B endpoint - OrderId: {}", orderId);
            b2bOrderData = fetchB2BOrder(orderId);
            // Nếu B2B order có customerId (có thể là B2C order nhưng được trả về từ B2B
            // endpoint), sử dụng nó
            if (b2bOrderData != null && b2bOrderData.getCustomerId() != null) {
                log.info("Found order from B2B endpoint with customerId - OrderId: {}, CustomerId: {}",
                        orderId, b2bOrderData.getCustomerId());
                return b2bOrderData;
            }
            // Nếu B2B order không có customerId (là B2B order thực sự), vẫn sử dụng nó
            log.info("Found B2B order (no customerId) - OrderId: {}", orderId);
            return b2bOrderData;
        } catch (RestClientException e) {
            log.warn(
                    "Failed to fetch from B2B endpoint (might be B2C order), trying B2C endpoint - OrderId: {}, Error: {}",
                    orderId, e.getMessage());
        }

        // Thử B2C endpoint nếu B2B không tìm thấy
        try {
            log.info("Attempting to fetch order from B2C endpoint - OrderId: {}", orderId);
            SalesOrderData b2cOrderData = fetchB2COrder(orderId);
            // B2C order phải có customerId (đã validate trong fetchB2COrder)
            log.info("Found order from B2C endpoint - OrderId: {}, CustomerId: {}",
                    orderId, b2cOrderData.getCustomerId());
            return b2cOrderData;
        } catch (RestClientException e) {
            log.error("Failed to fetch order from both B2B and B2C endpoints - OrderId: {}", orderId);
            // Nếu B2B đã tìm thấy nhưng không có customerId, trả về B2B data
            if (b2bOrderData != null) {
                log.warn("Returning B2B order data (no customerId) - OrderId: {}", orderId);
                return b2bOrderData;
            }
            throw new AppException(ErrorCode.DOWNSTREAM_SERVICE_UNAVAILABLE);
        }
    }

    /**
     * Fetch B2B order từ Sales Service
     * Endpoint: GET /sales-orders/{orderId}
     * Response: ApiRespond<SalesOrderDtoB2B>
     * 
     * @throws RestClientException nếu order không tìm thấy hoặc có lỗi
     */
    private SalesOrderData fetchB2BOrder(UUID orderId) throws RestClientException {
        String url = salesServiceUrl + "/sales-orders/" + orderId;
        log.info("Calling B2B endpoint: {}", url);

        ParameterizedTypeReference<ApiRespond<Map<String, Object>>> responseType = new ParameterizedTypeReference<ApiRespond<Map<String, Object>>>() {
        };

        ResponseEntity<ApiRespond<Map<String, Object>>> response;
        try {
            response = restTemplate.exchange(url, HttpMethod.GET, null, responseType);
        } catch (RestClientException e) {
            log.error("Failed to call B2B endpoint - OrderId: {}, Error: {}", orderId, e.getMessage());
            throw e; // Re-throw để caller có thể xử lý
        }

        ApiRespond<Map<String, Object>> apiResponse = response.getBody();
        if (apiResponse == null || apiResponse.getData() == null) {
            log.error("Failed to fetch B2B order: Response or data is null");
            throw new AppException(ErrorCode.DOWNSTREAM_SERVICE_UNAVAILABLE);
        }

        Map<String, Object> salesOrderMap = apiResponse.getData();
        SalesOrderData orderData = mapB2BOrderToSalesOrderData(salesOrderMap);
        log.info("Successfully fetched B2B order - OrderId: {}, CustomerId: {}, TotalAmount: {}",
                orderData.getOrderId(), orderData.getCustomerId(), orderData.getTotalAmount());
        return orderData;
    }

    /**
     * Fetch B2C order từ Sales Service
     * Endpoint: GET /api/v1/sales-orders/b2c/{orderId}
     * Response: ApiRespond<SalesOrderB2CResponse>
     * 
     * @throws RestClientException nếu order không tìm thấy hoặc có lỗi
     */
    private SalesOrderData fetchB2COrder(UUID orderId) throws RestClientException {
        String url = salesServiceUrl + "/api/v1/sales-orders/b2c/" + orderId;
        log.info("Calling B2C endpoint: {}", url);

        ParameterizedTypeReference<ApiRespond<Map<String, Object>>> responseType = new ParameterizedTypeReference<ApiRespond<Map<String, Object>>>() {
        };

        ResponseEntity<ApiRespond<Map<String, Object>>> response;
        try {
            response = restTemplate.exchange(url, HttpMethod.GET, null, responseType);
        } catch (RestClientException e) {
            log.error("Failed to call B2C endpoint - OrderId: {}, Error: {}", orderId, e.getMessage());
            throw e; // Re-throw để caller có thể xử lý
        }

        ApiRespond<Map<String, Object>> apiResponse = response.getBody();
        if (apiResponse == null || apiResponse.getData() == null) {
            log.error("Failed to fetch B2C order: Response or data is null");
            throw new AppException(ErrorCode.DOWNSTREAM_SERVICE_UNAVAILABLE);
        }

        Map<String, Object> salesOrderMap = apiResponse.getData();
        SalesOrderData orderData = mapB2COrderToSalesOrderData(salesOrderMap);
        log.info("Successfully fetched B2C order - OrderId: {}, CustomerId: {}, TotalAmount: {}",
                orderData.getOrderId(), orderData.getCustomerId(), orderData.getTotalAmount());
        return orderData;
    }

    /**
     * Map B2B order response (SalesOrderDtoB2B) sang SalesOrderData
     */
    private SalesOrderData mapB2BOrderToSalesOrderData(Map<String, Object> salesOrderMap) {
        SalesOrderData data = new SalesOrderData();

        // Parse orderId
        if (salesOrderMap.get("orderId") != null) {
            try {
                Object orderIdObj = salesOrderMap.get("orderId");
                if (orderIdObj instanceof UUID) {
                    data.setOrderId((UUID) orderIdObj);
                } else {
                    String orderIdStr = orderIdObj.toString();
                    data.setOrderId(UUID.fromString(orderIdStr));
                }
            } catch (Exception e) {
                log.error("Failed to parse orderId - Value: {}, Error: {}",
                        salesOrderMap.get("orderId"), e.getMessage());
                throw new AppException(ErrorCode.BAD_REQUEST);
            }
        } else {
            log.error("orderId is null in sales order response");
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        // Parse totalAmount
        if (salesOrderMap.get("totalAmount") != null) {
            Object totalAmountObj = salesOrderMap.get("totalAmount");
            try {
                if (totalAmountObj instanceof Number) {
                    data.setTotalAmount(BigDecimal.valueOf(((Number) totalAmountObj).doubleValue()));
                } else if (totalAmountObj instanceof String) {
                    data.setTotalAmount(new BigDecimal((String) totalAmountObj));
                } else {
                    log.warn("Cannot parse totalAmount - OrderId: {}, Type: {}",
                            data.getOrderId(), totalAmountObj != null ? totalAmountObj.getClass().getName() : "null");
                    data.setTotalAmount(BigDecimal.ZERO);
                }
            } catch (Exception e) {
                log.error("Failed to parse totalAmount - OrderId: {}, Error: {}",
                        data.getOrderId(), e.getMessage());
                data.setTotalAmount(BigDecimal.ZERO);
            }
        } else {
            log.warn("totalAmount is null in sales order - OrderId: {}", data.getOrderId());
            data.setTotalAmount(BigDecimal.ZERO);
        }

        // Parse customerId (Long) từ SalesOrder hoặc quotation
        // SalesOrder.customerId bây giờ đã là Long (bigint), không phải UUID nữa
        data.setCustomerId(null);

        // Ưu tiên lấy customerId từ SalesOrder trước (đã là Long)
        if (salesOrderMap.get("customerId") != null) {
            try {
                Object customerIdObj = salesOrderMap.get("customerId");
                if (customerIdObj instanceof Number) {
                    data.setCustomerId(((Number) customerIdObj).longValue());
                    log.info("Found customerId from SalesOrder - OrderId: {}, CustomerId: {}",
                            data.getOrderId(), data.getCustomerId());
                } else {
                    log.warn("CustomerId from SalesOrder is not a Number - OrderId: {}, Type: {}",
                            data.getOrderId(), customerIdObj != null ? customerIdObj.getClass().getName() : "null");
                }
            } catch (Exception e) {
                log.warn("Failed to parse customerId from SalesOrder - OrderId: {}, Error: {}",
                        data.getOrderId(), e.getMessage());
            }
        }

        // Nếu không có từ SalesOrder, thử lấy từ quotation (fallback)
        if (data.getCustomerId() == null && salesOrderMap.get("quotation") != null) {
            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> quotationMap = (Map<String, Object>) salesOrderMap.get("quotation");
                if (quotationMap.get("customerId") != null) {
                    Object customerIdObj = quotationMap.get("customerId");
                    if (customerIdObj instanceof Number) {
                        data.setCustomerId(((Number) customerIdObj).longValue());
                        log.info("Found customerId from quotation (fallback) - OrderId: {}, CustomerId: {}",
                                data.getOrderId(), data.getCustomerId());
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to parse customerId from quotation - OrderId: {}, Error: {}",
                        data.getOrderId(), e.getMessage());
            }
        }

        // Nếu vẫn không có, log warning (có thể là B2B order)
        if (data.getCustomerId() == null) {
            log.warn("CustomerId is null for OrderId: {} (may be a B2B order)", data.getOrderId());
        }

        // Parse orderStatus từ B2B order
        // SalesOrderDtoB2B có orderStatus (B2B) và có thể có orderStatusB2C (nếu là B2C
        // order nhưng được trả về từ B2B endpoint)
        String orderStatus = parseOrderStatus(salesOrderMap, "orderStatusB2C", "orderStatus");
        data.setOrderStatusB2C(orderStatus);

        log.info("Parsed B2B order - OrderId: {}, CustomerId: {}, TotalAmount: {}, Status: {}",
                data.getOrderId(), data.getCustomerId(), data.getTotalAmount(), data.getOrderStatusB2C());

        return data;
    }

    /**
     * Map B2C order response (SalesOrderB2CResponse) sang SalesOrderData
     */
    private SalesOrderData mapB2COrderToSalesOrderData(Map<String, Object> salesOrderMap) {
        SalesOrderData data = new SalesOrderData();

        // Parse orderId
        if (salesOrderMap.get("orderId") != null) {
            try {
                Object orderIdObj = salesOrderMap.get("orderId");
                if (orderIdObj instanceof UUID) {
                    data.setOrderId((UUID) orderIdObj);
                } else {
                    String orderIdStr = orderIdObj.toString();
                    data.setOrderId(UUID.fromString(orderIdStr));
                }
            } catch (Exception e) {
                log.error("Failed to parse orderId - Value: {}, Error: {}",
                        salesOrderMap.get("orderId"), e.getMessage());
                throw new AppException(ErrorCode.BAD_REQUEST);
            }
        } else {
            log.error("orderId is null in B2C order response");
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        // Parse totalAmount
        if (salesOrderMap.get("totalAmount") != null) {
            Object totalAmountObj = salesOrderMap.get("totalAmount");
            try {
                if (totalAmountObj instanceof Number) {
                    data.setTotalAmount(BigDecimal.valueOf(((Number) totalAmountObj).doubleValue()));
                } else if (totalAmountObj instanceof String) {
                    data.setTotalAmount(new BigDecimal((String) totalAmountObj));
                } else {
                    log.warn("Cannot parse totalAmount - OrderId: {}, Type: {}",
                            data.getOrderId(), totalAmountObj.getClass().getName());
                    data.setTotalAmount(BigDecimal.ZERO);
                }
            } catch (Exception e) {
                log.error("Failed to parse totalAmount - OrderId: {}, Error: {}",
                        data.getOrderId(), e.getMessage());
                data.setTotalAmount(BigDecimal.ZERO);
            }
        } else {
            log.warn("totalAmount is null in B2C order - OrderId: {}", data.getOrderId());
            data.setTotalAmount(BigDecimal.ZERO);
        }

        // Parse customerId (Long) từ B2C order
        // SalesOrderB2CResponse.customerId là Long
        if (salesOrderMap.get("customerId") != null) {
            try {
                Object customerIdObj = salesOrderMap.get("customerId");
                if (customerIdObj instanceof Number) {
                    data.setCustomerId(((Number) customerIdObj).longValue());
                    log.info("Found customerId from B2C order - OrderId: {}, CustomerId: {}",
                            data.getOrderId(), data.getCustomerId());
                } else {
                    log.warn("CustomerId from B2C order is not a Number - OrderId: {}, Type: {}",
                            data.getOrderId(), customerIdObj != null ? customerIdObj.getClass().getName() : "null");
                }
            } catch (Exception e) {
                log.warn("Failed to parse customerId from B2C order - OrderId: {}, Error: {}",
                        data.getOrderId(), e.getMessage());
            }
        }

        // Nếu không có customerId, thử lấy từ quotation (fallback)
        if (data.getCustomerId() == null && salesOrderMap.get("quotation") != null) {
            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> quotationMap = (Map<String, Object>) salesOrderMap.get("quotation");
                if (quotationMap.get("customerId") != null) {
                    Object customerIdObj = quotationMap.get("customerId");
                    if (customerIdObj instanceof Number) {
                        data.setCustomerId(((Number) customerIdObj).longValue());
                        log.info("Found customerId from quotation (fallback) - OrderId: {}, CustomerId: {}",
                                data.getOrderId(), data.getCustomerId());
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to parse customerId from quotation - OrderId: {}, Error: {}",
                        data.getOrderId(), e.getMessage());
            }
        }

        // B2C order phải có customerId
        if (data.getCustomerId() == null) {
            log.error("CustomerId is null for B2C order - OrderId: {}", data.getOrderId());
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        // Parse orderStatusB2C từ B2C order
        // SalesOrderB2CResponse có orderStatusB2C
        String orderStatus = parseOrderStatus(salesOrderMap, "orderStatusB2C", null);
        data.setOrderStatusB2C(orderStatus);

        log.info("Parsed B2C order - OrderId: {}, CustomerId: {}, TotalAmount: {}, Status: {}",
                data.getOrderId(), data.getCustomerId(), data.getTotalAmount(), data.getOrderStatusB2C());

        return data;
    }

    /**
     * Helper method để parse order status từ response map
     * 
     * @param salesOrderMap       Map chứa order data
     * @param primaryStatusField  Field chính để lấy status (ưu tiên)
     * @param fallbackStatusField Field fallback để lấy status (nếu primary không
     *                            có)
     * @return Status string
     */
    private String parseOrderStatus(Map<String, Object> salesOrderMap, String primaryStatusField,
            String fallbackStatusField) {
        String status = null;

        // Ưu tiên lấy từ primary field
        if (primaryStatusField != null && salesOrderMap.get(primaryStatusField) != null) {
            Object statusObj = salesOrderMap.get(primaryStatusField);
            if (statusObj instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> statusMap = (Map<String, Object>) statusObj;
                status = statusMap.get("name") != null ? statusMap.get("name").toString() : null;
            } else {
                status = statusObj.toString();
            }
        }

        // Nếu không có, thử fallback field
        if (status == null && fallbackStatusField != null && salesOrderMap.get(fallbackStatusField) != null) {
            Object statusObj = salesOrderMap.get(fallbackStatusField);
            if (statusObj instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> statusMap = (Map<String, Object>) statusObj;
                status = statusMap.get("name") != null ? statusMap.get("name").toString() : "UNKNOWN";
            } else {
                status = statusObj.toString();
            }
        }

        return status != null ? status : "UNKNOWN";
    }

    /**
     * Update order status trong Sales Service - Thử B2C trước, nếu không tìm thấy
     * thì thử B2B
     * B2C endpoint: PUT /api/v1/sales-orders/b2c/{orderId}/status?status={status}
     * B2B endpoint: (Hiện tại chưa có endpoint update status riêng, có thể cần tạo
     * hoặc skip)
     */
    private void updateOrderStatusInSalesService(UUID orderId, String status) {
        log.info("Updating order status in sales-service - OrderId: {}, Status: {}", orderId, status);

        // Thử B2C endpoint trước (vì B2C orders phổ biến hơn trong payment flow)
        try {
            String b2cUrl = salesServiceUrl + "/api/v1/sales-orders/b2c/" + orderId + "/status?status=" + status;
            log.info("Attempting to update B2C order status: {}", b2cUrl);
            restTemplate.put(b2cUrl, null);
            log.info("Successfully updated B2C order status in sales-service for orderId: {}", orderId);
            return;
        } catch (RestClientException e) {
            log.warn("Failed to update B2C order status, order might be B2B - OrderId: {}, Error: {}",
                    orderId, e.getMessage());
            // B2B orders thường không có endpoint update status riêng trong payment flow
            // Chỉ log warning, không throw error vì payment đã thành công
            log.info("B2B orders typically don't require status update from payment service - OrderId: {}", orderId);
            // TODO: Nếu B2B cần update status, implement B2B endpoint update logic here
        }
    }

    /**
     * Update payment status trong Sales Service (works for both B2B and B2C)
     * Endpoint: PUT /api/v1/sales-orders/{orderId}/payment-status?status={status}
     */
    private void updateOrderPaymentStatusInSalesService(UUID orderId, String paymentStatus) {
        log.info("Updating order payment status in sales-service - OrderId: {}, PaymentStatus: {}", orderId,
                paymentStatus);

        try {
            String url = salesServiceUrl + "/api/v1/sales-orders/" + orderId + "/payment-status?status="
                    + paymentStatus;
            log.info("Attempting to update order payment status: {}", url);
            restTemplate.put(url, null);
            log.info("Successfully updated order payment status in sales-service for orderId: {}, PaymentStatus: {}",
                    orderId, paymentStatus);
        } catch (RestClientException e) {
            log.error(
                    "Failed to update order payment status in sales-service - OrderId: {}, PaymentStatus: {}, Error: {}",
                    orderId, paymentStatus, e.getMessage());
            // Log error nhưng không throw exception vì payment đã thành công
            // Payment status update là optional, không ảnh hưởng đến payment flow
        }
    }

    private PaymentRecord createNewPaymentRecord(SalesOrderData orderData) {
        BigDecimal totalAmount = orderData.getTotalAmount() != null ? orderData.getTotalAmount() : BigDecimal.ZERO;
        BigDecimal amountPaid = BigDecimal.ZERO;
        BigDecimal remainingAmount = totalAmount.subtract(amountPaid);

        PaymentRecord newRecord = PaymentRecord.builder()
                .orderId(orderData.getOrderId())
                .customerId(orderData.getCustomerId()) // Có thể null nếu không tìm thấy
                .totalAmount(totalAmount)
                .amountPaid(amountPaid)
                .remainingAmount(remainingAmount) // Set explicitly
                .status("PENDING")
                .build();

        log.info("Creating new PaymentRecord - OrderId: {}, TotalAmount: {}, RemainingAmount: {}, CustomerId: {}",
                orderData.getOrderId(), totalAmount, remainingAmount, orderData.getCustomerId());

        return paymentRecordRepository.save(newRecord);
    }

    @Override
    @Transactional
    public TransactionResponse confirmManualPayment(UUID transactionId, String userEmail, UUID userProfileId,
            String notes, String action) {
        log.info("Processing manual payment - TransactionId: {}, Action: {}, UserEmail: {}, Notes: {}",
                transactionId, action, userEmail, notes);

        // 1. Tìm giao dịch
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> {
                    log.error("Transaction not found with id: {}", transactionId);
                    return new AppException(ErrorCode.DATA_NOT_FOUND);
                });

        // 2. Kiểm tra trạng thái giao dịch
        if (!"PENDING".equals(transaction.getStatus())) {
            log.error("Transaction is not in PENDING status - TransactionId: {}, Status: {}",
                    transactionId, transaction.getStatus());
            throw new AppException(ErrorCode.INVALID_STATE);
        }

        // HANDLE REJECT
        if ("REJECT".equalsIgnoreCase(action)) {
            transaction.setStatus("FAILED");
            if (notes != null && !notes.isBlank()) {
                transaction.setNotes(notes);
            }
            Transaction savedTransaction = transactionRepository.save(transaction);
            log.info("Transaction REJECTED/FAILED - TransactionId: {}", transactionId);

            return transactionMapper.toResponse(savedTransaction);
        }

        // HANDLE APPROVE
        // 3. Kiểm tra PaymentRecord không được đã thanh toán đầy đủ cho action APPROVE
        PaymentRecord record = transaction.getPaymentRecord();
        if ("PAID".equals(record.getStatus())) {
            log.error("PaymentRecord is already PAID - RecordId: {}, OrderId: {}",
                    record.getRecordId(), record.getOrderId());
            throw new AppException(ErrorCode.INVALID_STATE);
        }

        // 4. Cập nhật Transaction
        transaction.setStatus("SUCCESS");
        // Cập nhật notes nếu có (ghi đè notes cũ nếu có notes mới từ Dealer Manager)
        if (notes != null && !notes.isBlank()) {
            transaction.setNotes(notes);
            log.info("Transaction notes updated - TransactionId: {}, Notes: {}", transactionId, notes);
        }
        Transaction savedTransaction = transactionRepository.save(transaction);
        log.info("Transaction updated to SUCCESS - TransactionId: {}", transactionId);

        // 5. Cập nhật PaymentRecord
        BigDecimal newAmountPaid = record.getAmountPaid().add(transaction.getAmount());
        record.setAmountPaid(newAmountPaid);

        // Tính remainingAmount để kiểm tra status (remainingAmount sẽ được tính tự động
        // bởi @PreUpdate khi save)
        BigDecimal calculatedRemainingAmount = record.getTotalAmount().subtract(newAmountPaid);

        if (calculatedRemainingAmount.compareTo(BigDecimal.ZERO) <= 0) {
            record.setStatus("PAID");
            log.info("PaymentRecord updated to PAID - RecordId: {}, OrderId: {}",
                    record.getRecordId(), record.getOrderId());
        } else {
            record.setStatus("PARTIALLY_PAID");
            log.info("PaymentRecord updated to PARTIALLY_PAID - RecordId: {}, OrderId: {}, RemainingAmount: {}",
                    record.getRecordId(), record.getOrderId(), calculatedRemainingAmount);
        }

        // Save sẽ trigger @PreUpdate để tự động tính remainingAmount
        PaymentRecord savedRecord = paymentRecordRepository.save(record);
        log.info("PaymentRecord saved - RecordId: {}, AmountPaid: {}, RemainingAmount: {}",
                savedRecord.getRecordId(), savedRecord.getAmountPaid(), savedRecord.getRemainingAmount());

        // 6. GỌI API ĐỘNG (DÙNG RestTemplate): Cập nhật payment status trong
        // sales-service
        // Cập nhật payment status dựa trên status của PaymentRecord
        String paymentStatus;
        if ("PAID".equals(savedRecord.getStatus())) {
            paymentStatus = "PAID";
            // Also update order status if fully paid
            updateOrderStatusInSalesService(savedRecord.getOrderId(), "CONFIRMED");
        } else if ("PARTIALLY_PAID".equals(savedRecord.getStatus())) {
            paymentStatus = "PARTIALLY_PAID";
        } else {
            paymentStatus = "UNPAID";
        }

        // Update payment status in sales-service (works for both B2B and B2C)
        updateOrderPaymentStatusInSalesService(savedRecord.getOrderId(), paymentStatus);

        return transactionMapper.toResponse(savedTransaction);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponse> getPaymentHistory(UUID orderId) {
        // (Logic giữ nguyên)
        List<Transaction> transactions = transactionRepository.findByPaymentRecord_OrderId(orderId);
        return transactions.stream()
                .map(transactionMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getCustomerTotalDebt(Long customerId) {
        log.info("Calculating total debt for customer: {}", customerId);

        if (customerId == null) {
            log.warn("CustomerId is null, returning zero debt");
            return BigDecimal.ZERO;
        }

        // Lấy tất cả PaymentRecord của khách hàng
        List<PaymentRecord> records = paymentRecordRepository.findByCustomerId(customerId);

        if (records == null || records.isEmpty()) {
            log.info("No payment records found for customer: {}", customerId);
            return BigDecimal.ZERO;
        }

        // Tính tổng remainingAmount (công nợ còn lại)
        // Chỉ tính các record chưa thanh toán đầy đủ (status != PAID)
        BigDecimal totalDebt = records.stream()
                .filter(record -> record != null &&
                        record.getRemainingAmount() != null &&
                        !"PAID".equals(record.getStatus()) &&
                        record.getRemainingAmount().compareTo(BigDecimal.ZERO) > 0)
                .map(PaymentRecord::getRemainingAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        log.info("Total debt for customer {}: {} (from {} records)", customerId, totalDebt, records.size());
        return totalDebt;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TransactionResponse> getPendingCashPaymentsB2C(Pageable pageable) {
        log.info("Fetching pending cash payments for B2C orders");
        Page<Transaction> transactions = transactionRepository.findPendingManualTransactions(pageable);
        return transactions.map(transactionMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PaymentRecordResponse> filterPaymentRecords(
            String status,
            LocalDateTime startDate,
            LocalDateTime endDate,
            UUID orderId,
            Long customerId,
            Pageable pageable) {

        log.info("Filtering payment records - status: {}, startDate: {}, endDate: {}, orderId: {}, customerId: {}",
                status, startDate, endDate, orderId, customerId);

        // Build query với criteria
        Page<PaymentRecord> records;

        // Nếu có orderId, tìm trực tiếp
        if (orderId != null) {
            PaymentRecord record = paymentRecordRepository.findByOrderId(orderId).orElse(null);
            if (record != null) {
                return new org.springframework.data.domain.PageImpl<>(
                        java.util.Collections.singletonList(mapToPaymentRecordResponse(record)),
                        pageable,
                        1);
            } else {
                return Page.empty(pageable);
            }
        }

        // Nếu chỉ có customerId
        if (customerId != null && status == null && startDate == null && endDate == null) {
            List<PaymentRecord> customerRecords = paymentRecordRepository.findByCustomerId(customerId);
            return new org.springframework.data.domain.PageImpl<>(
                    customerRecords.stream()
                            .map(this::mapToPaymentRecordResponse)
                            .collect(java.util.stream.Collectors.toList()),
                    pageable,
                    customerRecords.size());
        }

        // Nếu chỉ có status
        if (status != null && customerId == null && startDate == null && endDate == null) {
            List<PaymentRecord> statusRecords = paymentRecordRepository.findByStatus(status);
            return new org.springframework.data.domain.PageImpl<>(
                    statusRecords.stream()
                            .map(this::mapToPaymentRecordResponse)
                            .collect(java.util.stream.Collectors.toList()),
                    pageable,
                    statusRecords.size());
        }

        // Trường hợp tổng quát: lấy tất cả và filter trong memory (simple
        // implementation)
        // TODO: Nên dùng JPA Specification cho performance tốt hơn
        List<PaymentRecord> allRecords = paymentRecordRepository.findAll();

        java.util.stream.Stream<PaymentRecord> stream = allRecords.stream();

        // Apply filters
        if (status != null && !status.isEmpty()) {
            stream = stream.filter(r -> status.equals(r.getStatus()));
        }

        if (customerId != null) {
            stream = stream.filter(r -> customerId.equals(r.getCustomerId()));
        }

        if (startDate != null) {
            stream = stream.filter(r -> r.getCreatedAt() != null &&
                    !r.getCreatedAt().isBefore(startDate));
        }

        if (endDate != null) {
            stream = stream.filter(r -> r.getCreatedAt() != null &&
                    !r.getCreatedAt().isAfter(endDate));
        }

        List<PaymentRecordResponse> filtered = stream
                .map(this::mapToPaymentRecordResponse)
                .collect(java.util.stream.Collectors.toList());

        // Manual pagination
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), filtered.size());

        List<PaymentRecordResponse> pageContent = start < filtered.size()
                ? filtered.subList(start, end)
                : java.util.Collections.emptyList();

        log.info("Returning page - Total filtered: {}, Page size: {}, Page content size: {}, Start: {}, End: {}",
                filtered.size(), pageable.getPageSize(), pageContent.size(), start, end);

        return new org.springframework.data.domain.PageImpl<>(pageContent, pageable, filtered.size());
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentStatisticsResponse getPaymentStatistics(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Getting payment statistics - startDate: {}, endDate: {}", startDate, endDate);

        // Lấy tất cả payment records
        List<PaymentRecord> allRecords = paymentRecordRepository.findAll();

        // Filter theo date nếu có
        java.util.stream.Stream<PaymentRecord> recordStream = allRecords.stream();

        if (startDate != null) {
            recordStream = recordStream.filter(r -> r.getCreatedAt() != null &&
                    !r.getCreatedAt().isBefore(startDate));
        }

        if (endDate != null) {
            recordStream = recordStream.filter(r -> r.getCreatedAt() != null &&
                    !r.getCreatedAt().isAfter(endDate));
        }

        List<PaymentRecord> filteredRecords = recordStream.collect(java.util.stream.Collectors.toList());
        log.info("Calculating statistics for {} filtered payment records", filteredRecords.size());

        filteredRecords.forEach(r -> {
            log.info("Record ID: {}, Status: '{}' (len={}), TotalAmount: {}",
                    r.getRecordId(),
                    r.getStatus(),
                    r.getStatus() != null ? r.getStatus().length() : 0,
                    r.getTotalAmount());
        });

        // Tính toán thống kê
        // Tính toán thống kê với null-check và ignore case
        long totalOrders = filteredRecords.size();

        long completedOrders = filteredRecords.stream()
                .filter(r -> r.getStatus() != null && "PAID".equalsIgnoreCase(r.getStatus().trim()))
                .count();

        long pendingOrders = filteredRecords.stream()
                .filter(r -> r.getStatus() != null &&
                        ("PENDING_DEPOSIT".equalsIgnoreCase(r.getStatus().trim()) ||
                                "PENDING".equalsIgnoreCase(r.getStatus().trim())))
                .count();

        long failedOrders = filteredRecords.stream()
                .filter(r -> r.getStatus() != null && "FAILED".equalsIgnoreCase(r.getStatus().trim()))
                .count();

        long cancelledOrders = filteredRecords.stream()
                .filter(r -> r.getStatus() != null && "CANCELLED".equalsIgnoreCase(r.getStatus().trim()))
                .count();

        BigDecimal totalRevenue = filteredRecords.stream()
                .filter(r -> r.getStatus() != null && "PAID".equalsIgnoreCase(r.getStatus().trim()))
                .map(PaymentRecord::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal completedAmount = filteredRecords.stream()
                .map(PaymentRecord::getAmountPaid)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal pendingAmount = filteredRecords.stream()
                .filter(r -> r.getStatus() != null &&
                        !"PAID".equalsIgnoreCase(r.getStatus().trim()) &&
                        !"CANCELLED".equalsIgnoreCase(r.getStatus().trim()))
                .map(PaymentRecord::getRemainingAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Thống kê theo status
        Map<String, Long> ordersByStatus = filteredRecords.stream()
                .filter(r -> r.getStatus() != null)
                .collect(java.util.stream.Collectors.groupingBy(
                        r -> r.getStatus().trim().toUpperCase(),
                        java.util.stream.Collectors.counting()));

        // Thống kê theo payment method (cần join với transactions)
        Map<String, BigDecimal> revenueByMethod = new java.util.HashMap<>();

        for (PaymentRecord record : filteredRecords) {
            List<Transaction> transactions = transactionRepository.findByPaymentRecord_OrderId(record.getOrderId());

            if (transactions == null || transactions.isEmpty())
                continue;

            for (Transaction transaction : transactions) {
                if ("SUCCESS".equalsIgnoreCase(transaction.getStatus())) {
                    String methodName = transaction.getPaymentMethod() != null
                            ? transaction.getPaymentMethod().getMethodName()
                            : "UNKNOWN";

                    revenueByMethod.merge(methodName, transaction.getAmount(), BigDecimal::add);
                }
            }
        }

        // Completion rate
        double completionRate = totalOrders > 0
                ? (completedOrders * 100.0 / totalOrders)
                : 0.0;

        // Log results
        log.info("Statistics Calculated: Total Revenue={}, Orders={}", totalRevenue, totalOrders);

        return PaymentStatisticsResponse.builder()
                .totalRevenue(totalRevenue)
                .pendingAmount(pendingAmount)
                .completedAmount(completedAmount)
                .totalOrders(totalOrders)
                .completedOrders(completedOrders)
                .pendingOrders(pendingOrders)
                .failedOrders(failedOrders)
                .cancelledOrders(cancelledOrders)
                .revenueByMethod(revenueByMethod)
                .ordersByStatus(ordersByStatus)
                .completionRate(completionRate)
                .build();
    }

    /**
     * Helper method để map PaymentRecord sang PaymentRecordResponse
     */
    private PaymentRecordResponse mapToPaymentRecordResponse(PaymentRecord record) {
        // Fetch customer info from customer-service via REST API
        String customerName = null;
        String customerEmail = null;

        if (record.getCustomerId() != null) {
            try {
                // Call customer-service API to get customer details
                String customerServiceUrl = customerServiceBaseUrl + "/customers/" + record.getCustomerId();

                // Use exchange to handle ApiRespond wrapper from customer-service
                ResponseEntity<ApiRespond<CustomerInfo>> response = restTemplate.exchange(
                        customerServiceUrl,
                        HttpMethod.GET,
                        null,
                        new ParameterizedTypeReference<ApiRespond<CustomerInfo>>() {
                        });

                if (response.getBody() != null && response.getBody().getData() != null) {
                    CustomerInfo customerInfo = response.getBody().getData();
                    customerName = customerInfo.getFullName();
                    customerEmail = customerInfo.getEmail();
                }
            } catch (Exception e) {
                log.warn("Failed to fetch customer info from customer-service for ID: {}", record.getCustomerId(), e);
            }
        }

        return PaymentRecordResponse.builder()
                .recordId(record.getRecordId())
                .orderId(record.getOrderId())
                .customerId(record.getCustomerId())
                .customerName(customerName)
                .customerEmail(customerEmail)
                .totalAmount(record.getTotalAmount())
                .amountPaid(record.getAmountPaid())
                .remainingAmount(record.getRemainingAmount())
                .status(record.getStatus())
                .createdAt(record.getCreatedAt())
                .updatedAt(record.getUpdatedAt())
                .planId(record.getPaymentPlan() != null ? record.getPaymentPlan().getPlanId() : null)
                .planName(record.getPaymentPlan() != null ? record.getPaymentPlan().getPlanName() : null)
                .numberOfInstallments(
                        record.getPaymentPlan() != null ? record.getPaymentPlan().getNumberOfInstallments() : null)
                .monthlyPayment(record.getPaymentPlan() != null ? record.getPaymentPlan().getMonthlyPayment() : null)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentRecord> getPaymentRecordsByCustomerId(Long customerId) {
        log.info("[CustomerPaymentServiceImpl] getPaymentRecordsByCustomerId - customerId: {}", customerId);
        return paymentRecordRepository.findByCustomerId(customerId);
    }

}
