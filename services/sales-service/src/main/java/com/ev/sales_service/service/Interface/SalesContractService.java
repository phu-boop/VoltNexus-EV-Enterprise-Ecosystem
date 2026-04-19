package com.ev.sales_service.service.Interface;

import com.ev.sales_service.dto.request.SalesContractRequest;
import com.ev.sales_service.dto.response.SalesContractResponse;
import com.ev.sales_service.enums.ContractStatus;

import java.util.List;
import java.util.UUID;

public interface SalesContractService {
    SalesContractResponse createContract(SalesContractRequest request);

    SalesContractResponse updateContract(UUID contractId, SalesContractRequest request);

    SalesContractResponse getContractById(UUID contractId);

    SalesContractResponse getContractByOrderId(UUID orderId);

    List<SalesContractResponse> getContractsByStatus(String status);

    SalesContractResponse signContract(UUID contractId, String digitalSignature);

    SalesContractResponse updateContractStatus(UUID contractId, String status);

    SalesContractResponse generateContractFromTemplate(UUID orderId);

    void validateContract(UUID contractId);

    List<SalesContractResponse> getExpiringContracts(int days);

    List<SalesContractResponse> getAllContracts();

    void deleteContract(UUID contractId);

    List<SalesContractResponse> searchContracts(Long customerId, ContractStatus status);

    void cancleContract(UUID contractId);
}