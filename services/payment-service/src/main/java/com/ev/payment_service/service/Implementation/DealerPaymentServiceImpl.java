package com.ev.payment_service.service.Implementation;

import com.ev.common_lib.dto.respond.ApiRespond;
import com.ev.common_lib.exception.AppException;
import com.ev.common_lib.exception.ErrorCode;
import com.ev.payment_service.dto.request.CreateDealerInvoiceRequest;
import com.ev.payment_service.dto.request.PayDealerInvoiceRequest;
import com.ev.payment_service.dto.response.DealerDebtSummaryResponse;
import com.ev.payment_service.dto.response.DealerInvoiceResponse;
import com.ev.payment_service.dto.response.DealerTransactionResponse;
import com.ev.payment_service.entity.DealerDebtRecord;
import com.ev.payment_service.entity.DealerInvoice;
import com.ev.payment_service.entity.DealerTransaction;
import com.ev.payment_service.entity.PaymentMethod;
import com.ev.payment_service.enums.PaymentMethodType;
import com.ev.payment_service.enums.PaymentScope;
import com.ev.payment_service.mapper.DealerPaymentMapper;
import com.ev.payment_service.repository.DealerDebtRecordRepository;
import com.ev.payment_service.repository.DealerInvoiceRepository;
import com.ev.payment_service.repository.DealerTransactionRepository;
import com.ev.payment_service.repository.PaymentMethodRepository;
import com.ev.payment_service.service.Interface.IDealerPaymentService;
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
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DealerPaymentServiceImpl implements IDealerPaymentService {

    private final DealerInvoiceRepository dealerInvoiceRepository;
    private final DealerTransactionRepository dealerTransactionRepository;
    private final DealerDebtRecordRepository dealerDebtRecordRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final DealerPaymentMapper dealerPaymentMapper;
    
    // === DYNAMIC CALL (SỬ DỤNG RestTemplate) ===
    private final RestTemplate restTemplate;
    
    @Value("${sales-service.url}") // Lấy URL từ application.properties
    private String salesServiceUrl;

    @Override
    @Transactional
    public DealerInvoiceResponse createDealerInvoice(CreateDealerInvoiceRequest request, UUID staffId) {
        log.info("Creating dealer invoice - OrderId: {}, DealerId: {}, Amount: {}, StaffId: {}", 
                request.getOrderId(), request.getDealerId(), request.getAmount(), staffId);

        // 1. Validate orderId
        if (request.getOrderId() == null) {
            log.error("OrderId is required for invoice creation");
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        // 2. Validate order từ Sales Service: phải là B2B order
        log.info("Validating order from sales-service - OrderId: {}", request.getOrderId());
        Map<String, Object> orderData = validateB2BOrder(request.getOrderId());
        
        // 3. Validate order type phải là B2B
        // typeOder có thể là String ("B2B"), Enum object, hoặc Map (nếu Jackson serialize enum)
        Object typeOderObj = orderData.get("typeOder");
        String orderType = null;
        
        if (typeOderObj == null) {
            log.error("Order typeOder is null - OrderId: {}", request.getOrderId());
            throw new AppException(ErrorCode.BAD_REQUEST);
        } else if (typeOderObj instanceof String) {
            orderType = (String) typeOderObj;
        } else if (typeOderObj instanceof java.util.Map) {
            // Nếu Jackson serialize enum thành Map, lấy giá trị từ "name" field
            @SuppressWarnings("unchecked")
            java.util.Map<String, Object> typeMap = (java.util.Map<String, Object>) typeOderObj;
            Object nameObj = typeMap.get("name");
            if (nameObj != null) {
                orderType = nameObj.toString();
            } else {
                // Thử lấy giá trị đầu tiên trong Map
                if (!typeMap.isEmpty()) {
                    orderType = typeMap.values().iterator().next().toString();
                }
            }
        } else {
            // Nếu là Enum object hoặc object khác, convert sang String
            orderType = typeOderObj.toString();
        }
        
        if (orderType == null || !"B2B".equalsIgnoreCase(orderType)) {
            log.error("Order is not B2B type - OrderId: {}, Type: {}, TypeObject: {}", 
                    request.getOrderId(), orderType, typeOderObj);
            throw new AppException(ErrorCode.BAD_REQUEST);
        }
        
        log.info("Order type validated - OrderId: {}, Type: {}", request.getOrderId(), orderType);
        
        // 4. Validate dealerId từ order phải match với request
        Object dealerIdObj = orderData.get("dealerId");
        UUID orderDealerId = null;
        if (dealerIdObj instanceof UUID) {
            orderDealerId = (UUID) dealerIdObj;
        } else if (dealerIdObj instanceof String) {
            try {
                orderDealerId = UUID.fromString((String) dealerIdObj);
            } catch (IllegalArgumentException e) {
                log.error("Invalid dealerId format in order - OrderId: {}, DealerId: {}", 
                        request.getOrderId(), dealerIdObj);
                throw new AppException(ErrorCode.BAD_REQUEST);
            }
        } else if (dealerIdObj != null) {
            // Try to parse as string
            try {
                orderDealerId = UUID.fromString(dealerIdObj.toString());
            } catch (IllegalArgumentException e) {
                log.error("Invalid dealerId format in order - OrderId: {}, DealerId: {}", 
                        request.getOrderId(), dealerIdObj);
                throw new AppException(ErrorCode.BAD_REQUEST);
            }
        }
        
        if (orderDealerId == null) {
            log.error("Order does not have dealerId - OrderId: {}", request.getOrderId());
            throw new AppException(ErrorCode.BAD_REQUEST);
        }
        
        if (!orderDealerId.equals(request.getDealerId())) {
            log.error("DealerId mismatch - Request DealerId: {}, Order DealerId: {}", 
                    request.getDealerId(), orderDealerId);
            throw new AppException(ErrorCode.BAD_REQUEST);
        }
        
        // 5. Validate amount (có thể lấy từ order nếu cần)
        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            log.error("Invalid amount for invoice creation - Amount: {}", request.getAmount());
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        // 6. Validate dueDate
        if (request.getDueDate() == null || request.getDueDate().isBefore(LocalDate.now())) {
            log.error("Invalid dueDate for invoice creation - DueDate: {}", request.getDueDate());
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        // 7. Tạo DealerInvoice với orderId
        DealerInvoice invoice = DealerInvoice.builder()
                .dealerId(request.getDealerId())
                .createdByStaffId(staffId)
                .totalAmount(request.getAmount())
                .amountPaid(BigDecimal.ZERO)
                .dueDate(request.getDueDate())
                .status("UNPAID")
                .referenceType("SALES_ORDER_B2B") // Set mặc định là SALES_ORDER_B2B
                .referenceId(request.getOrderId().toString()) // Lưu orderId vào referenceId
                .notes(request.getNotes())
                .createdAt(LocalDateTime.now())
                .build();

        DealerInvoice savedInvoice = dealerInvoiceRepository.save(invoice);
        log.info("DealerInvoice created - InvoiceId: {}, OrderId: {}, DealerId: {}, Amount: {}", 
                savedInvoice.getDealerInvoiceId(), request.getOrderId(), savedInvoice.getDealerId(), savedInvoice.getTotalAmount());

        // 8. Update (hoặc create) DealerDebtRecord
        updateDealerDebtRecord(savedInvoice.getDealerId(), savedInvoice.getTotalAmount(), BigDecimal.ZERO);
        log.info("DealerDebtRecord updated - DealerId: {}, TotalOwed increased by: {}", 
                savedInvoice.getDealerId(), savedInvoice.getTotalAmount());

        // 9. Update payment status của order trong Sales Service thành UNPAID
        try {
            updateOrderPaymentStatus(request.getOrderId(), "UNPAID");
            log.info("Order payment status updated to UNPAID - OrderId: {}", request.getOrderId());
        } catch (Exception e) {
            log.error("Failed to update order payment status - OrderId: {}, Error: {}", 
                    request.getOrderId(), e.getMessage(), e);
            // Không throw exception để không rollback invoice creation
            // Payment status có thể được cập nhật sau
        }

        // 10. Map to response
        DealerInvoiceResponse response = dealerPaymentMapper.toInvoiceResponse(savedInvoice);
        response.setTransactions(List.of()); // Chưa có transactions
        return response;
    }
    
    /**
     * Validate order từ Sales Service: phải tồn tại và là B2B order
     * @param orderId Order ID từ sales_db
     * @return Order data từ Sales Service
     * @throws AppException nếu order không tồn tại hoặc không phải B2B
     */
    private Map<String, Object> validateB2BOrder(UUID orderId) {
        String url = salesServiceUrl + "/api/v1/sales-orders/" + orderId;
        log.info("Calling Sales Service to validate order - URL: {}", url);

        ParameterizedTypeReference<ApiRespond<Map<String, Object>>> responseType =
                new ParameterizedTypeReference<ApiRespond<Map<String, Object>>>() {};
        
        try {
            ResponseEntity<ApiRespond<Map<String, Object>>> response = 
                    restTemplate.exchange(url, HttpMethod.GET, null, responseType);
            
            ApiRespond<Map<String, Object>> apiResponse = response.getBody();
            if (apiResponse == null || apiResponse.getData() == null) {
                log.error("Failed to fetch order from Sales Service - OrderId: {}, Response is null", orderId);
                throw new AppException(ErrorCode.DOWNSTREAM_SERVICE_UNAVAILABLE);
            }
            
            Map<String, Object> orderData = apiResponse.getData();
            log.info("Order fetched from Sales Service - OrderId: {}, Type: {}, Type Class: {}", 
                    orderId, orderData.get("typeOder"), 
                    orderData.get("typeOder") != null ? orderData.get("typeOder").getClass().getName() : "null");
            
            // Log toàn bộ orderData để debug
            log.debug("Full order data: {}", orderData);
            
            return orderData;
        } catch (RestClientException e) {
            log.error("Failed to fetch order from Sales Service - OrderId: {}, Error: {}", 
                    orderId, e.getMessage());
            throw new AppException(ErrorCode.DOWNSTREAM_SERVICE_UNAVAILABLE);
        }
    }

    @Override
    @Transactional
    public DealerTransactionResponse payDealerInvoice(UUID invoiceId, PayDealerInvoiceRequest request, UUID dealerId) {
        log.info("Paying dealer invoice - InvoiceId: {}, Amount: {}, DealerId: {}", 
                invoiceId, request.getAmount(), dealerId);

        // 1. Validate invoice tồn tại
        DealerInvoice invoice = dealerInvoiceRepository.findById(invoiceId)
                .orElseThrow(() -> {
                    log.error("Invoice not found - InvoiceId: {}", invoiceId);
                    return new AppException(ErrorCode.DATA_NOT_FOUND);
                });

        // 2. Validate dealerId match (Dealer chỉ được thanh toán invoice của chính mình)
        if (!invoice.getDealerId().equals(dealerId)) {
            log.error("DealerId mismatch - Invoice DealerId: {}, Request DealerId: {}", 
                    invoice.getDealerId(), dealerId);
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        // 3. Validate amount
        BigDecimal remainingAmount = invoice.getTotalAmount().subtract(
                invoice.getAmountPaid() != null ? invoice.getAmountPaid() : BigDecimal.ZERO
        );
        if (request.getAmount().compareTo(remainingAmount) > 0) {
            log.error("Amount exceeds remaining amount - Request Amount: {}, Remaining Amount: {}", 
                    request.getAmount(), remainingAmount);
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        // 4. Validate payment method
        PaymentMethod paymentMethod = paymentMethodRepository.findById(request.getPaymentMethodId())
                .orElseThrow(() -> {
                    log.error("Payment method not found - MethodId: {}", request.getPaymentMethodId());
                    return new AppException(ErrorCode.DATA_NOT_FOUND);
                });

        // Validate payment method scope (phải là B2B hoặc ALL)
        if (paymentMethod.getScope() != PaymentScope.B2B && paymentMethod.getScope() != PaymentScope.ALL) {
            log.error("Payment method scope is not valid for B2B - MethodId: {}, Scope: {}", 
                    request.getPaymentMethodId(), paymentMethod.getScope());
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        // 5. Tạo DealerTransaction
        LocalDateTime transactionDate = request.getPaidDate() != null 
                ? request.getPaidDate() 
                : LocalDateTime.now();

        // Xác định status dựa trên payment method type
        // Nếu là GATEWAY (VNPAY): tự động confirm ngay
        // Nếu là MANUAL (tiền mặt): chờ duyệt
        String transactionStatus;
        if (paymentMethod.getMethodType() == PaymentMethodType.GATEWAY) {
            transactionStatus = "SUCCESS"; // Tự động confirm cho VNPAY
            log.info("Payment method is GATEWAY - Auto confirming transaction for InvoiceId: {}", invoiceId);
        } else {
            transactionStatus = "PENDING_CONFIRMATION"; // Chờ duyệt cho tiền mặt
            log.info("Payment method is MANUAL - Transaction pending confirmation for InvoiceId: {}", invoiceId);
        }

        DealerTransaction transaction = DealerTransaction.builder()
                .dealerInvoice(invoice)
                .amount(request.getAmount())
                .transactionDate(transactionDate)
                .paymentMethod(paymentMethod)
                .transactionCode(request.getTransactionCode())
                .status(transactionStatus)
                .notes(request.getNotes())
                .build();

        DealerTransaction savedTransaction = dealerTransactionRepository.save(transaction);
        log.info("DealerTransaction created - TransactionId: {}, InvoiceId: {}, Amount: {}, Status: {}", 
                savedTransaction.getDealerTransactionId(), invoiceId, request.getAmount(), transactionStatus);

        // 6. Nếu là GATEWAY (VNPAY), tự động cập nhật invoice và debt record
        if ("SUCCESS".equals(transactionStatus)) {
            // Auto confirm logic (giống như confirmDealerTransaction nhưng không cần staffId)
            BigDecimal newAmountPaid = invoice.getAmountPaid().add(savedTransaction.getAmount());
            invoice.setAmountPaid(newAmountPaid);

            // Update invoice status
            if (newAmountPaid.compareTo(invoice.getTotalAmount()) >= 0) {
                invoice.setStatus("PAID");
                log.info("Invoice fully paid - InvoiceId: {}", invoice.getDealerInvoiceId());
            } else if (newAmountPaid.compareTo(BigDecimal.ZERO) > 0) {
                if (invoice.getDueDate().isBefore(LocalDate.now())) {
                    invoice.setStatus("OVERDUE");
                } else {
                    invoice.setStatus("PARTIALLY_PAID");
                }
            }

            dealerInvoiceRepository.save(invoice);

            // Update DealerDebtRecord
            updateDealerDebtRecord(invoice.getDealerId(), BigDecimal.ZERO, savedTransaction.getAmount());
            log.info("DealerDebtRecord updated - DealerId: {}, TotalPaid increased by: {}", 
                    invoice.getDealerId(), savedTransaction.getAmount());
        }

        // 7. Map to response
        return dealerPaymentMapper.toTransactionResponse(savedTransaction);
    }

    @Override
    @Transactional
    public DealerTransactionResponse confirmDealerTransaction(UUID transactionId, UUID staffId, String notes) {
        log.info("Confirming dealer transaction - TransactionId: {}, StaffId: {}", transactionId, staffId);

        // 1. Validate transaction tồn tại
        DealerTransaction transaction = dealerTransactionRepository.findById(transactionId)
                .orElseThrow(() -> {
                    log.error("Transaction not found - TransactionId: {}", transactionId);
                    return new AppException(ErrorCode.DATA_NOT_FOUND);
                });

        // 2. Validate status (phải là PENDING_CONFIRMATION)
        if (!"PENDING_CONFIRMATION".equals(transaction.getStatus())) {
            log.error("Transaction status is not PENDING_CONFIRMATION - TransactionId: {}, Status: {}", 
                    transactionId, transaction.getStatus());
            throw new AppException(ErrorCode.INVALID_STATE);
        }

        // 3. Update transaction
        transaction.setStatus("SUCCESS");
        transaction.setConfirmedByStaffId(staffId);
        if (notes != null && !notes.isBlank()) {
            transaction.setNotes(notes);
        }
        DealerTransaction savedTransaction = dealerTransactionRepository.save(transaction);
        log.info("DealerTransaction confirmed - TransactionId: {}", transactionId);

        // 4. Update invoice
        DealerInvoice invoice = transaction.getDealerInvoice();
        BigDecimal newAmountPaid = invoice.getAmountPaid().add(transaction.getAmount());
        invoice.setAmountPaid(newAmountPaid);

        // Update invoice status
        // Ưu tiên: PAID > OVERDUE > PARTIALLY_PAID > UNPAID
        if (newAmountPaid.compareTo(invoice.getTotalAmount()) >= 0) {
            invoice.setStatus("PAID");
            log.info("Invoice fully paid - InvoiceId: {}", invoice.getDealerInvoiceId());
        } else if (newAmountPaid.compareTo(BigDecimal.ZERO) > 0) {
            // Kiểm tra overdue trước khi set PARTIALLY_PAID
            if (invoice.getDueDate().isBefore(LocalDate.now())) {
                invoice.setStatus("OVERDUE");
                log.info("Invoice is overdue (partially paid) - InvoiceId: {}, AmountPaid: {}, TotalAmount: {}", 
                        invoice.getDealerInvoiceId(), newAmountPaid, invoice.getTotalAmount());
            } else {
                invoice.setStatus("PARTIALLY_PAID");
                log.info("Invoice partially paid - InvoiceId: {}, AmountPaid: {}, TotalAmount: {}", 
                        invoice.getDealerInvoiceId(), newAmountPaid, invoice.getTotalAmount());
            }
        } else {
            // Chưa trả gì cả, kiểm tra overdue
            if (invoice.getDueDate().isBefore(LocalDate.now())) {
                invoice.setStatus("OVERDUE");
                log.info("Invoice is overdue (unpaid) - InvoiceId: {}", invoice.getDealerInvoiceId());
            }
        }

        dealerInvoiceRepository.save(invoice);

        // 5. Update DealerDebtRecord
        updateDealerDebtRecord(invoice.getDealerId(), BigDecimal.ZERO, transaction.getAmount());
        log.info("DealerDebtRecord updated - DealerId: {}, TotalPaid increased by: {}", 
                invoice.getDealerId(), transaction.getAmount());

        // TODO: Emit event DEALER_PAYMENT_CONFIRMED (nếu cần)

        // 6. Map to response
        return dealerPaymentMapper.toTransactionResponse(savedTransaction);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DealerInvoiceResponse> getDealerInvoices(UUID dealerId, String status, Pageable pageable) {
        log.info("Getting dealer invoices - DealerId: {}, Status: {}", dealerId, status);

        // Lấy danh sách invoices (có phân trang)
        Page<DealerInvoice> invoicePage;
        if (status != null && !status.isBlank()) {
            invoicePage = dealerInvoiceRepository.findByDealerIdAndStatus(dealerId, status, pageable);
        } else {
            invoicePage = dealerInvoiceRepository.findByDealerId(dealerId, pageable);
        }

        // Map to response và load transactions
        return invoicePage.map(invoice -> {
            DealerInvoiceResponse response = dealerPaymentMapper.toInvoiceResponse(invoice);
            // Load transactions cho invoice này
            List<DealerTransaction> transactions = dealerTransactionRepository
                    .findByDealerInvoice_DealerInvoiceId(invoice.getDealerInvoiceId());
            response.setTransactions(dealerPaymentMapper.toTransactionResponseList(transactions));
            return response;
        });
    }

    @Override
    @Transactional(readOnly = true)
    public DealerInvoiceResponse getDealerInvoiceById(UUID invoiceId) {
        log.info("Getting dealer invoice by ID - InvoiceId: {}", invoiceId);
        
        DealerInvoice invoice = dealerInvoiceRepository.findById(invoiceId)
                .orElseThrow(() -> {
                    log.error("Invoice not found - InvoiceId: {}", invoiceId);
                    return new AppException(ErrorCode.DATA_NOT_FOUND);
                });
        
        // Map to response và load transactions
        DealerInvoiceResponse response = dealerPaymentMapper.toInvoiceResponse(invoice);
        List<DealerTransaction> transactions = dealerTransactionRepository
                .findByDealerInvoice_DealerInvoiceId(invoice.getDealerInvoiceId());
        response.setTransactions(dealerPaymentMapper.toTransactionResponseList(transactions));
        
        return response;
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<DealerDebtSummaryResponse> getDealerDebtSummary(Pageable pageable) {
        log.info("Getting dealer debt summary");

        Page<DealerDebtRecord> debtPage = dealerDebtRecordRepository.findAll(pageable);
        return debtPage.map(dealerPaymentMapper::toDebtSummaryResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasInvoiceForOrder(UUID orderId) {
        log.info("Checking if order has invoice - OrderId: {}", orderId);
        
        Optional<DealerInvoice> invoice = dealerInvoiceRepository.findByOrderId(orderId.toString());
        boolean hasInvoice = invoice.isPresent();
        
        log.info("Order {} has invoice: {}", orderId, hasInvoice);
        return hasInvoice;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DealerTransactionResponse> getPendingCashPayments(Pageable pageable) {
        log.info("Getting pending cash payments");

        Page<DealerTransaction> transactionPage = dealerTransactionRepository.findPendingTransactions(pageable);
        return transactionPage.map(dealerPaymentMapper::toTransactionResponse);
    }

    /**
     * Helper method: Update DealerDebtRecord
     * @param dealerId ID của đại lý
     * @param amountToAddToOwed Số tiền cần thêm vào total_owed (dùng BigDecimal.ZERO nếu không thay đổi)
     * @param amountToAddToPaid Số tiền cần thêm vào total_paid (dùng BigDecimal.ZERO nếu không thay đổi)
     */
    private void updateDealerDebtRecord(UUID dealerId, BigDecimal amountToAddToOwed, BigDecimal amountToAddToPaid) {
        DealerDebtRecord debtRecord = dealerDebtRecordRepository.findById(dealerId)
                .orElse(DealerDebtRecord.builder()
                        .dealerId(dealerId)
                        .totalOwed(BigDecimal.ZERO)
                        .totalPaid(BigDecimal.ZERO)
                        .build());

        if (amountToAddToOwed.compareTo(BigDecimal.ZERO) > 0) {
            debtRecord.setTotalOwed(debtRecord.getTotalOwed().add(amountToAddToOwed));
        }

        if (amountToAddToPaid.compareTo(BigDecimal.ZERO) > 0) {
            debtRecord.setTotalPaid(debtRecord.getTotalPaid().add(amountToAddToPaid));
        }

        // currentBalance sẽ tự động tính lại bởi @PreUpdate
        dealerDebtRecordRepository.save(debtRecord);
    }

    /**
     * Helper method: Update payment status của order trong Sales Service
     * @param orderId Order ID từ sales_db
     * @param paymentStatus Payment status (UNPAID, PARTIALLY_PAID, PAID, NONE)
     */
    private void updateOrderPaymentStatus(UUID orderId, String paymentStatus) {
        String url = salesServiceUrl + "/api/v1/sales-orders/" + orderId + "/payment-status?status=" + paymentStatus;
        log.info("Calling Sales Service to update payment status - URL: {}, OrderId: {}, Status: {}", 
                url, orderId, paymentStatus);

        try {
            restTemplate.put(url, null);
            log.info("Successfully updated payment status in Sales Service for orderId: {}, status: {}", 
                    orderId, paymentStatus);
        } catch (RestClientException e) {
            log.error("Failed to update payment status in Sales Service - OrderId: {}, Status: {}, Error: {}", 
                    orderId, paymentStatus, e.getMessage(), e);
            throw new AppException(ErrorCode.DOWNSTREAM_SERVICE_UNAVAILABLE);
        }
    }
}

