package com.ev.sales_service.controller;

import com.ev.sales_service.dto.request.SalesContractRequest;
import com.ev.sales_service.dto.response.SalesContractResponse;
import com.ev.sales_service.enums.ContractStatus;
import com.ev.sales_service.service.Interface.SalesContractService;
import com.ev.common_lib.dto.respond.ApiRespond;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/sales-contracts")
@RequiredArgsConstructor
@Slf4j
public class SalesContractController {

    private final SalesContractService salesContractService;

    @PostMapping
    public ResponseEntity<ApiRespond<SalesContractResponse>> createContract(@RequestBody SalesContractRequest request) {
        log.info("Creating sales contract for order: {}", request.getOrderId());
        SalesContractResponse response = salesContractService.createContract(request);
        return ResponseEntity.ok(ApiRespond.success("Sales contract created successfully", response));
    }

    @PutMapping("/{contractId}")
    public ResponseEntity<ApiRespond<SalesContractResponse>> updateContract(
            @PathVariable UUID contractId,
            @RequestBody SalesContractRequest request) {
        log.info("Updating sales contract: {}", contractId);
        SalesContractResponse response = salesContractService.updateContract(contractId, request);
        return ResponseEntity.ok(ApiRespond.success("Sales contract updated successfully", response));
    }

    @GetMapping("/{contractId}")
    public ResponseEntity<ApiRespond<SalesContractResponse>> getContractById(@PathVariable UUID contractId) {
        log.info("Fetching sales contract: {}", contractId);
        SalesContractResponse response = salesContractService.getContractById(contractId);
        return ResponseEntity.ok(ApiRespond.success("Sales contract fetched successfully", response));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<ApiRespond<SalesContractResponse>> getContractByOrderId(@PathVariable UUID orderId) {
        log.info("Fetching sales contract for order: {}", orderId);
        SalesContractResponse response = salesContractService.getContractByOrderId(orderId);
        return ResponseEntity.ok(ApiRespond.success("Sales contract fetched successfully", response));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiRespond<List<SalesContractResponse>>> getContractsByStatus(@PathVariable String status) {
        log.info("Fetching sales contracts with status: {}", status);
        List<SalesContractResponse> responses = salesContractService.getContractsByStatus(status);
        return ResponseEntity.ok(ApiRespond.success("Sales contracts fetched successfully", responses));
    }

    @PutMapping("/{contractId}/sign")
    public ResponseEntity<ApiRespond<SalesContractResponse>> signContract(
            @PathVariable UUID contractId,
            @RequestParam String digitalSignature) {
        log.info("Signing contract: {}", contractId);
        SalesContractResponse response = salesContractService.signContract(contractId, digitalSignature);
        return ResponseEntity.ok(ApiRespond.success("Contract signed successfully", response));
    }

    @PutMapping("/{contractId}/status")
    public ResponseEntity<ApiRespond<SalesContractResponse>> updateContractStatus(
            @PathVariable UUID contractId,
            @RequestParam String status) {
        log.info("Updating contract status: {} to {}", contractId, status);
        SalesContractResponse response = salesContractService.updateContractStatus(contractId, status);
        return ResponseEntity.ok(ApiRespond.success("Contract status updated successfully", response));
    }

    @PostMapping("/order/{orderId}/generate")
    public ResponseEntity<ApiRespond<SalesContractResponse>> generateContractFromTemplate(@PathVariable UUID orderId) {
        log.info("Generating contract from template for order: {}", orderId);
        SalesContractResponse response = salesContractService.generateContractFromTemplate(orderId);
        return ResponseEntity.ok(ApiRespond.success("Contract generated successfully", response));
    }

    @PostMapping("/{contractId}/validate")
    public ResponseEntity<ApiRespond<Void>> validateContract(@PathVariable UUID contractId) {
        log.info("Validating contract: {}", contractId);
        salesContractService.validateContract(contractId);
        return ResponseEntity.ok(ApiRespond.success("Contract validated successfully",null));
    }

    @GetMapping("/expiring")
    public ResponseEntity<ApiRespond<List<SalesContractResponse>>> getExpiringContracts(@RequestParam int days) {
        log.info("Fetching contracts expiring in {} days", days);
        List<SalesContractResponse> responses = salesContractService.getExpiringContracts(days);
        return ResponseEntity.ok(ApiRespond.success("Expiring contracts fetched successfully", responses));
    }
    // Lấy tất cả hợp đồng
    @GetMapping
    public ResponseEntity<ApiRespond<List<SalesContractResponse>>> getAllContracts() {
        log.info("Fetching all sales contracts");
        List<SalesContractResponse> responses = salesContractService.getAllContracts();
        return ResponseEntity.ok(ApiRespond.success("All contracts fetched successfully", responses));
    }

    // Xóa hợp đồng
    @DeleteMapping("/{contractId}")
    public ResponseEntity<ApiRespond<Void>> deleteContract(@PathVariable UUID contractId) {
        log.info("Deleting contract: {}", contractId);
        salesContractService.deleteContract(contractId);
        return ResponseEntity.ok(ApiRespond.success("Contract deleted successfully", null));
    }

    // Xóa(mem) hợp đồng
    @PostMapping("/{contractId}")
    public ResponseEntity<ApiRespond<Void>> cancleContract(@PathVariable UUID contractId) {
        log.info("Deleting contract: {}", contractId);
        salesContractService.cancleContract(contractId);
        return ResponseEntity.ok(ApiRespond.success("Contract cancel successfully", null));
    }

    // Tìm kiếm hợp đồng (filter theo khách hàng, trạng thái hoặc số hợp đồng)
    @GetMapping("/search")
    public ResponseEntity<ApiRespond<List<SalesContractResponse>>> searchContracts(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) ContractStatus status) {
        log.info("Searching contracts with customerId: {}, status: {}", customerId, status);
        List<SalesContractResponse> responses = salesContractService.searchContracts(customerId, status);
        return ResponseEntity.ok(ApiRespond.success("Contracts search results", responses));
    }

}