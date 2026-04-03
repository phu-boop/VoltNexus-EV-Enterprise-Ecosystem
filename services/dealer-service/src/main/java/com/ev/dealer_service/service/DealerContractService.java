package com.ev.dealer_service.service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ev.dealer_service.dto.request.DealerContractRequest;
import com.ev.dealer_service.dto.response.DealerContractResponse;
import com.ev.dealer_service.entity.Dealer;
import com.ev.dealer_service.entity.DealerContract;
import com.ev.dealer_service.exception.DuplicateResourceException;
import com.ev.dealer_service.exception.ResourceNotFoundException;
import com.ev.dealer_service.repository.DealerContractRepository;
import com.ev.dealer_service.repository.DealerRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DealerContractService {

    private final DealerContractRepository contractRepository;
    private final DealerRepository dealerRepository;
    private final ModelMapper modelMapper;

    @Transactional(readOnly = true)
    public List<DealerContractResponse> getContractsByDealerId(UUID dealerId) {
        return contractRepository.findByDealerDealerId(dealerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DealerContractResponse getContractById(Long id) {
        DealerContract contract = contractRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found with id: " + id));
        return mapToResponse(contract);
    }

    @Transactional
    public DealerContractResponse createContract(DealerContractRequest request) {
        if (contractRepository.existsByContractNumber(request.getContractNumber())) {
            throw new DuplicateResourceException("Contract with number " + request.getContractNumber() + " already exists");
        }

        Dealer dealer = dealerRepository.findById(request.getDealerId())
                .orElseThrow(() -> new ResourceNotFoundException("Dealer not found with id: " + request.getDealerId()));

        DealerContract contract = mapToEntity(request);
        contract.setDealer(dealer);
        DealerContract savedContract = contractRepository.save(contract);
        return mapToResponse(savedContract);
    }

    @Transactional
    public DealerContractResponse updateContract(Long id, DealerContractRequest request) {
        DealerContract contract = contractRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found with id: " + id));

        if (!contract.getContractNumber().equals(request.getContractNumber()) &&
            contractRepository.existsByContractNumber(request.getContractNumber())) {
            throw new DuplicateResourceException("Contract with number " + request.getContractNumber() + " already exists");
        }

        Dealer dealer = dealerRepository.findById(request.getDealerId())
                .orElseThrow(() -> new ResourceNotFoundException("Dealer not found with id: " + request.getDealerId()));
        applyRequestToEntity(request, contract);
        contract.setDealer(dealer);
        DealerContract updatedContract = contractRepository.save(contract);
        return mapToResponse(updatedContract);
    }

    @Transactional
    public void deleteContract(Long id) {
        DealerContract contract = contractRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found with id: " + id));
        contractRepository.delete(contract);
    }

    private DealerContract mapToEntity(DealerContractRequest request) {
        DealerContract contract = new DealerContract();
        applyRequestToEntity(request, contract);
        return contract;
    }

    private void applyRequestToEntity(DealerContractRequest request, DealerContract contract) {
        contract.setContractNumber(request.getContractNumber());
        contract.setContractTerms(request.getContractTerms());
        contract.setTargetSales(request.getTargetSales());
        contract.setCommissionRate(request.getCommissionRate());
        contract.setStartDate(request.getStartDate());
        contract.setEndDate(request.getEndDate());
        contract.setContractStatus(request.getContractStatus());
    }

    private DealerContractResponse mapToResponse(DealerContract contract) {
        DealerContractResponse response = new DealerContractResponse();
        response.setContractId(contract.getContractId());
        response.setContractNumber(contract.getContractNumber());
        response.setContractTerms(contract.getContractTerms());
        response.setTargetSales(contract.getTargetSales());
        response.setCommissionRate(contract.getCommissionRate());
        response.setStartDate(contract.getStartDate());
        response.setEndDate(contract.getEndDate());
        response.setContractStatus(contract.getContractStatus());
        response.setCreatedAt(contract.getCreatedAt());
        response.setUpdatedAt(contract.getUpdatedAt());
        response.setDealerId(contract.getDealer().getDealerId());
        response.setDealerName(contract.getDealer().getDealerName());
        return response;
    }
}
