package com.ev.customer_service.controller;

import com.ev.customer_service.dto.request.CustomerRequest;
import com.ev.customer_service.dto.response.CustomerResponse;
import com.ev.customer_service.enums.CustomerStatus;
import com.ev.customer_service.enums.CustomerType;
import com.ev.customer_service.service.CustomerService;
import com.ev.common_lib.dto.respond.ApiRespond;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Customer Service is running!");
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF', 'DEALER_MANAGER', 'DEALER_STAFF')")
    @GetMapping
    public ResponseEntity<ApiRespond<List<CustomerResponse>>> getAllCustomers(
            @RequestParam(required = false) String search,
            @RequestHeader(value = "X-User-Roles", required = false) String roles,
            @RequestHeader(value = "X-User-DealerId", required = false) String currentUserDealerId) {
        log.info("GET /customers - search: '{}', roles: '{}', dealerId: '{}'", search, roles, currentUserDealerId);
        
        try {
            List<CustomerResponse> customers = customerService.getCustomersWithFilter(search, roles, currentUserDealerId);
            return ResponseEntity.ok(ApiRespond.success("Customers retrieved successfully", customers));
        } catch (Exception e) {
            log.error("Error in getAllCustomers: ", e);
            throw e;
        }
    }

    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN', 'EVM_STAFF', 'DEALER_MANAGER', 'DEALER_STAFF')")
    @GetMapping("/{id}")
    public ResponseEntity<ApiRespond<CustomerResponse>> getCustomerById(@PathVariable String id) {
        Long customerId = Long.parseLong(id);
        CustomerResponse customer = customerService.getCustomerById(customerId);
        return ResponseEntity.ok(ApiRespond.success("Customer retrieved successfully", customer));
    }
    
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN', 'EVM_STAFF', 'DEALER_MANAGER', 'DEALER_STAFF')")
    @GetMapping("/profile/{profileId}")
    public ResponseEntity<ApiRespond<CustomerResponse>> getCustomerByProfileId(@PathVariable String profileId) {
        log.info("Fetching customer by profileId: {}", profileId);
        CustomerResponse customer = customerService.getCustomerByProfileId(profileId);
        return ResponseEntity.ok(ApiRespond.success("Customer retrieved successfully", customer));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'DEALER_MANAGER', 'DEALER_STAFF')")
    @PostMapping
    public ResponseEntity<ApiRespond<CustomerResponse>> createCustomer(
            @Valid @RequestBody CustomerRequest request,
            @RequestHeader(value = "X-User-Roles", required = false) String roles,
            @RequestHeader(value = "X-User-DealerId", required = false) String currentUserDealerId) {
        CustomerResponse customer = customerService.createCustomer(request, roles, currentUserDealerId);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiRespond.success("Customer created successfully", customer));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'DEALER_MANAGER', 'DEALER_STAFF')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiRespond<CustomerResponse>> updateCustomer(
            @PathVariable String id,
            @Valid @RequestBody CustomerRequest request,
            @RequestHeader(value = "X-User-Roles", required = false) String roles,
            @RequestHeader(value = "X-User-DealerId", required = false) String currentUserDealerId) {
        Long customerId = Long.parseLong(id);
        CustomerResponse customer = customerService.updateCustomer(customerId, request, roles, currentUserDealerId);
        return ResponseEntity.ok(ApiRespond.success("Customer updated successfully", customer));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiRespond<Void>> deleteCustomer(
            @PathVariable String id,
            @RequestHeader(value = "X-User-Roles", required = false) String roles,
            @RequestHeader(value = "X-User-DealerId", required = false) String currentUserDealerId) {
        Long customerId = Long.parseLong(id);
        customerService.deleteCustomer(customerId, roles, currentUserDealerId);
        return ResponseEntity.ok(ApiRespond.success("Customer deleted successfully", (Void) null));
    }

    /**
     * Get available customer statuses
     * GET /customers/enums/statuses
     */
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN', 'EVM_STAFF', 'DEALER_MANAGER', 'DEALER_STAFF')")
    @GetMapping("/enums/statuses")
    public ResponseEntity<ApiRespond<List<Map<String, String>>>> getCustomerStatuses() {
        List<Map<String, String>> statuses = Arrays.stream(CustomerStatus.values())
                .map(status -> Map.of(
                    "value", status.name(),
                    "displayName", status.getDisplayName()
                ))
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiRespond.success("Customer statuses retrieved successfully", statuses));
    }

    /**
     * Get available customer types
     * GET /customers/enums/types
     */
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN', 'EVM_STAFF', 'DEALER_MANAGER', 'DEALER_STAFF')")
    @GetMapping("/enums/types")
    public ResponseEntity<ApiRespond<List<Map<String, String>>>> getCustomerTypes() {
        List<Map<String, String>> types = Arrays.stream(CustomerType.values())
                .map(type -> Map.of(
                    "value", type.name(),
                    "displayName", type.getDisplayName()
                ))
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiRespond.success("Customer types retrieved successfully", types));
    }

    /**
     * Get audit history for a customer
     * GET /customers/{id}/audit-history
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF')")
    @GetMapping("/{id}/audit-history")
    public ResponseEntity<ApiRespond<List<com.ev.customer_service.dto.response.AuditResponse>>> getCustomerAuditHistory(@PathVariable String id) {
        Long customerId = Long.parseLong(id);
        List<com.ev.customer_service.dto.response.AuditResponse> audits = customerService.getCustomerAuditHistory(customerId);
        return ResponseEntity.ok(ApiRespond.success("Audit history retrieved successfully", audits));
    }
}
