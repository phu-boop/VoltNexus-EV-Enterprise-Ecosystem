package com.ev.payment_service.controller;

import com.ev.payment_service.dto.request.PaymentMethodRequest;
import com.ev.payment_service.dto.response.PaymentMethodResponse;
import com.ev.payment_service.service.Interface.IPaymentMethodService;
import com.ev.payment_service.config.UserPrincipal;
import jakarta.validation.Valid; // << Import validation
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // << Import bảo mật
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/payments/methods") // << Đường dẫn base
@RequiredArgsConstructor
public class PaymentMethodController {

    private static final Logger log = LoggerFactory.getLogger(PaymentMethodController.class);
    private final IPaymentMethodService paymentMethodService;

    /**
     * [ADMIN] Tạo PTTT
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')") // << BẢO MẬT: Chỉ ADMIN
    public ResponseEntity<PaymentMethodResponse> createPaymentMethod(
            @Valid @RequestBody PaymentMethodRequest request) {

        PaymentMethodResponse response = paymentMethodService.createPaymentMethod(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * [ADMIN] Cập nhật PTTT
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')") // << BẢO MẬT: Chỉ ADMIN
    public ResponseEntity<PaymentMethodResponse> updatePaymentMethod(
            @PathVariable("id") UUID methodId,
            @Valid @RequestBody PaymentMethodRequest request) {

        PaymentMethodResponse response = paymentMethodService.updatePaymentMethod(methodId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * [ADMIN] Lấy tất cả PTTT
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF')") // << BẢO MẬT: Chỉ ADMIN
    public ResponseEntity<List<PaymentMethodResponse>> getAllPaymentMethods(
            @AuthenticationPrincipal UserPrincipal principal) {
        
        log.info("[PaymentMethodController] ===== CONTROLLER CALLED ===== GET /methods");
        
        // Debug logging
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        log.info("[PaymentMethodController] GET /methods - Authentication: {}", auth != null ? auth.getName() : "null");
        
        if (auth != null) {
            log.info("[PaymentMethodController] Principal: {}", auth.getPrincipal());
            log.info("[PaymentMethodController] Authorities: {}", 
                    auth.getAuthorities().stream()
                            .map(GrantedAuthority::getAuthority)
                            .collect(Collectors.toList()));
        }
        
        if (principal != null) {
            log.info("[PaymentMethodController] UserPrincipal - Email: {}, Role: {}, ProfileId: {}", 
                    principal.getEmail(), principal.getRole(), principal.getProfileId());
        } else {
            log.warn("[PaymentMethodController] UserPrincipal is NULL!");
        }
        
        return ResponseEntity.ok(paymentMethodService.getAllPaymentMethods());
    }

    /**
     * [PUBLIC] Lấy các PTTT đang active cho B2C (trang thanh toán của khách)
     */
    @GetMapping("/active-public")
    @PreAuthorize("permitAll()") // << PUBLIC: Ai cũng gọi được
    public ResponseEntity<List<PaymentMethodResponse>> getActivePublicMethods() {
        return ResponseEntity.ok(paymentMethodService.getActivePublicMethods());
    }

    /**
     * [USER] Lấy chi tiết PTTT theo ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()") // << BẢO MẬT: Chỉ cần đăng nhập
    public ResponseEntity<PaymentMethodResponse> getPaymentMethodById(@PathVariable("id") UUID methodId) {
        return ResponseEntity.ok(paymentMethodService.getPaymentMethodById(methodId));
    }

    /**
     * [DEALER_MANAGER] Lấy các PTTT đang hoạt động cho B2B (scope B2B hoặc ALL)
     */
    @GetMapping("/active-b2b")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF', 'DEALER_MANAGER')")
    public ResponseEntity<List<PaymentMethodResponse>> getActiveB2BMethods() {
        return ResponseEntity.ok(paymentMethodService.getActiveB2BMethods());
    }
}