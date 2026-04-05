package com.ev.dealer_service.service;

import com.ev.dealer_service.dto.request.DealerContractRequest;
import com.ev.dealer_service.dto.response.DealerContractResponse;
import com.ev.dealer_service.entity.Dealer;
import com.ev.dealer_service.entity.DealerContract;
import com.ev.dealer_service.exception.DuplicateResourceException;
import com.ev.dealer_service.exception.ResourceNotFoundException;
import com.ev.dealer_service.repository.DealerContractRepository;
import com.ev.dealer_service.repository.DealerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("DealerContractService — unit tests")
class DealerContractServiceTest {

    @Mock
    private DealerContractRepository contractRepository;

    @Mock
    private DealerRepository dealerRepository;

    @Mock
    private ModelMapper modelMapper;

    @InjectMocks
    private DealerContractService contractService;

    private UUID dealerId;
    private Dealer dealer;
    private DealerContractRequest request;
    private DealerContract contract;

    @BeforeEach
    void setUp() {
        dealerId = UUID.randomUUID();
        dealer = new Dealer();
        dealer.setDealerId(dealerId);
        dealer.setDealerName("ACME Motors");

        request = new DealerContractRequest();
        request.setDealerId(dealerId);
        request.setContractNumber("CNT-001");
        request.setContractTerms("Standard terms");
        request.setTargetSales(new BigDecimal("1000000"));
        request.setCommissionRate(new BigDecimal("5.5"));
        request.setStartDate(LocalDate.of(2025, 1, 1));
        request.setEndDate(LocalDate.of(2026, 12, 31));
        request.setContractStatus("ACTIVE");

        contract = new DealerContract();
        contract.setContractId(1L);
        contract.setDealer(dealer);
        contract.setContractNumber("CNT-001");
        contract.setContractTerms("Standard terms");
        contract.setTargetSales(request.getTargetSales());
        contract.setCommissionRate(request.getCommissionRate());
        contract.setStartDate(request.getStartDate());
        contract.setEndDate(request.getEndDate());
        contract.setContractStatus("ACTIVE");
    }

    @Nested
    @DisplayName("Đọc hợp đồng")
    class Read {

        @Test
        void getContractsByDealerId_returnsMappedResponses() {
            when(contractRepository.findByDealerDealerId(dealerId)).thenReturn(List.of(contract));

            List<DealerContractResponse> result = contractService.getContractsByDealerId(dealerId);

            assertThat(result).hasSize(1);
            assertEquals("CNT-001", result.get(0).getContractNumber());
            assertEquals(dealerId, result.get(0).getDealerId());
            assertEquals("ACME Motors", result.get(0).getDealerName());
        }

        @Test
        void getContractById_success() {
            when(contractRepository.findById(1L)).thenReturn(Optional.of(contract));

            DealerContractResponse result = contractService.getContractById(1L);

            assertEquals(1L, result.getContractId());
            assertEquals("CNT-001", result.getContractNumber());
        }

        @Test
        void getContractById_notFound_throwsResourceNotFoundException() {
            when(contractRepository.findById(99L)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class, () -> contractService.getContractById(99L));
        }
    }

    @Nested
    @DisplayName("Tạo hợp đồng")
    class Create {

        @Test
        void createContract_success_persistsWithDealer() {
            when(contractRepository.existsByContractNumber("CNT-001")).thenReturn(false);
            when(dealerRepository.findById(dealerId)).thenReturn(Optional.of(dealer));
            when(contractRepository.save(any(DealerContract.class))).thenAnswer(inv -> {
                DealerContract c = inv.getArgument(0);
                c.setContractId(10L);
                return c;
            });

            DealerContractResponse result = contractService.createContract(request);

            assertEquals(10L, result.getContractId());
            assertEquals("CNT-001", result.getContractNumber());

            ArgumentCaptor<DealerContract> captor = ArgumentCaptor.forClass(DealerContract.class);
            verify(contractRepository).save(captor.capture());
            assertThat(captor.getValue().getDealer()).isSameAs(dealer);
            assertEquals("ACTIVE", captor.getValue().getContractStatus());
        }

        @Test
        void createContract_duplicateNumber_throwsDuplicateResourceException() {
            when(contractRepository.existsByContractNumber("CNT-001")).thenReturn(true);

            assertThrows(DuplicateResourceException.class, () -> contractService.createContract(request));
            verify(contractRepository, never()).save(any());
        }

        @Test
        void createContract_dealerNotFound_throwsResourceNotFoundException() {
            when(contractRepository.existsByContractNumber("CNT-001")).thenReturn(false);
            when(dealerRepository.findById(dealerId)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class, () -> contractService.createContract(request));
            verify(contractRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("Cập nhật hợp đồng")
    class Update {

        @Test
        void updateContract_success() {
            when(contractRepository.findById(1L)).thenReturn(Optional.of(contract));
            when(dealerRepository.findById(dealerId)).thenReturn(Optional.of(dealer));
            when(contractRepository.save(contract)).thenReturn(contract);

            request.setContractTerms("Updated terms");

            DealerContractResponse result = contractService.updateContract(1L, request);

            assertEquals("Updated terms", result.getContractTerms());
            verify(contractRepository).save(contract);
        }

        @Test
        void updateContract_notFound_throwsResourceNotFoundException() {
            when(contractRepository.findById(1L)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class, () -> contractService.updateContract(1L, request));
        }

        @Test
        void updateContract_newNumberAlreadyUsed_throwsDuplicateResourceException() {
            contract.setContractNumber("OLD-NUM");
            request.setContractNumber("TAKEN");

            when(contractRepository.findById(1L)).thenReturn(Optional.of(contract));
            when(contractRepository.existsByContractNumber("TAKEN")).thenReturn(true);

            assertThrows(DuplicateResourceException.class, () -> contractService.updateContract(1L, request));
        }

        @Test
        void updateContract_dealerNotFound_throwsResourceNotFoundException() {
            when(contractRepository.findById(1L)).thenReturn(Optional.of(contract));
            when(dealerRepository.findById(dealerId)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class, () -> contractService.updateContract(1L, request));
        }
    }
}
