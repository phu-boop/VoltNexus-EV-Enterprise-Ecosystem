package com.ev.dealer_service.service.Implementation;

import com.ev.common_lib.dto.dealer.DealerBasicDto;
import com.ev.dealer_service.dto.request.DealerRequest;
import com.ev.dealer_service.dto.response.DealerResponse;
import com.ev.dealer_service.entity.Dealer;
import com.ev.dealer_service.enums.DealerStatus;
import com.ev.dealer_service.exception.DuplicateResourceException;
import com.ev.dealer_service.exception.ResourceNotFoundException;
import com.ev.dealer_service.repository.DealerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("DealerServiceImpl — unit tests (mock repository + ModelMapper)")
class DealerServiceImplTest {

    @Mock
    private DealerRepository dealerRepository;

    @Mock
    private ModelMapper modelMapper;

    @InjectMocks
    private DealerServiceImpl dealerService;

    private UUID dealerId;
    private Dealer dealer;
    private DealerRequest request;
    private DealerResponse response;

    @BeforeEach
    void setUp() {
        dealerId = UUID.randomUUID();

        dealer = new Dealer();
        dealer.setDealerId(dealerId);
        dealer.setDealerCode("D001");
        dealer.setDealerName("Test Dealer");
        dealer.setStatus(DealerStatus.ACTIVE);

        request = new DealerRequest();
        request.setDealerCode("D001");
        request.setDealerName("Test Dealer");

        response = new DealerResponse();
        response.setDealerCode("D001");
        response.setDealerName("Test Dealer");
    }

    @Nested
    @DisplayName("Đọc danh sách / tìm kiếm")
    class ReadListAndSearch {

        @Test
        void getAllDealers_mapsEachEntityToResponse() {
            when(dealerRepository.findAll()).thenReturn(List.of(dealer));
            when(modelMapper.map(dealer, DealerResponse.class)).thenReturn(response);

            List<DealerResponse> result = dealerService.getAllDealers();

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getDealerCode()).isEqualTo("D001");
        }

        @Test
        void getDealerById_success() {
            when(dealerRepository.findById(dealerId)).thenReturn(Optional.of(dealer));
            when(modelMapper.map(dealer, DealerResponse.class)).thenReturn(response);

            DealerResponse result = dealerService.getDealerById(dealerId);

            assertNotNull(result);
            assertEquals("D001", result.getDealerCode());
        }

        @Test
        void getDealerById_notFound_throwsResourceNotFoundException() {
            when(dealerRepository.findById(dealerId)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class, () -> dealerService.getDealerById(dealerId));
        }

        @Test
        void getDealerByCode_success() {
            when(dealerRepository.findByDealerCode("D001")).thenReturn(Optional.of(dealer));
            when(modelMapper.map(dealer, DealerResponse.class)).thenReturn(response);

            DealerResponse result = dealerService.getDealerByCode("D001");

            assertEquals("D001", result.getDealerCode());
        }

        @Test
        void getDealerByCode_notFound_throwsResourceNotFoundException() {
            when(dealerRepository.findByDealerCode("X")).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class, () -> dealerService.getDealerByCode("X"));
        }

        @Test
        void searchDealers_returnsMappedList() {
            when(dealerRepository.searchDealers("Hanoi")).thenReturn(List.of(dealer));
            when(modelMapper.map(dealer, DealerResponse.class)).thenReturn(response);

            List<DealerResponse> result = dealerService.searchDealers("Hanoi");

            assertThat(result).hasSize(1);
        }

        @Test
        void getDealersByCity_returnsActiveInCity() {
            when(dealerRepository.findActiveDealersByCity("HN")).thenReturn(List.of(dealer));
            when(modelMapper.map(dealer, DealerResponse.class)).thenReturn(response);

            List<DealerResponse> result = dealerService.getDealersByCity("HN");

            assertThat(result).hasSize(1);
        }

        @Test
        void getAllDealersBasicInfo_delegatesToRepository() {
            DealerBasicDto basic = new DealerBasicDto(dealerId, "Test Dealer", "North");
            when(dealerRepository.findAllBasicInfo()).thenReturn(List.of(basic));

            List<DealerBasicDto> result = dealerService.getAllDealersBasicInfo();

            assertThat(result).containsExactly(basic);
            // Không dùng ModelMapper trong getAllDealersBasicInfo — tránh verify map(..., Class) nhầm overload với IDE/Mockito
            verifyNoInteractions(modelMapper);
        }

        @Test
        void getDealersByRegionAndName_delegatesToRepository() {
            when(dealerRepository.findByRegionAndDealerName("North", "ACME"))
                    .thenReturn(List.of(dealer));

            List<Dealer> result = dealerService.getDealersByRegionAndName("North", "ACME");

            assertThat(result).containsExactly(dealer);
        }
    }

    @Nested
    @DisplayName("Tạo / cập nhật / xóa")
    class WriteOperations {

        @Test
        void createDealer_success_setsActiveAndSaves() {
            when(dealerRepository.existsByDealerCode(request.getDealerCode())).thenReturn(false);
            when(modelMapper.map(request, Dealer.class)).thenReturn(dealer);
            when(dealerRepository.save(dealer)).thenReturn(dealer);
            when(modelMapper.map(dealer, DealerResponse.class)).thenReturn(response);

            DealerResponse result = dealerService.createDealer(request);

            assertNotNull(result);
            assertEquals(DealerStatus.ACTIVE, dealer.getStatus());
            verify(dealerRepository).save(dealer);
        }

        @Test
        void createDealer_duplicateCode_throwsDuplicateResourceException() {
            when(dealerRepository.existsByDealerCode(request.getDealerCode())).thenReturn(true);

            assertThrows(DuplicateResourceException.class, () -> dealerService.createDealer(request));
            verify(dealerRepository, never()).save(any());
        }

        @Test
        void updateDealer_success() {
            when(dealerRepository.findById(dealerId)).thenReturn(Optional.of(dealer));
            when(dealerRepository.save(dealer)).thenReturn(dealer);
            lenient().doNothing().when(modelMapper).map(any(DealerRequest.class), any(Dealer.class));
            when(modelMapper.map(dealer, DealerResponse.class)).thenReturn(response);

            DealerResponse result = dealerService.updateDealer(dealerId, request);

            assertNotNull(result);
            verify(dealerRepository).save(dealer);
            verify(modelMapper).map(any(DealerRequest.class), eq(dealer));
        }

        @Test
        void updateDealer_notFound_throwsResourceNotFoundException() {
            when(dealerRepository.findById(dealerId)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class, () -> dealerService.updateDealer(dealerId, request));
        }

        @Test
        void updateDealer_newCodeAlreadyUsed_throwsDuplicateResourceException() {
            Dealer existing = new Dealer();
            existing.setDealerCode("OLD");
            request.setDealerCode("NEW");

            when(dealerRepository.findById(dealerId)).thenReturn(Optional.of(existing));
            when(dealerRepository.existsByDealerCode("NEW")).thenReturn(true);

            assertThrows(DuplicateResourceException.class, () -> dealerService.updateDealer(dealerId, request));
        }

        @Test
        void deleteDealer_success() {
            when(dealerRepository.existsById(dealerId)).thenReturn(true);

            dealerService.deleteDealer(dealerId);

            verify(dealerRepository).deleteById(dealerId);
        }

        @Test
        void deleteDealer_notFound_throwsResourceNotFoundException() {
            when(dealerRepository.existsById(dealerId)).thenReturn(false);

            assertThrows(ResourceNotFoundException.class, () -> dealerService.deleteDealer(dealerId));
            verify(dealerRepository, never()).deleteById(any());
        }
    }

    @Nested
    @DisplayName("Trạng thái ACTIVE / SUSPENDED")
    class StatusChanges {

        @Test
        void suspendDealer_success() {
            when(dealerRepository.findById(dealerId)).thenReturn(Optional.of(dealer));
            when(dealerRepository.save(dealer)).thenReturn(dealer);
            when(modelMapper.map(dealer, DealerResponse.class)).thenReturn(response);

            dealerService.suspendDealer(dealerId);

            assertEquals(DealerStatus.SUSPENDED, dealer.getStatus());
        }

        @Test
        void suspendDealer_notFound_throwsResourceNotFoundException() {
            when(dealerRepository.findById(dealerId)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class, () -> dealerService.suspendDealer(dealerId));
        }

        @Test
        void activateDealer_success() {
            dealer.setStatus(DealerStatus.SUSPENDED);
            when(dealerRepository.findById(dealerId)).thenReturn(Optional.of(dealer));
            when(dealerRepository.save(dealer)).thenReturn(dealer);
            when(modelMapper.map(dealer, DealerResponse.class)).thenReturn(response);

            dealerService.activateDealer(dealerId);

            assertEquals(DealerStatus.ACTIVE, dealer.getStatus());
        }

        @Test
        void activateDealer_notFound_throwsResourceNotFoundException() {
            when(dealerRepository.findById(dealerId)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class, () -> dealerService.activateDealer(dealerId));
        }
    }
}
