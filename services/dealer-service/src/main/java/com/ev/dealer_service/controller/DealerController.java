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
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/dealers")
@RequiredArgsConstructor
public class DealerController {

    private final DealerService dealerService;


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

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DealerResponse>> getDealerById(@PathVariable UUID id) {
        DealerResponse dealer = dealerService.getDealerById(id);
        return ResponseEntity.ok(ApiResponse.success(dealer));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<ApiResponse<DealerResponse>> getDealerByCode(@PathVariable String code) {
        DealerResponse dealer = dealerService.getDealerByCode(code);
        return ResponseEntity.ok(ApiResponse.success(dealer));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DealerResponse>> createDealer(@Valid @RequestBody DealerRequest request) {
        DealerResponse dealer = dealerService.createDealer(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Dealer created successfully", dealer));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DealerResponse>> updateDealer(
            @PathVariable UUID id,
            @Valid @RequestBody DealerRequest request) {
        DealerResponse dealer = dealerService.updateDealer(id, request);
        return ResponseEntity.ok(ApiResponse.success("Dealer updated successfully", dealer));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDealer(@PathVariable UUID id) {
        dealerService.deleteDealer(id);
        return ResponseEntity.ok(ApiResponse.success("Dealer deleted successfully", null));
    }


    // Xoá mềm dealer (chuyển Status sang SUSPENDED)
    @PutMapping("/{id}/suspend")
    public ResponseEntity<ApiResponse<DealerResponse>> suspendDealer(@PathVariable UUID id) {
        DealerResponse dealer = dealerService.suspendDealer(id);
        return ResponseEntity.ok(ApiResponse.success("Dealer suspended successfully", dealer));
    }


    // Kích hoạt lại dealer (chuyển Status sang ACTIVE)
    @PutMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<DealerResponse>> activateDealer(@PathVariable UUID id) {
        DealerResponse dealer = dealerService.activateDealer(id);
        return ResponseEntity.ok(ApiResponse.success("Dealer suspended successfully", dealer));
    }

     // Lấy danh sách rút gọn (ID và Tên) của tất cả đại lý.
     // Dùng cho các dropdown ở các service khác.

    @GetMapping("/list-all")
    public ResponseEntity<ApiRespond<List<DealerBasicDto>>> getAllDealersList() {
        List<DealerBasicDto> dealers = dealerService.getAllDealersBasicInfo();
        return ResponseEntity.ok(ApiRespond.success("Fetched all dealer names successfully", dealers));
    }
}
