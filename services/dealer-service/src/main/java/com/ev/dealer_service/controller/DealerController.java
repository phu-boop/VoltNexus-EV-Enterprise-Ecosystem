package com.ev.dealer_service.controller;

import com.ev.common_lib.dto.respond.ApiRespond;
import com.ev.common_lib.dto.dealer.DealerBasicDto;
import com.ev.dealer_service.dto.request.DealerRequest;
import com.ev.dealer_service.dto.response.ApiResponse;
import com.ev.dealer_service.dto.response.DealerResponse;
import com.ev.dealer_service.service.Interface.DealerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/dealers")
@RequiredArgsConstructor
public class DealerController {

    private final DealerService dealerService;

    // Xem danh sách tất cả dealer - chỉ ADMIN
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<ApiResponse<List<DealerResponse>>> getAllDealers(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String search) {
        List<DealerResponse> dealers;
        
        if (search != null && !search.isEmpty()) {
            dealers = dealerService.searchDealers(search);
        } else if (city != null && !city.isEmpty()) {
            dealers = dealerService.getDealersByCity(city);
        } else {
            dealers = dealerService.getAllDealers();
        }
        
        return ResponseEntity.ok(ApiResponse.success(dealers));
    }

    // Xem chi tiết dealer - ADMIN, DEALER_MANAGER, DEALER_STAFF
    @PreAuthorize("hasAnyRole('ADMIN', 'DEALER_MANAGER', 'DEALER_STAFF')")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DealerResponse>> getDealerById(@PathVariable UUID id) {
        DealerResponse dealer = dealerService.getDealerById(id);
        return ResponseEntity.ok(ApiResponse.success(dealer));
    }

    // Xem dealer theo code - ADMIN, DEALER_MANAGER, DEALER_STAFF
    @PreAuthorize("hasAnyRole('ADMIN', 'DEALER_MANAGER', 'DEALER_STAFF')")
    @GetMapping("/code/{code}")
    public ResponseEntity<ApiResponse<DealerResponse>> getDealerByCode(@PathVariable String code) {
        DealerResponse dealer = dealerService.getDealerByCode(code);
        return ResponseEntity.ok(ApiResponse.success(dealer));
    }

    // Tạo dealer mới - chỉ ADMIN
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<DealerResponse>> createDealer(@Valid @RequestBody DealerRequest request) {
        DealerResponse dealer = dealerService.createDealer(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Dealer created successfully", dealer));
    }

    // Cập nhật dealer - chỉ ADMIN
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DealerResponse>> updateDealer(
            @PathVariable UUID id,
            @Valid @RequestBody DealerRequest request) {
        DealerResponse dealer = dealerService.updateDealer(id, request);
        return ResponseEntity.ok(ApiResponse.success("Dealer updated successfully", dealer));
    }

    // Xóa dealer - chỉ ADMIN
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDealer(@PathVariable UUID id) {
        dealerService.deleteDealer(id);
        return ResponseEntity.ok(ApiResponse.success("Dealer deleted successfully", null));
    }

    // Xoá mềm dealer (chuyển Status sang SUSPENDED) - chỉ ADMIN
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/suspend")
    public ResponseEntity<ApiResponse<DealerResponse>> suspendDealer(@PathVariable UUID id) {
        DealerResponse dealer = dealerService.suspendDealer(id);
        return ResponseEntity.ok(ApiResponse.success("Dealer suspended successfully", dealer));
    }

    // Kích hoạt lại dealer (chuyển Status sang ACTIVE) - chỉ ADMIN
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<DealerResponse>> activateDealer(@PathVariable UUID id) {
        DealerResponse dealer = dealerService.activateDealer(id);
        return ResponseEntity.ok(ApiResponse.success("Dealer suspended successfully", dealer));
    }

    // Lấy danh sách rút gọn (ID và Tên) của tất cả đại lý.
    // Dùng cho các dropdown ở các service khác - tất cả role đều xem được
    @PreAuthorize("hasAnyRole('ADMIN', 'DEALER_MANAGER', 'DEALER_STAFF', 'EVM_STAFF', 'CUSTOMER')")
    @GetMapping("/list-all")
    public ResponseEntity<ApiRespond<List<DealerBasicDto>>> getAllDealersList() {
        List<DealerBasicDto> dealers = dealerService.getAllDealersBasicInfo();
        return ResponseEntity.ok(ApiRespond.success("Fetched all dealer names successfully", dealers));
    }
}

