package com.ev.payment_service.service.Implementation;

import com.ev.payment_service.config.VnpayConfig;
import com.ev.payment_service.entity.Transaction;
import com.ev.payment_service.entity.PaymentRecord;
import com.ev.payment_service.entity.DealerInvoice;
import com.ev.payment_service.entity.DealerTransaction;
import com.ev.payment_service.entity.DealerDebtRecord;
import com.ev.payment_service.repository.TransactionRepository;
import com.ev.payment_service.repository.PaymentRecordRepository;
import com.ev.payment_service.repository.DealerInvoiceRepository;
import com.ev.payment_service.repository.DealerTransactionRepository;
import com.ev.payment_service.repository.DealerDebtRecordRepository;
import com.ev.payment_service.service.Interface.IVnpayService;
import com.ev.common_lib.exception.AppException;
import com.ev.common_lib.exception.ErrorCode;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ev.payment_service.service.Interface.IPaymentRecordService;
import com.ev.payment_service.repository.PaymentMethodRepository;
import com.ev.payment_service.entity.PaymentMethod;
import com.ev.payment_service.dto.request.VnpayInitiateRequest;
import com.ev.payment_service.enums.PaymentScope;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.UUID;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.math.RoundingMode;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * VNPAY Payment Gateway Service Implementation
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class VnpayServiceImpl implements IVnpayService {

    private final VnpayConfig vnpayConfig;
    private final TransactionRepository transactionRepository;
    private final DealerTransactionRepository dealerTransactionRepository;
    private final PaymentRecordRepository paymentRecordRepository;
    private final DealerInvoiceRepository dealerInvoiceRepository;
    private final DealerDebtRecordRepository dealerDebtRecordRepository;
    private final IPaymentRecordService paymentRecordService;
    private final PaymentMethodRepository paymentMethodRepository;
    private final RestTemplate restTemplate;

    @Value("${sales-service.url}")
    private String salesServiceUrl;

    @Override
    @Transactional
    public String initiateB2CPayment(VnpayInitiateRequest request, String ipAddr) {
        try {
            log.info("Initiating B2C payment - Amount: {}, OrderInfo: {}, CustomerId: {}, OrderId: {}",
                    request.getPaymentAmount(), request.getOrderInfo(),
                    request.getCustomerId(), request.getOrderId());

            // 1. Tìm hoặc tạo PaymentRecord (công nợ)
            PaymentRecord record = null;
            if (request.getOrderId() != null) {
                log.info("Creating PaymentRecord for orderId: {}", request.getOrderId());
                record = paymentRecordService.findOrCreateRecord(
                        request.getOrderId(),
                        request.getCustomerId(),
                        request.getTotalAmount());
            } else {
                // Tạo PaymentRecord tạm cho booking deposit (chưa có orderId)
                log.info("No orderId provided - Creating temporary PaymentRecord for booking deposit");
                UUID tempOrderId = UUID.randomUUID();

                // Serialize metadata to JSON string
                String metadataJson = null;
                if (request.getMetadata() != null && !request.getMetadata().isEmpty()) {
                    try {
                        metadataJson = new ObjectMapper().writeValueAsString(request.getMetadata());
                    } catch (Exception e) {
                        log.warn("Failed to serialize metadata: {}", e.getMessage());
                    }
                }

                record = PaymentRecord.builder()
                        .orderId(tempOrderId) // Tạm thời, sẽ update sau khi có order thật
                        .customerId(request.getCustomerId())
                        .customerName(request.getCustomerName())
                        .customerPhone(request.getCustomerPhone())
                        .customerEmail(request.getCustomerEmail())
                        .customerIdCard(request.getCustomerIdCard())
                        .metadata(metadataJson) // Lưu metadata dưới dạng JSON string
                        .totalAmount(request.getTotalAmount())
                        .amountPaid(BigDecimal.ZERO)
                        .remainingAmount(request.getTotalAmount())
                        .status("PENDING_DEPOSIT") // Trạng thái đặc biệt cho booking deposit
                        .build();
                record = paymentRecordRepository.save(record);
                log.info("Created temporary PaymentRecord {} for booking deposit with temp orderId: {} - Customer: {}",
                        record.getRecordId(), tempOrderId, request.getCustomerName());
            }

            // 2. Tìm PaymentMethod cho VNPAY
            log.info("Looking for VNPAY payment method...");
            PaymentMethod vnpayMethod = paymentMethodRepository.findByMethodName("VNPAY")
                    .orElseThrow(() -> {
                        log.error("VNPAY payment method not found in database!");
                        return new AppException(ErrorCode.DATA_NOT_FOUND);
                    });
            log.info("Found VNPAY payment method: {}", vnpayMethod.getMethodId());

            // 3. Tạo Transaction (lịch sử) ở trạng thái PENDING
            Transaction transaction = new Transaction();
            transaction.setPaymentRecord(record);
            transaction.setPaymentMethod(vnpayMethod);
            transaction.setAmount(request.getPaymentAmount());
            transaction.setStatus("PENDING");
            transaction.setTransactionDate(LocalDateTime.now());
            Transaction savedTransaction = transactionRepository.save(transaction);

            log.info("Created PENDING transaction: {}", savedTransaction.getTransactionId());

            // 4. Tạo VNPAY URL với orderInfo từ request
            String orderInfo = request.getOrderInfo() != null
                    ? request.getOrderInfo()
                    : "ThanhToanDonHang_" + (request.getOrderId() != null ? request.getOrderId().toString()
                            : savedTransaction.getTransactionId().toString());

            // Sử dụng configured return URL (đã được VNPay phê duyệt)
            // Frontend return URL sẽ được lưu trong metadata và xử lý trong IPN callback
            String configuredReturnUrl = vnpayConfig.getVnpReturnUrlCustomer();
            log.info("Using configured CUSTOMER return URL: {}", configuredReturnUrl);

            String paymentUrl = createPaymentUrl(
                    savedTransaction.getTransactionId().toString(),
                    orderInfo,
                    request.getPaymentAmount().longValue(),
                    configuredReturnUrl,
                    ipAddr);

            log.info("VNPAY Payment URL created successfully - TransactionId: {}, Amount: {}, OrderInfo: {}",
                    savedTransaction.getTransactionId(), request.getPaymentAmount(), orderInfo);

            return paymentUrl;

        } catch (AppException e) {
            log.error("AppException in initiateB2CPayment - Code: {}, Message: {}",
                    e.getErrorCode(), e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error creating VNPAY payment URL - Error: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.INTERNAL_ERROR);
        }
    }

    @Override
    @Transactional
    public String initiateDealerInvoicePayment(UUID invoiceId,
            UUID dealerId,
            BigDecimal amount,
            String returnUrl,
            String ipAddr) {
        try {
            DealerInvoice invoice = dealerInvoiceRepository.findById(invoiceId)
                    .orElseThrow(() -> new AppException(ErrorCode.DATA_NOT_FOUND));

            if (!invoice.getDealerId().equals(dealerId)) {
                log.error("Dealer {} tried to pay invoice {} that does not belong to them", dealerId, invoiceId);
                throw new AppException(ErrorCode.FORBIDDEN);
            }

            BigDecimal amountPaid = invoice.getAmountPaid() != null ? invoice.getAmountPaid() : BigDecimal.ZERO;
            BigDecimal remaining = invoice.getTotalAmount().subtract(amountPaid);

            if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
                log.error("Invalid VNPAY amount {} for invoice {}", amount, invoiceId);
                throw new AppException(ErrorCode.BAD_REQUEST);
            }

            if (amount.compareTo(remaining) > 0) {
                log.error("Attempt to pay more than remaining amount - Invoice: {}, Amount: {}, Remaining: {}",
                        invoiceId, amount, remaining);
                throw new AppException(ErrorCode.BAD_REQUEST);
            }

            PaymentMethod vnpayMethod = paymentMethodRepository.findByMethodName("VNPAY")
                    .orElseThrow(() -> new AppException(ErrorCode.DATA_NOT_FOUND));

            if (vnpayMethod.getScope() != PaymentScope.ALL && vnpayMethod.getScope() != PaymentScope.B2B) {
                log.error("VNPAY method is not enabled for B2B scope - MethodId: {}", vnpayMethod.getMethodId());
                throw new AppException(ErrorCode.BAD_REQUEST);
            }

            DealerTransaction transaction = DealerTransaction.builder()
                    .dealerInvoice(invoice)
                    .paymentMethod(vnpayMethod)
                    .amount(amount)
                    .status("PENDING_GATEWAY")
                    .transactionDate(LocalDateTime.now())
                    .build();

            DealerTransaction savedTransaction = dealerTransactionRepository.save(transaction);

            long amountInLong = amount.setScale(0, RoundingMode.HALF_UP).longValueExact();

            String orderInfo = "ThanhToanHoaDon_" + invoiceId.toString();
            
            // SECURITY: Always use configured return URL for Dealer App
            String configuredReturnUrl = vnpayConfig.getVnpReturnUrlDealer();
            log.info("Using configured DEALER return URL: {}", configuredReturnUrl);

            String paymentUrl = createPaymentUrl(
                    savedTransaction.getDealerTransactionId().toString(),
                    orderInfo,
                    amountInLong,
                    configuredReturnUrl,
                    ipAddr);

            log.info("Created VNPAY transaction for dealer invoice - InvoiceId: {}, TransactionId: {}", invoiceId,
                    savedTransaction.getDealerTransactionId());
            return paymentUrl;
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error initiating dealer invoice payment via VNPAY - InvoiceId: {}, Error: {}", invoiceId,
                    e.getMessage(), e);
            throw new AppException(ErrorCode.INTERNAL_ERROR);
        }
    }

    /**
     * Sanitize orderInfo để chỉ giữ ký tự ASCII an toàn
     * Loại bỏ dấu tiếng Việt và ký tự đặc biệt để tránh lỗi encoding với VNPAY
     */
    private String sanitizeOrderInfo(String input) {
        if (input == null)
            return "";

        // Map các ký tự có dấu sang không dấu
        String[][] replacements = {
                { "à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ", "a" },
                { "è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ", "e" },
                { "ì|í|ị|ỉ|ĩ", "i" },
                { "ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ", "o" },
                { "ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ", "u" },
                { "ỳ|ý|ỵ|ỷ|ỹ", "y" },
                { "đ", "d" },
                { "À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ", "A" },
                { "È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ", "E" },
                { "Ì|Í|Ị|Ỉ|Ĩ", "I" },
                { "Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ", "O" },
                { "Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ", "U" },
                { "Ỳ|Ý|Ỵ|Ỷ|Ỹ", "Y" },
                { "Đ", "D" }
        };

        String result = input;
        for (String[] replacement : replacements) {
            result = result.replaceAll(replacement[0], replacement[1]);
        }

        // Chỉ giữ ký tự ASCII an toàn: chữ, số, space, dấu gạch ngang
        result = result.replaceAll("[^a-zA-Z0-9 -]", "");

        // Giới hạn độ dài
        if (result.length() > 255) {
            result = result.substring(0, 255);
        }

        log.info("Sanitized orderInfo: {} -> {}", input, result);
        return result;
    }

    /**
     * Tạo URL thanh toán VNPAY theo đúng logic cũ từ PaymentService
     * 
     * @param orderInfo - Thông tin đơn hàng để hiển thị trên VNPay
     */
    private String createPaymentUrl(String transactionId, String orderInfo, Long amount, String returnUrl,
            String ipAddr) {
        // Sanitize orderInfo - chỉ giữ ký tự ASCII an toàn để tránh lỗi encoding
        String sanitizedOrderInfo = sanitizeOrderInfo(orderInfo);

        Map<String, String> params = new HashMap<>();
        params.put("vnp_Version", vnpayConfig.getVnpVersion());
        params.put("vnp_Command", vnpayConfig.getVnpCommand());
        params.put("vnp_TmnCode", vnpayConfig.getTmnCode());
        params.put("vnp_Amount", String.valueOf(amount * 100)); // nhân 100
        params.put("vnp_CurrCode", vnpayConfig.getVnpCurrCode());
        params.put("vnp_TxnRef", transactionId);
        params.put("vnp_OrderInfo", sanitizedOrderInfo);
        params.put("vnp_OrderType", vnpayConfig.getVnpOrderType());

        // Sử dụng returnUrl từ request (đã được enforce từ caller)
        String returnUrlToUse = returnUrl;
        params.put("vnp_ReturnUrl", returnUrlToUse);

        params.put("vnp_CreateDate", new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()));
        params.put("vnp_IpAddr", ipAddr);
        params.put("vnp_Locale", vnpayConfig.getVnpLocale());

        // Tạo hash data và query string (cả 2 đều encode giống nhau theo tài liệu
        // VNPAY)
        String hashData = buildQueryString(params, true);

        // Tạo vnp_SecureHash
        String vnp_SecureHash = hmacSHA512(vnpayConfig.getHashSecret(), hashData);

        // Tạo URL cuối cùng
        String finalUrl = vnpayConfig.getVnpUrl() + "?" + hashData
                + "&vnp_SecureHash=" + vnp_SecureHash;

        // Log debug
        log.info(">>> VNPAY TmnCode: {}", vnpayConfig.getTmnCode());
        log.info(">>> VNPAY HashSecret: {}", vnpayConfig.getHashSecret());
        log.info(">>> VNPAY Params: {}", params);
        log.info(">>> VNPAY Hash Data String: {}", hashData);
        log.info(">>> VNPAY Generated vnp_SecureHash: {}", vnp_SecureHash);
        log.info(">>> VNPAY Client IP: {}", ipAddr);
        log.info(">>> VNPAY Return URL: {}", returnUrlToUse);

        return finalUrl;
    }

    /**
     * Xây dựng query string theo đúng tài liệu VNPAY
     * 
     * @param forHash: true = cho hash data, false = cho URL
     */
    private String buildQueryString(Map<String, String> params, boolean forHash) {
        List<String> keys = new ArrayList<>(params.keySet());
        Collections.sort(keys);

        StringBuilder sb = new StringBuilder();
        for (String key : keys) {
            String value = params.get(key);
            if (value != null && !value.isEmpty()) {
                if (sb.length() > 0) {
                    sb.append("&");
                }

                // Theo tài liệu VNPAY: cả hash data và URL đều encode key và value
                sb.append(URLEncoder.encode(key, StandardCharsets.UTF_8))
                        .append("=")
                        .append(URLEncoder.encode(value, StandardCharsets.UTF_8));
            }
        }
        return sb.toString();
    }

    /**
     * HMAC-SHA512 - Copy nguyên từ PaymentService.java
     */
    private String hmacSHA512(String key, String data) {
        try {
            Mac hmac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac.init(secretKey);
            byte[] bytes = hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hash = new StringBuilder();
            for (byte b : bytes) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1)
                    hash.append('0');
                hash.append(hex);
            }
            return hash.toString();
        } catch (Exception e) {
            log.error("Error calculating HMAC - Error: {}", e.getMessage(), e);
            throw new RuntimeException("Error calculating HMAC", e);
        }
    }

    @Override
    @Transactional
    public UUID processIpnCallback(Map<String, String> vnpParams) {
        try {
            log.info("Processing VNPAY IPN callback - Params: {}", vnpParams);

            // Lấy các tham số từ VNPAY
            String vnpSecureHash = vnpParams.get("vnp_SecureHash");
            String vnpResponseCode = vnpParams.get("vnp_ResponseCode");
            String vnpTransactionStatus = vnpParams.get("vnp_TransactionStatus");
            String vnpTxnRef = vnpParams.get("vnp_TxnRef");
            String vnpAmount = vnpParams.get("vnp_Amount");
            String vnpTransactionNo = vnpParams.get("vnp_TransactionNo");

            // Validate checksum
            if (!verifyVnpayHash(vnpParams)) {
                log.error("VNPAY IPN callback - Invalid checksum - TransactionId: {}", vnpTxnRef);
                return null;
            }

            // Parse transaction ID
            UUID transactionId = UUID.fromString(vnpTxnRef);

            Optional<Transaction> paymentTransaction = transactionRepository.findById(transactionId);
            if (paymentTransaction.isPresent()) {
                return handleCustomerGatewayCallback(paymentTransaction.get(), vnpResponseCode, vnpTransactionStatus,
                        vnpTransactionNo);
            }

            Optional<DealerTransaction> dealerTransaction = dealerTransactionRepository.findById(transactionId);
            if (dealerTransaction.isPresent()) {
                return handleDealerGatewayCallback(dealerTransaction.get(), vnpResponseCode, vnpTransactionStatus,
                        vnpTxnRef, vnpTransactionNo);
            }

            log.error("VNPAY IPN callback - Transaction not found anywhere - TransactionId: {}", vnpTxnRef);
            return null;

        } catch (Exception e) {
            log.error("Error processing VNPAY IPN callback - Error: {}", e.getMessage(), e);
            return null;
        }
    }

    @Override
    @Transactional
    public UUID processReturnResult(Map<String, String> vnpParams) {
        try {
            String vnpResponseCode = vnpParams.get("vnp_ResponseCode");
            String vnpTransactionStatus = vnpParams.get("vnp_TransactionStatus");
            String vnpTxnRef = vnpParams.get("vnp_TxnRef");
            String vnpTransactionNo = vnpParams.get("vnp_TransactionNo");

            if (vnpTxnRef == null) {
                log.error("VNPAY Return callback - Missing transaction reference");
                return null;
            }

            UUID transactionId = UUID.fromString(vnpTxnRef);

            Optional<Transaction> customerTransaction = transactionRepository.findById(transactionId);
            if (customerTransaction.isPresent()) {
                return handleCustomerReturnCallback(customerTransaction.get(), vnpResponseCode, vnpTransactionStatus,
                        vnpTransactionNo);
            }

            Optional<DealerTransaction> dealerTransaction = dealerTransactionRepository.findById(transactionId);
            if (dealerTransaction.isPresent()) {
                return handleDealerReturnCallback(dealerTransaction.get(), vnpResponseCode, vnpTransactionStatus,
                        vnpTransactionNo);
            }

            log.warn("VNPAY Return callback - Transaction not found for id {}", transactionId);
            return null;
        } catch (Exception e) {
            log.error("Error processing VNPAY return callback - Error: {}", e.getMessage(), e);
            return null;
        }
    }

    @Override
    public boolean validateChecksum(Map<String, String> vnpParams, String vnpSecureHash) {
        return verifyVnpayHash(vnpParams);
    }

    private UUID handleCustomerGatewayCallback(Transaction transaction,
            String responseCode,
            String transactionStatus,
            String vnpTransactionNo) {
        UUID transactionId = transaction.getTransactionId();

        if ("SUCCESS".equals(transaction.getStatus())) {
            log.warn("VNPAY IPN callback - Customer transaction already processed - TransactionId: {}", transactionId);
            return transactionId;
        }

        if ("00".equals(responseCode) && "00".equals(transactionStatus)) {
            transaction.setStatus("SUCCESS");
            transaction.setGatewayTransactionId(vnpTransactionNo);
            transactionRepository.save(transaction);

            log.info("VNPAY IPN callback - Customer payment successful - TransactionId: {}, VNPAY TransactionNo: {}",
                    transactionId, vnpTransactionNo);

            try {
                PaymentRecord paymentRecord = transaction.getPaymentRecord();
                if (paymentRecord != null) {
                    // Lưu lại status cũ trước khi cập nhật
                    String previousStatus = paymentRecord.getStatus();

                    BigDecimal currentPaid = paymentRecord.getAmountPaid() != null ? paymentRecord.getAmountPaid()
                            : BigDecimal.ZERO;
                    BigDecimal currentRemaining = paymentRecord.getRemainingAmount() != null
                            ? paymentRecord.getRemainingAmount()
                            : paymentRecord.getTotalAmount().subtract(currentPaid);

                    BigDecimal newPaid = currentPaid.add(transaction.getAmount());
                    BigDecimal newRemaining = currentRemaining.subtract(transaction.getAmount());

                    paymentRecord.setAmountPaid(newPaid);
                    paymentRecord.setRemainingAmount(newRemaining);

                    if (newRemaining.compareTo(BigDecimal.ZERO) <= 0) {
                        paymentRecord.setStatus("PAID");
                    } else if (newPaid.compareTo(BigDecimal.ZERO) > 0) {
                        paymentRecord.setStatus("PARTIALLY_PAID");
                    }

                    paymentRecordRepository.save(paymentRecord);
                    log.info("VNPAY IPN callback - PaymentRecord updated - RecordId: {}, Status: {}",
                            paymentRecord.getRecordId(), paymentRecord.getStatus());

                    // === TỰ ĐỘNG TẠO ĐƠN HÀNG NẾU LÀ BOOKING DEPOSIT ===
                    if ("PENDING_DEPOSIT".equals(previousStatus)) {
                        autoCreateSalesOrder(paymentRecord, transaction.getAmount());
                    }
                }
            } catch (Exception e) {
                log.error("VNPAY IPN callback - Error updating PaymentRecord - TransactionId: {}, Error: {}",
                        transactionId, e.getMessage(), e);
            }

            return transactionId;
        }

        transaction.setStatus("FAILED");
        transaction.setGatewayTransactionId(vnpTransactionNo);
        transactionRepository.save(transaction);

        log.warn(
                "VNPAY IPN callback - Customer payment failed - TransactionId: {}, ResponseCode: {}, TransactionStatus: {}",
                transactionId, responseCode, transactionStatus);
        return null;
    }

    private UUID handleCustomerReturnCallback(Transaction transaction,
            String responseCode,
            String transactionStatus,
            String vnpTransactionNo) {
        UUID transactionId = transaction.getTransactionId();

        boolean isPaymentSuccess = "00".equals(responseCode) && "00".equals(transactionStatus);

        if (isPaymentSuccess) {
            // Cập nhật transaction
            transaction.setStatus("SUCCESS");
            transaction.setGatewayTransactionId(vnpTransactionNo);
            transactionRepository.save(transaction);

            log.info("VNPAY Return callback - Customer payment successful - TransactionId: {}, VNPAY TransactionNo: {}",
                    transactionId, vnpTransactionNo);

            // Cập nhật PaymentRecord (giống IPN callback)
            try {
                PaymentRecord paymentRecord = transaction.getPaymentRecord();
                if (paymentRecord != null) {
                    // Lưu lại status cũ trước khi cập nhật
                    String previousStatus = paymentRecord.getStatus();

                    BigDecimal currentPaid = paymentRecord.getAmountPaid() != null ? paymentRecord.getAmountPaid()
                            : BigDecimal.ZERO;
                    BigDecimal currentRemaining = paymentRecord.getRemainingAmount() != null
                            ? paymentRecord.getRemainingAmount()
                            : paymentRecord.getTotalAmount().subtract(currentPaid);

                    BigDecimal newPaid = currentPaid.add(transaction.getAmount());
                    BigDecimal newRemaining = currentRemaining.subtract(transaction.getAmount());

                    paymentRecord.setAmountPaid(newPaid);
                    paymentRecord.setRemainingAmount(newRemaining);

                    if (newRemaining.compareTo(BigDecimal.ZERO) <= 0) {
                        paymentRecord.setStatus("PAID");
                    } else if (newPaid.compareTo(BigDecimal.ZERO) > 0) {
                        paymentRecord.setStatus("PARTIALLY_PAID");
                    }

                    paymentRecordRepository.save(paymentRecord);
                    log.info("VNPAY Return callback - PaymentRecord updated - RecordId: {}, AmountPaid: {}, Status: {}",
                            paymentRecord.getRecordId(), newPaid, paymentRecord.getStatus());

                    // === TỰ ĐỘNG TẠO ĐƠN HÀNG NẾU LÀ BOOKING DEPOSIT ===
                    if ("PENDING_DEPOSIT".equals(previousStatus)) {
                        autoCreateSalesOrder(paymentRecord, transaction.getAmount());
                    }
                }
            } catch (Exception e) {
                log.error("VNPAY Return callback - Error updating PaymentRecord - TransactionId: {}, Error: {}",
                        transactionId, e.getMessage(), e);
            }
        } else {
            transaction.setStatus("FAILED");
            transaction.setGatewayTransactionId(vnpTransactionNo);
            transactionRepository.save(transaction);
            log.warn(
                    "VNPAY Return callback - Customer payment failed - TransactionId: {}, ResponseCode: {}, TransactionStatus: {}",
                    transactionId, responseCode, transactionStatus);
        }

        return transactionId;
    }

    private UUID handleDealerGatewayCallback(DealerTransaction transaction,
            String responseCode,
            String transactionStatus,
            String transactionRef,
            String vnpTransactionNo) {
        UUID transactionId = transaction.getDealerTransactionId();

        if ("SUCCESS".equals(transaction.getStatus())) {
            log.warn("VNPAY IPN callback - Dealer transaction already processed - TransactionId: {}", transactionId);
            return transactionId;
        }

        if ("00".equals(responseCode) && "00".equals(transactionStatus)) {
            transaction.setStatus("SUCCESS");
            transaction.setTransactionCode(vnpTransactionNo);
            dealerTransactionRepository.save(transaction);

            DealerInvoice invoice = transaction.getDealerInvoice();
            if (invoice != null) {
                BigDecimal currentPaid = invoice.getAmountPaid() != null ? invoice.getAmountPaid() : BigDecimal.ZERO;
                BigDecimal newAmountPaid = currentPaid.add(transaction.getAmount());
                invoice.setAmountPaid(newAmountPaid);

                if (newAmountPaid.compareTo(invoice.getTotalAmount()) >= 0) {
                    invoice.setStatus("PAID");
                } else if (newAmountPaid.compareTo(BigDecimal.ZERO) > 0) {
                    invoice.setStatus(invoice.getDueDate().isBefore(LocalDate.now()) ? "OVERDUE" : "PARTIALLY_PAID");
                }

                dealerInvoiceRepository.save(invoice);
                updateDealerDebtRecord(invoice.getDealerId(), transaction.getAmount());
            }

            log.info("VNPAY IPN callback - Dealer payment successful - TransactionId: {}, InvoiceId: {}",
                    transactionId,
                    transaction.getDealerInvoice() != null ? transaction.getDealerInvoice().getDealerInvoiceId()
                            : null);
            return transactionId;
        }

        transaction.setStatus("FAILED");
        transaction.setTransactionCode(vnpTransactionNo);
        dealerTransactionRepository.save(transaction);

        log.warn(
                "VNPAY IPN callback - Dealer payment failed - TransactionId: {}, ResponseCode: {}, TransactionStatus: {}",
                transactionRef, responseCode, transactionStatus);
        return null;
    }

    private UUID handleDealerReturnCallback(DealerTransaction transaction,
            String responseCode,
            String transactionStatus,
            String vnpTransactionNo) {
        UUID transactionId = transaction.getDealerTransactionId();

        if ("PENDING_CONFIRMATION".equals(transaction.getStatus()) || "FAILED".equals(transaction.getStatus())) {
            log.warn("VNPAY Return callback - Dealer transaction already processed via return - TransactionId: {}",
                    transactionId);
            return transactionId;
        }

        if ("00".equals(responseCode) && "00".equals(transactionStatus)) {
            transaction.setStatus("PENDING_CONFIRMATION");
        } else {
            transaction.setStatus("FAILED");
        }

        transaction.setTransactionCode(vnpTransactionNo);
        dealerTransactionRepository.save(transaction);

        log.info("VNPAY Return callback - Dealer transaction updated - TransactionId: {}, Status: {}",
                transactionId, transaction.getStatus());
        return transactionId;
    }

    private void updateDealerDebtRecord(UUID dealerId, BigDecimal amountToAddToPaid) {
        if (dealerId == null || amountToAddToPaid == null || amountToAddToPaid.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        DealerDebtRecord debtRecord = dealerDebtRecordRepository.findById(dealerId)
                .orElse(DealerDebtRecord.builder()
                        .dealerId(dealerId)
                        .totalOwed(BigDecimal.ZERO)
                        .totalPaid(BigDecimal.ZERO)
                        .build());

        debtRecord.setTotalPaid(debtRecord.getTotalPaid().add(amountToAddToPaid));
        dealerDebtRecordRepository.save(debtRecord);
    }

    /**
     * Verify chữ ký callback từ VNPAY - Copy nguyên từ PaymentService.java
     */
    @Override
    public boolean verifyVnpayHash(Map<String, String> params) {
        String vnp_SecureHash = params.get("vnp_SecureHash");
        if (vnp_SecureHash == null || vnp_SecureHash.isEmpty()) {
            log.error(">>> [Verify] vnp_SecureHash is missing");
            return false;
        }

        Map<String, String> data = new HashMap<>(params);
        data.remove("vnp_SecureHash");
        data.remove("vnp_SecureHashType");

        // Xây dựng hash data string (giống khi tạo URL)
        List<String> keys = new ArrayList<>(data.keySet());
        Collections.sort(keys);

        StringBuilder hashData = new StringBuilder();
        for (String key : keys) {
            String value = data.get(key);
            if (value != null && !value.isEmpty()) {
                if (hashData.length() > 0) {
                    hashData.append("&");
                }
                // Chỉ encode vnp_ReturnUrl khi verify hash
                if ("vnp_ReturnUrl".equals(key)) {
                    hashData.append(key).append("=").append(URLEncoder.encode(value, StandardCharsets.UTF_8));
                } else {
                    hashData.append(key).append("=").append(value);
                }
            }
        }

        String hashDataStr = hashData.toString();
        String checkHash = hmacSHA512(vnpayConfig.getHashSecret(), hashDataStr);

        log.info(">>> [Verify] HashDataStr: {}", hashDataStr);
        log.info(">>> [Verify] Received vnp_SecureHash: {}", vnp_SecureHash);
        log.info(">>> [Verify] Calculated vnp_SecureHash: {}", checkHash);
        log.info(">>> [Verify] Hash match: {}", checkHash.equalsIgnoreCase(vnp_SecureHash));

        return checkHash.equalsIgnoreCase(vnp_SecureHash);
    }

    /**
     * Tự động tạo Sales Order từ PaymentRecord (booking deposit) sau khi thanh toán thành công.
     * Gọi sales-service qua REST API.
     */
    private void autoCreateSalesOrder(PaymentRecord paymentRecord, BigDecimal depositAmount) {
        try {
            log.info("=== AUTO-CREATE SALES ORDER === RecordId: {}, DepositAmount: {}",
                    paymentRecord.getRecordId(), depositAmount);

            String url = salesServiceUrl + "/api/v1/sales-orders/internal/from-booking-deposit";
            log.info("Calling Sales Service: {}", url);

            // Build request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("recordId", paymentRecord.getRecordId().toString());
            requestBody.put("customerId", paymentRecord.getCustomerId());
            requestBody.put("totalAmount", paymentRecord.getTotalAmount());
            requestBody.put("depositAmount", depositAmount);

            // Parse dealerId from metadata if available
            if (paymentRecord.getMetadata() != null) {
                try {
                    ObjectMapper mapper = new ObjectMapper();
                    Map<String, Object> metadata = mapper.readValue(paymentRecord.getMetadata(),
                            new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {});
                    if (metadata.containsKey("dealerId") && metadata.get("dealerId") != null) {
                        requestBody.put("dealerId", metadata.get("dealerId").toString());
                    }
                } catch (Exception e) {
                    log.warn("Failed to parse metadata for dealerId: {}", e.getMessage());
                }
            }

            // Set headers for internal call
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("X-User-Email", "system@vms.com");
            headers.set("X-User-Role", "ADMIN");
            headers.set("X-User-ProfileId", UUID.randomUUID().toString());

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> responseEntity = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    Map.class);

            Map<String, Object> response = responseEntity.getBody();
            if (response != null && response.get("data") != null) {
                Map<String, Object> orderData = (Map<String, Object>) response.get("data");
                String orderId = orderData.get("orderId") != null ? orderData.get("orderId").toString() : null;

                if (orderId != null) {
                    // Cập nhật PaymentRecord với orderId thực
                    paymentRecord.setOrderId(UUID.fromString(orderId));
                    paymentRecordRepository.save(paymentRecord);
                    log.info("=== AUTO-CREATE SUCCESS === SalesOrder created with orderId: {} for PaymentRecord: {}",
                            orderId, paymentRecord.getRecordId());
                }
            } else {
                log.warn("Auto-create sales order returned unexpected response: {}", response);
            }

        } catch (Exception e) {
            // Không throw exception - để không ảnh hưởng đến callback response
            log.error("=== AUTO-CREATE FAILED === Error auto-creating sales order for PaymentRecord: {} - Error: {}",
                    paymentRecord.getRecordId(), e.getMessage(), e);
        }
    }

    @Override
    public String getOrderIdByTransactionId(UUID transactionId) {
        try {
            Optional<Transaction> transaction = transactionRepository.findById(transactionId);
            if (transaction.isPresent() && transaction.get().getPaymentRecord() != null) {
                UUID orderId = transaction.get().getPaymentRecord().getOrderId();
                if (orderId != null) {
                    return orderId.toString();
                }
            }
        } catch (Exception e) {
            log.warn("Error getting orderId for transaction {}: {}", transactionId, e.getMessage());
        }
        return null;
    }
}