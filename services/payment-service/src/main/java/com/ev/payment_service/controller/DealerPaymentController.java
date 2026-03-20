package com.ev.payment_service.controller;

import com.ev.payment_service.dto.request.ConfirmDealerTransactionRequest;
import com.ev.payment_service.dto.request.CreateDealerInvoiceRequest;
import com.ev.payment_service.dto.request.PayDealerInvoiceRequest;
import com.ev.payment_service.dto.request.DealerVnpayInitiateRequest;
import com.ev.payment_service.dto.response.DealerDebtSummaryResponse;
import com.ev.payment_service.dto.response.DealerInvoiceResponse;
import com.ev.payment_service.dto.response.DealerTransactionResponse;
import com.ev.payment_service.service.Interface.IDealerPaymentService;
import com.ev.payment_service.service.Interface.IVnpayService;
import com.ev.payment_service.config.UserPrincipal;
import com.ev.common_lib.dto.respond.ApiRespond;
import com.ev.common_lib.exception.AppException;
import com.ev.common_lib.exception.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments/dealer")
@RequiredArgsConstructor
@Slf4j
public class DealerPaymentController {

    private final IDealerPaymentService dealerPaymentService;
    private final IVnpayService vnpayService;
    private final RestTemplate restTemplate;

    @Value("${user-service.url}")
    private String userServiceUrl;

    /**
     * API 1: Tạo hóa đơn công nợ cho Đại lý (EVM Staff)
     * POST /api/v1/payments/dealer/invoices
     */
    @PostMapping("/invoices")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF')")
    public ResponseEntity<DealerInvoiceResponse> createDealerInvoice(
            @Valid @RequestBody CreateDealerInvoiceRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {

        log.info("[DealerPaymentController] POST /invoices - Request: dealerId={}, amount={}, dueDate={}",
                request.getDealerId(), request.getAmount(), request.getDueDate());
        log.info("[DealerPaymentController] UserPrincipal - Email: {}, Role: {}, ProfileId: {}",
                principal != null ? principal.getEmail() : "null",
                principal != null ? principal.getRole() : "null",
                principal != null ? principal.getProfileId() : "null");

        // Lấy staffId từ principal (ProfileId là userId từ user-service)
        UUID staffId = principal.getProfileId();
        if (staffId == null) {
            log.error("[DealerPaymentController] StaffId is null in principal");
            throw new com.ev.common_lib.exception.AppException(com.ev.common_lib.exception.ErrorCode.BAD_REQUEST);
        }

        DealerInvoiceResponse response = dealerPaymentService.createDealerInvoice(request, staffId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * API 2: Đại lý thanh toán hóa đơn (Dealer Manager)
     * POST /api/v1/payments/dealer/invoices/{invoiceId}/pay
     */
    @PostMapping("/invoices/{invoiceId}/pay")
    @PreAuthorize("hasRole('DEALER_MANAGER')")
    public ResponseEntity<DealerTransactionResponse> payDealerInvoice(
            @PathVariable UUID invoiceId,
            @Valid @RequestBody PayDealerInvoiceRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {

        log.info("[DealerPaymentController] POST /invoices/{}/pay - Request: amount={}, paymentMethodId={}",
                invoiceId, request.getAmount(), request.getPaymentMethodId());
        log.info("[DealerPaymentController] UserPrincipal - Email: {}, Role: {}, ProfileId: {}",
                principal != null ? principal.getEmail() : "null",
                principal != null ? principal.getRole() : "null",
                principal != null ? principal.getProfileId() : "null");

        // Lấy dealerId từ principal
        // ProfileId của DEALER_MANAGER là managerId, không phải dealerId
        // Cần gọi User Service để lấy dealerId từ managerId
        UUID managerId = principal.getProfileId();
        if (managerId == null) {
            log.error("[DealerPaymentController] ManagerId is null in principal");
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        UUID dealerId = getDealerIdFromManagerId(managerId);
        if (dealerId == null) {
            log.error("[DealerPaymentController] Failed to get dealerId from managerId: {}", managerId);
            throw new AppException(ErrorCode.DOWNSTREAM_SERVICE_UNAVAILABLE);
        }

        log.info("[DealerPaymentController] Got dealerId from User Service - ManagerId: {}, DealerId: {}",
                managerId, dealerId);

        DealerTransactionResponse response = dealerPaymentService.payDealerInvoice(invoiceId, request, dealerId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * API 2.1: Khởi tạo thanh toán VNPAY cho hóa đơn B2B (Dealer Manager)
     * POST /api/v1/payments/dealer/invoices/{invoiceId}/vnpay/initiate
     */
    @PostMapping("/invoices/{invoiceId}/vnpay/initiate")
    @PreAuthorize("hasRole('DEALER_MANAGER')")
    public ResponseEntity<Map<String, String>> initiateDealerInvoiceVnpay(
            @PathVariable UUID invoiceId,
            @Valid @RequestBody DealerVnpayInitiateRequest request,
            HttpServletRequest httpServletRequest,
            @AuthenticationPrincipal UserPrincipal principal) {

        if (principal == null || principal.getProfileId() == null) {
            log.error("[DealerPaymentController] Missing principal when initiate VNPAY - InvoiceId: {}", invoiceId);
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        UUID managerId = principal.getProfileId();
        UUID dealerId = getDealerIdFromManagerId(managerId);
        if (dealerId == null) {
            log.error("[DealerPaymentController] Failed to resolve dealerId for manager {} when initiate VNPAY",
                    managerId);
            throw new AppException(ErrorCode.DOWNSTREAM_SERVICE_UNAVAILABLE);
        }

        String clientIp = getClientIpAddr(httpServletRequest);
        String paymentUrl = vnpayService.initiateDealerInvoicePayment(
                invoiceId,
                dealerId,
                request.getAmount(),
                request.getReturnUrl(),
                clientIp);

        return ResponseEntity.ok(Map.of("url", paymentUrl));
    }

    /**
     * API 3: EVM Staff xác nhận thanh toán từ Đại lý
     * POST /api/v1/payments/dealer/transactions/{transactionId}/confirm
     */
    @PostMapping("/transactions/{transactionId}/confirm")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF')")
    public ResponseEntity<DealerTransactionResponse> confirmDealerTransaction(
            @PathVariable UUID transactionId,
            @RequestBody(required = false) ConfirmDealerTransactionRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {

        log.info("[DealerPaymentController] POST /transactions/{}/confirm", transactionId);
        log.info("[DealerPaymentController] UserPrincipal - Email: {}, Role: {}, ProfileId: {}",
                principal != null ? principal.getEmail() : "null",
                principal != null ? principal.getRole() : "null",
                principal != null ? principal.getProfileId() : "null");

        // Lấy staffId từ principal (ProfileId là userId từ user-service)
        UUID staffId = principal.getProfileId();
        if (staffId == null) {
            log.error("[DealerPaymentController] StaffId is null in principal");
            throw new com.ev.common_lib.exception.AppException(com.ev.common_lib.exception.ErrorCode.BAD_REQUEST);
        }

        String notes = request != null ? request.getNotes() : null;
        DealerTransactionResponse response = dealerPaymentService.confirmDealerTransaction(transactionId, staffId,
                notes);
        return ResponseEntity.ok(response);
    }

    /**
     * API 4.1: Lấy chi tiết hóa đơn theo ID
     * GET /api/v1/payments/dealer/{dealerId}/invoices/{invoiceId}
     * 
     * Lưu ý: Endpoint này PHẢI được đặt TRƯỚC endpoint GET /{dealerId}/invoices
     * để Spring có thể match path chính xác (path cụ thể hơn phải được khai báo
     * trước)
     */
    @GetMapping("/{dealerId}/invoices/{invoiceId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEALER_MANAGER', 'EVM_STAFF')")
    public ResponseEntity<DealerInvoiceResponse> getDealerInvoiceById(
            @PathVariable UUID dealerId,
            @PathVariable UUID invoiceId,
            @AuthenticationPrincipal UserPrincipal principal) {

        log.info("[DealerPaymentController] GET /{}/invoices/{}", dealerId, invoiceId);
        log.info("[DealerPaymentController] UserPrincipal - Email: {}, Role: {}, ProfileId: {}",
                principal != null ? principal.getEmail() : "null",
                principal != null ? principal.getRole() : "null",
                principal != null ? principal.getProfileId() : "null");

        // Lấy invoice
        DealerInvoiceResponse invoice = dealerPaymentService.getDealerInvoiceById(invoiceId);

        // Validate dealerId trong path match với invoice dealerId
        if (!dealerId.equals(invoice.getDealerId())) {
            log.error("[DealerPaymentController] Path dealerId does not match invoice dealerId - Path: {}, Invoice: {}",
                    dealerId, invoice.getDealerId());
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        // Authorization: Nếu là DEALER_MANAGER, chỉ được xem invoice của chính mình
        if (principal != null && "DEALER_MANAGER".equals(principal.getRole())) {
            UUID managerId = principal.getProfileId();
            if (managerId == null) {
                log.error("[DealerPaymentController] ManagerId is null for DEALER_MANAGER");
                throw new AppException(ErrorCode.BAD_REQUEST);
            }

            UUID principalDealerId = getDealerIdFromManagerId(managerId);

            if (principalDealerId == null) {
                log.error("[DealerPaymentController] Failed to get dealerId from User Service for ManagerId: {}",
                        managerId);
                throw new AppException(ErrorCode.DOWNSTREAM_SERVICE_UNAVAILABLE);
            }

            // Validate principal dealerId match với invoice dealerId
            if (!principalDealerId.equals(invoice.getDealerId())) {
                log.error(
                        "[DealerPaymentController] DealerManager can only view their own invoices - Requested Invoice DealerId: {}, Principal DealerId: {}, ManagerId: {}",
                        invoice.getDealerId(), principalDealerId, managerId);
                throw new AppException(ErrorCode.FORBIDDEN);
            }

            log.info("[DealerPaymentController] DealerManager authorized - Invoice DealerId: {}, ManagerId: {}",
                    invoice.getDealerId(), managerId);
        }
        // EVM_STAFF và ADMIN có thể xem tất cả invoices (không cần check)

        return ResponseEntity.ok(invoice);
    }

    /**
     * API 4: Lấy danh sách hóa đơn của một Đại lý
     * GET /api/v1/payments/dealer/{dealerId}/invoices
     */
    @GetMapping("/{dealerId}/invoices")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEALER_MANAGER', 'EVM_STAFF')")
    public ResponseEntity<Page<DealerInvoiceResponse>> getDealerInvoices(
            @PathVariable UUID dealerId,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable,
            @AuthenticationPrincipal UserPrincipal principal) {

        log.info("[DealerPaymentController] GET /{}/invoices - Status: {}", dealerId, status);
        log.info("[DealerPaymentController] UserPrincipal - Email: {}, Role: {}, ProfileId: {}",
                principal != null ? principal.getEmail() : "null",
                principal != null ? principal.getRole() : "null",
                principal != null ? principal.getProfileId() : "null");

        // Authorization: Nếu là DEALER_MANAGER, chỉ được xem invoices của chính mình
        if (principal != null && "DEALER_MANAGER".equals(principal.getRole())) {
            // ProfileId của DEALER_MANAGER là managerId, không phải dealerId
            // Cần gọi User Service để lấy dealerId từ managerId
            UUID managerId = principal.getProfileId();
            if (managerId == null) {
                log.error("[DealerPaymentController] ManagerId is null for DEALER_MANAGER");
                throw new AppException(ErrorCode.BAD_REQUEST);
            }

            UUID principalDealerId = getDealerIdFromManagerId(managerId);

            // Nếu không lấy được dealerId từ User Service, trả về lỗi service unavailable
            if (principalDealerId == null) {
                log.error("[DealerPaymentController] Failed to get dealerId from User Service for ManagerId: {}",
                        managerId);
                throw new AppException(ErrorCode.DOWNSTREAM_SERVICE_UNAVAILABLE);
            }

            // Kiểm tra dealerId có match không
            if (!principalDealerId.equals(dealerId)) {
                log.error(
                        "[DealerPaymentController] DealerManager can only view their own invoices - Requested: {}, Principal DealerId: {}, ManagerId: {}",
                        dealerId, principalDealerId, managerId);
                throw new AppException(ErrorCode.FORBIDDEN);
            }

            log.info("[DealerPaymentController] DealerManager authorized - DealerId: {}, ManagerId: {}",
                    principalDealerId, managerId);
        }

        // EVM_STAFF và ADMIN có thể xem invoices của tất cả dealers (không cần check)

        Page<DealerInvoiceResponse> response = dealerPaymentService.getDealerInvoices(dealerId, status, pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * API 4.1 (Alternative): Lấy chi tiết hóa đơn theo ID (không cần dealerId trong
     * path)
     * GET /api/v1/payments/dealer/invoices/{invoiceId}
     */
    @GetMapping("/invoices/{invoiceId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEALER_MANAGER', 'EVM_STAFF')")
    public ResponseEntity<DealerInvoiceResponse> getDealerInvoiceByIdAlternative(
            @PathVariable UUID invoiceId,
            @AuthenticationPrincipal UserPrincipal principal) {

        log.info("[DealerPaymentController] GET /invoices/{}", invoiceId);
        log.info("[DealerPaymentController] UserPrincipal - Email: {}, Role: {}, ProfileId: {}",
                principal != null ? principal.getEmail() : "null",
                principal != null ? principal.getRole() : "null",
                principal != null ? principal.getProfileId() : "null");

        // Lấy invoice
        DealerInvoiceResponse invoice = dealerPaymentService.getDealerInvoiceById(invoiceId);

        // Authorization: Nếu là DEALER_MANAGER, chỉ được xem invoice của chính mình
        if (principal != null && "DEALER_MANAGER".equals(principal.getRole())) {
            UUID managerId = principal.getProfileId();
            if (managerId == null) {
                log.error("[DealerPaymentController] ManagerId is null for DEALER_MANAGER");
                throw new AppException(ErrorCode.BAD_REQUEST);
            }

            UUID principalDealerId = getDealerIdFromManagerId(managerId);

            if (principalDealerId == null) {
                log.error("[DealerPaymentController] Failed to get dealerId from User Service for ManagerId: {}",
                        managerId);
                throw new AppException(ErrorCode.DOWNSTREAM_SERVICE_UNAVAILABLE);
            }

            // Validate principal dealerId match với invoice dealerId
            if (!principalDealerId.equals(invoice.getDealerId())) {
                log.error(
                        "[DealerPaymentController] DealerManager can only view their own invoices - Requested Invoice DealerId: {}, Principal DealerId: {}, ManagerId: {}",
                        invoice.getDealerId(), principalDealerId, managerId);
                throw new AppException(ErrorCode.FORBIDDEN);
            }

            log.info("[DealerPaymentController] DealerManager authorized - Invoice DealerId: {}, ManagerId: {}",
                    invoice.getDealerId(), managerId);
        }
        // EVM_STAFF và ADMIN có thể xem tất cả invoices (không cần check)

        return ResponseEntity.ok(invoice);
    }

    /**
     * API 5: Lấy tổng hợp công nợ của tất cả Đại lý (EVM Staff)
     * GET /api/v1/payments/dealer/debt-summary
     */
    @GetMapping("/debt-summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF')")
    public ResponseEntity<Page<DealerDebtSummaryResponse>> getDealerDebtSummary(
            @PageableDefault(size = 10, sort = "currentBalance") Pageable pageable) {

        log.info("[DealerPaymentController] GET /debt-summary");

        Page<DealerDebtSummaryResponse> response = dealerPaymentService.getDealerDebtSummary(pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * API 6: Kiểm tra xem đơn hàng đã có hóa đơn chưa
     * GET /api/v1/payments/dealer/orders/{orderId}/has-invoice
     */
    @GetMapping("/orders/{orderId}/has-invoice")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF')")
    public ResponseEntity<Map<String, Boolean>> checkOrderHasInvoice(@PathVariable UUID orderId) {
        log.info("[DealerPaymentController] GET /orders/{}/has-invoice", orderId);

        boolean hasInvoice = dealerPaymentService.hasInvoiceForOrder(orderId);
        Map<String, Boolean> response = new HashMap<>();
        response.put("hasInvoice", hasInvoice);

        return ResponseEntity.ok(response);
    }

    /**
     * API 7: Lấy danh sách thanh toán tiền mặt chờ duyệt (EVM Staff)
     * GET /api/v1/payments/dealer/pending-cash-payments
     */
    @GetMapping("/pending-cash-payments")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF')")
    public ResponseEntity<Page<DealerTransactionResponse>> getPendingCashPayments(
            @PageableDefault(size = 10, sort = "transactionDate") Pageable pageable) {
        log.info("[DealerPaymentController] GET /pending-cash-payments");

        Page<DealerTransactionResponse> response = dealerPaymentService.getPendingCashPayments(pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy dealerId từ managerId (hoặc staffId) bằng cách gọi User Service
     * 
     * @param managerId ManagerId hoặc StaffId (ProfileId của DEALER_MANAGER hoặc
     *                  DEALER_STAFF)
     * @return DealerId
     */
    private UUID getDealerIdFromManagerId(UUID managerId) {
        if (managerId == null) {
            log.error("[DealerPaymentController] ManagerId is null");
            return null;
        }

        try {
            String url = userServiceUrl + "/users/profile/idDealer";
            log.info("[DealerPaymentController] Calling User Service to get dealerId - URL: {}, ManagerId: {}", url,
                    managerId);

            // Tạo request body
            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("idDealer", managerId.toString());

            // Gọi User Service API
            ParameterizedTypeReference<ApiRespond<UUID>> responseType = new ParameterizedTypeReference<ApiRespond<UUID>>() {
            };

            // Tạo HttpEntity với headers
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);

            org.springframework.http.HttpEntity<Map<String, String>> requestEntity = new org.springframework.http.HttpEntity<>(
                    requestBody, headers);

            ResponseEntity<ApiRespond<UUID>> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    responseType);

            ApiRespond<UUID> apiResponse = response.getBody();
            if (apiResponse == null || apiResponse.getData() == null) {
                log.error("[DealerPaymentController] Failed to get dealerId from User Service - Response is null");
                return null;
            }

            UUID dealerId = apiResponse.getData();
            log.info(
                    "[DealerPaymentController] Successfully got dealerId from User Service - ManagerId: {}, DealerId: {}",
                    managerId, dealerId);
            return dealerId;

        } catch (RestClientException e) {
            log.error("[DealerPaymentController] Failed to get dealerId from User Service - ManagerId: {}, Error: {}",
                    managerId, e.getMessage(), e);
            // Nếu User Service không available, không thể xác định dealerId
            // Trả về null để caller có thể xử lý
            return null;
        } catch (Exception e) {
            log.error(
                    "[DealerPaymentController] Unexpected error getting dealerId from User Service - ManagerId: {}, Error: {}",
                    managerId, e.getMessage(), e);
            return null;
        }
    }

    /**
     * Helper dùng chung để lấy IP client phục vụ VNPAY.
     */
    private String getClientIpAddr(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip != null && !ip.isEmpty()) {
            ip = ip.split(",")[0].trim();
            if (ip.equals("0:0:0:0:0:0:0:1") || ip.equals("::1"))
                ip = "127.0.0.1";
            if ("127.0.0.1".equals(ip)) {
                return "139.180.217.147"; // IP test hợp lệ của VNPAY
            }
            return ip;
        }

        ip = request.getHeader("X-Real-IP");
        if (ip != null && !ip.isEmpty()) {
            if (ip.equals("0:0:0:0:0:0:0:1") || ip.equals("::1"))
                ip = "127.0.0.1";
            if ("127.0.0.1".equals(ip)) {
                return "139.180.217.147"; // IP test hợp lệ của VNPAY
            }
            return ip;
        }

        ip = request.getRemoteAddr();
        if (ip.equals("0:0:0:0:0:0:0:1") || ip.equals("::1"))
            ip = "127.0.0.1";
        if ("127.0.0.1".equals(ip)) {
            return "139.180.217.147"; // IP test hợp lệ của VNPAY
        }
        return ip;
    }
}
