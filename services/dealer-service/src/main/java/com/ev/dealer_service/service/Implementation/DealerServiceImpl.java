package com.ev.dealer_service.service.Implementation;

import com.ev.common_lib.dto.dealer.DealerBasicDto;
import com.ev.dealer_service.enums.DealerStatus;
import com.ev.dealer_service.service.Interface.DealerService;
import com.ev.dealer_service.repository.DealerRepository;
import com.ev.dealer_service.dto.request.DealerRequest;
import com.ev.dealer_service.dto.response.DealerResponse;
import com.ev.dealer_service.entity.Dealer;
import com.ev.dealer_service.exception.DuplicateResourceException;
import com.ev.dealer_service.exception.ResourceNotFoundException;

import org.modelmapper.ModelMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DealerServiceImpl implements DealerService { // Triển khai (implements) interface

    private final DealerRepository dealerRepository;
    private final ModelMapper modelMapper;

    @Override
    @Transactional(readOnly = true)
    public List<DealerResponse> getAllDealers() {
        return dealerRepository.findAll().stream()
                .map(dealer -> modelMapper.map(dealer, DealerResponse.class))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public DealerResponse getDealerById(UUID id) {
        Dealer dealer = dealerRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Dealer not found with id: " + id));
        return modelMapper.map(dealer, DealerResponse.class);
    }

    @Override
    @Transactional(readOnly = true)
    public DealerResponse getDealerByCode(String code) {
        Dealer dealer = dealerRepository.findByDealerCode(code)
            .orElseThrow(() -> new ResourceNotFoundException("Dealer not found with code: " + code));
        return modelMapper.map(dealer, DealerResponse.class);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DealerResponse> searchDealers(String keyword) {
        return dealerRepository.searchDealers(keyword).stream()
                .map(dealer -> modelMapper.map(dealer, DealerResponse.class))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DealerResponse> getDealersByCity(String city) {
        return dealerRepository.findActiveDealersByCity(city).stream()
                .map(dealer -> modelMapper.map(dealer, DealerResponse.class))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public DealerResponse createDealer(DealerRequest request) {
        if (dealerRepository.existsByDealerCode(request.getDealerCode())) {
            throw new DuplicateResourceException("Dealer with code " + request.getDealerCode() + " already exists");
        }

        Dealer dealer = modelMapper.map(request, Dealer.class);
        dealer.setStatus(DealerStatus.ACTIVE);
        Dealer savedDealer = dealerRepository.save(dealer);
        return modelMapper.map(savedDealer, DealerResponse.class);
    }

    @Override
    @Transactional
    public DealerResponse updateDealer(UUID id, DealerRequest request) {
        Dealer dealer = dealerRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Dealer not found with id: " + id));

        // Check if dealer code is being changed and if it's already in use
        if (!dealer.getDealerCode().equals(request.getDealerCode()) &&
            dealerRepository.existsByDealerCode(request.getDealerCode())) {
            throw new DuplicateResourceException("Dealer with code " + request.getDealerCode() + " already exists");
        }

        modelMapper.map(request, dealer);
        Dealer updatedDealer = dealerRepository.save(dealer);
        return modelMapper.map(updatedDealer, DealerResponse.class);
    }

    @Override
    @Transactional
    public void deleteDealer(UUID id) {
        if (!dealerRepository.existsById(id)) {
            throw new ResourceNotFoundException("Dealer not found with id: " + id);
        }
        dealerRepository.deleteById(id);
    }

    @Override
    public List<DealerBasicDto> getAllDealersBasicInfo() {
        return dealerRepository.findAllBasicInfo();
    }

    @Override
    @Transactional
    public DealerResponse suspendDealer(UUID id) {
        Dealer dealer = dealerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dealer not found with id: " + id));

        dealer.setStatus(DealerStatus.SUSPENDED);
        Dealer updatedDealer = dealerRepository.save(dealer);

        return modelMapper.map(updatedDealer, DealerResponse.class);
    }

    @Override
    @Transactional
    public DealerResponse activateDealer(UUID id) {
        Dealer dealer = dealerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dealer not found with id: " + id));

        dealer.setStatus(DealerStatus.ACTIVE);
        Dealer updatedDealer = dealerRepository.save(dealer);

        return modelMapper.map(updatedDealer, DealerResponse.class);
    }
    
    public List<Dealer> getDealersByRegionAndName(String region, String dealerName) {
        return dealerRepository.findByRegionAndDealerName(region, dealerName);
    }
}
