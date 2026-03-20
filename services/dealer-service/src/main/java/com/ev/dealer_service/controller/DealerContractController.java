package com.ev.dealer_service.controller;

import com.ev.dealer_service.dto.request.DealerContractRequest;
import com.ev.dealer_service.dto.response.ApiResponse;
import com.ev.dealer_service.dto.response.DealerContractResponse;
import com.ev.dealer_service.service.DealerContractService;
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
public class DealerContractController {

    private final DealerContractService contractService;

    @GetMapping("/{dealerId}/contract")
    public ResponseEntity<ApiResponse<List<DealerContractResponse>>> getContractsByDealerId(@PathVariable UUID dealerId) {
        List<DealerContractResponse> contracts = contractService.getContractsByDealerId(dealerId);
        return ResponseEntity.ok(ApiResponse.success(contracts));
    }

    @GetMapping("/contracts/{id}")
    public ResponseEntity<ApiResponse<DealerContractResponse>> getContractById(@PathVariable Long id) {
        DealerContractResponse contract = contractService.getContractById(id);
        return ResponseEntity.ok(ApiResponse.success(contract));
    }

    @PostMapping("/{dealerId}/contract")
    public ResponseEntity<ApiResponse<DealerContractResponse>> createContract(
            @PathVariable UUID dealerId,
            @Valid @RequestBody DealerContractRequest request) {
        request.setDealerId(dealerId);
        DealerContractResponse contract = contractService.createContract(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Contract created successfully", contract));
    }

    @PutMapping("/contracts/{id}")
    public ResponseEntity<ApiResponse<DealerContractResponse>> updateContract(
            @PathVariable Long id,
            @Valid @RequestBody DealerContractRequest request) {
        DealerContractResponse contract = contractService.updateContract(id, request);
        return ResponseEntity.ok(ApiResponse.success("Contract updated successfully", contract));
    }
}
