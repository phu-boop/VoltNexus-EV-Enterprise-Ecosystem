package com.ev.sales_service.service.Implementation;

import com.ev.common_lib.exception.AppException;
import com.ev.common_lib.exception.ErrorCode;
import com.ev.sales_service.dto.request.SalesContractRequest;
import com.ev.sales_service.dto.response.SalesContractResponse;
import com.ev.sales_service.entity.SalesContract;
import com.ev.sales_service.entity.SalesOrder;
import com.ev.sales_service.enums.ContractStatus;
import com.ev.sales_service.enums.OrderStatusB2C;
import com.ev.sales_service.repository.SalesContractRepository;
import com.ev.sales_service.repository.SalesOrderRepositoryB2C;
import com.ev.sales_service.service.Interface.SalesContractService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class SalesContractServiceImpl implements SalesContractService {

    private final SalesContractRepository salesContractRepository;
    private final SalesOrderRepositoryB2C salesOrderRepository;
    private final ModelMapper modelMapper;

    @Override
    public SalesContractResponse createContract(SalesContractRequest request) {
        log.info("Creating sales contract for order: {}", request.getOrderId());

        SalesOrder salesOrder = salesOrderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new AppException(ErrorCode.SALES_ORDER_NOT_FOUND));

        // ✅ Validate trạng thái đơn hàng trước khi tạo hợp đồng
        if (salesOrder.getOrderStatusB2C() == null) {
            throw new AppException(ErrorCode.INVALID_STATE);
        }

        // Chỉ cho phép tạo hợp đồng nếu đơn hàng đã CONFIRMED
        // và chưa bắt đầu sản xuất hoặc bị hủy
        if (salesOrder.getOrderStatusB2C() != OrderStatusB2C.CONFIRMED) {
            throw new AppException(ErrorCode.INVALID_CONTRACT_OPERATION_STATE);
        }
        // Check if contract already exists
        if (salesContractRepository.existsBySalesOrder_OrderId(request.getOrderId())) {
            throw new AppException(ErrorCode.SALES_CONTRACT_ALREADY_EXISTS);
        }

        SalesContract salesContract = SalesContract.builder()
                .salesOrder(salesOrder)
                .contractDate(LocalDateTime.now())
                .contractTerms(request.getContractTerms())
                .signingDate(request.getSigningDate())
                .contractStatus(ContractStatus.DRAFT)
                .digitalSignature(request.getDigitalSignature())
                .contractFileUrl(request.getContractFileUrl())
                .build();

        SalesContract savedContract = salesContractRepository.save(salesContract);
        log.info("Sales contract created successfully: {}", savedContract.getContractId());

        return mapToResponse(savedContract);
    }

    @Override
    public SalesContractResponse updateContract(UUID contractId, SalesContractRequest request) {
        log.info("Updating sales contract: {}", contractId);

        SalesContract salesContract = salesContractRepository.findById(contractId)
                .orElseThrow(() -> new AppException(ErrorCode.SALES_CONTRACT_NOT_FOUND));

        SalesOrder salesOrder = salesOrderRepository.findById(salesContract.getSalesOrder().getOrderId())
                .orElseThrow(() -> new AppException(ErrorCode.DATABASE_ERROR));
        // và chưa bắt đầu sản xuất hoặc bị hủy
        if (salesOrder.getOrderStatusB2C() != OrderStatusB2C.CONFIRMED) {
            throw new AppException(ErrorCode.INVALID_CONTRACT_OPERATION_STATE);
        }
        if (request.getContractStatus().equals(ContractStatus.SIGNED)) {
            salesOrder.setOrderStatusB2C(OrderStatusB2C.IN_PRODUCTION);
            salesOrderRepository.save(salesOrder);
        }
        salesContract.setContractStatus(request.getContractStatus());
        salesContract.setContractTerms(request.getContractTerms());
        salesContract.setSigningDate(request.getSigningDate());
        salesContract.setDigitalSignature(request.getDigitalSignature());
        salesContract.setContractFileUrl(request.getContractFileUrl());

        SalesContract updatedContract = salesContractRepository.save(salesContract);
        log.info("Sales contract updated successfully: {}", contractId);

        return mapToResponse(updatedContract);
    }

    @Override
    public SalesContractResponse getContractById(UUID contractId) {
        SalesContract salesContract = salesContractRepository.findById(contractId)
                .orElseThrow(() -> new AppException(ErrorCode.SALES_CONTRACT_NOT_FOUND));
        return mapToResponse(salesContract);
    }

    @Override
    public SalesContractResponse getContractByOrderId(UUID orderId) {
        SalesContract salesContract = salesContractRepository.findBySalesOrder_OrderId(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.SALES_CONTRACT_NOT_FOUND));
        return mapToResponse(salesContract);
    }

    @Override
    public List<SalesContractResponse> getContractsByStatus(String status) {
        ContractStatus contractStatus = ContractStatus.valueOf(status);
        List<SalesContract> contracts = salesContractRepository.findByContractStatus(contractStatus);
        return contracts.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }


    // cap nhat orderSale
    @Override
    public SalesContractResponse signContract(UUID contractId, String digitalSignature) {
        log.info("Signing contract: {}", contractId);

        SalesContract salesContract = salesContractRepository.findById(contractId)
                .orElseThrow(() -> new AppException(ErrorCode.SALES_CONTRACT_NOT_FOUND));
        if (salesContract.getContractStatus() != ContractStatus.DRAFT &&
                salesContract.getContractStatus() != ContractStatus.PENDING_SIGNATURE) {
            throw new AppException(ErrorCode.INVALID_CONTRACT_STATUS);
        }

        SalesOrder salesOrder = salesOrderRepository.findById(salesContract.getSalesOrder().getOrderId())
                .orElseThrow(() -> new AppException(ErrorCode.DATABASE_ERROR));
        if (salesOrder.getOrderStatusB2C() != OrderStatusB2C.CONFIRMED) {
            throw new AppException(ErrorCode.INVALID_CONTRACT_OPERATION_STATE);
        }
        salesOrder.setOrderStatusB2C(OrderStatusB2C.IN_PRODUCTION);

        salesContract.setDigitalSignature(digitalSignature);
        salesContract.setSigningDate(LocalDateTime.now());
        salesContract.setContractStatus(ContractStatus.SIGNED);

        SalesContract signedContract = salesContractRepository.save(salesContract);
        log.info("Contract signed successfully: {}", contractId);

        return mapToResponse(signedContract);
    }

    @Override
    public SalesContractResponse updateContractStatus(UUID contractId, String status) {
        log.info("Updating contract status: {} to {}", contractId, status);
        SalesContract salesContract = salesContractRepository.findById(contractId)
                .orElseThrow(() -> new AppException(ErrorCode.SALES_CONTRACT_NOT_FOUND));
        SalesOrder salesOrder = salesOrderRepository.findById(salesContract.getSalesOrder().getOrderId())
                .orElseThrow(() -> new AppException(ErrorCode.DATABASE_ERROR));
        if (salesOrder.getOrderStatusB2C() != OrderStatusB2C.CONFIRMED) {
            throw new AppException(ErrorCode.INVALID_CONTRACT_OPERATION_STATE);
        }
        ContractStatus newStatus = ContractStatus.valueOf(status);
        salesContract.setContractStatus(newStatus);

        SalesContract updatedContract = salesContractRepository.save(salesContract);
        log.info("Contract status updated successfully: {}", contractId);

        return mapToResponse(updatedContract);
    }

    @Override
    public SalesContractResponse generateContractFromTemplate(UUID orderId) {
        log.info("Generating contract from template for order: {}", orderId);

        SalesOrder salesOrder = salesOrderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.SALES_ORDER_NOT_FOUND));

        // Check if contract already exists
        if (salesContractRepository.existsBySalesOrder_OrderId(orderId)) {
            throw new AppException(ErrorCode.SALES_CONTRACT_ALREADY_EXISTS);
        }

        // TODO: Generate contract terms from template
        String contractTerms = generateContractTerms(salesOrder);

        SalesContract salesContract = SalesContract.builder()
                .salesOrder(salesOrder)
                .contractDate(LocalDateTime.now())
                .contractTerms(contractTerms)
                .contractStatus(ContractStatus.DRAFT)
                .contractFileUrl(generateContractFile(salesOrder, contractTerms))
                .build();

        SalesContract savedContract = salesContractRepository.save(salesContract);
        log.info("Contract generated successfully: {}", savedContract.getContractId());

        return mapToResponse(savedContract);
    }

    @Override
    public void validateContract(UUID contractId) {
        SalesContract salesContract = salesContractRepository.findById(contractId)
                .orElseThrow(() -> new AppException(ErrorCode.SALES_CONTRACT_NOT_FOUND));

        // TODO: Add contract validation logic
        if (salesContract.getContractTerms() == null || salesContract.getContractTerms().isEmpty()) {
            throw new AppException(ErrorCode.INVALID_CONTRACT_TERMS);
        }

        if (salesContract.getContractStatus() == ContractStatus.SIGNED &&
                salesContract.getDigitalSignature() == null) {
            throw new AppException(ErrorCode.MISSING_DIGITAL_SIGNATURE);
        }
    }

    @Override
    public List<SalesContractResponse> getExpiringContracts(int days) {
        LocalDateTime targetDate = LocalDateTime.now().plusDays(days);
        List<SalesContract> contracts = salesContractRepository.findByStatusAndContractDateBefore(
                ContractStatus.DRAFT, targetDate);

        return contracts.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private String generateContractTerms(SalesOrder salesOrder) {
        // TODO: Implement contract template generation
        return "Standard Sales Contract Terms for Order: " + salesOrder.getOrderId();
    }

    private String generateContractFile(SalesOrder salesOrder, String contractTerms) {
        // TODO: Implement contract file generation and storage
        return "/contracts/" + salesOrder.getOrderId() + ".pdf";
    }

    private SalesContractResponse mapToResponse(SalesContract salesContract) {
        SalesContractResponse response = modelMapper.map(salesContract, SalesContractResponse.class);
        // TODO: Add additional mapping logic
        return response;
    }

    // SalesContractServiceImpl.java
    @Override
    public List<SalesContractResponse> getAllContracts() {
        List<SalesContract> contracts = salesContractRepository.findAll();
        return contracts.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public void deleteContract(UUID contractId) {
        SalesContract contract = salesContractRepository.findById(contractId)
                .orElseThrow(() -> new AppException(ErrorCode.SALES_CONTRACT_NOT_FOUND));
        salesContractRepository.delete(contract);
    }

    @Override
    public List<SalesContractResponse> searchContracts(Long customerId, ContractStatus status) {
        // Example logic, tùy repository bạn có thể implement thêm JPQL/Criteria
        List<SalesContract> contracts = salesContractRepository.searchContracts(customerId, status);
        return contracts.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public void cancleContract(UUID contractId) {
        SalesContract contract = salesContractRepository.findById(contractId)
                .orElseThrow(() -> new AppException(ErrorCode.SALES_CONTRACT_NOT_FOUND));
        contract.setContractStatus(ContractStatus.CANCELLED);
        SalesOrder salesOrder = salesOrderRepository.findById(contract.getSalesOrder().getOrderId())
                .orElseThrow(() -> new AppException(ErrorCode.DATABASE_ERROR));
        salesOrder.setOrderStatusB2C(OrderStatusB2C.CANCELLED);
        salesOrderRepository.save(salesOrder);
        salesContractRepository.save(contract);
    }

}