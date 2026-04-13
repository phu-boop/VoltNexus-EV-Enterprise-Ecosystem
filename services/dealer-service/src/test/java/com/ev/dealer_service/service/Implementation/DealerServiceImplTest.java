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
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;
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

        /**
         * Lấy danh sách tất cả đại lý
         * - Tham số: Không có
         * - Mục tiêu: Kiểm tra xem service có gọi repository và chuyển đổi danh sách entity sang DTO đúng cách không.
         * - Cách thức: Giả lập repository trả về danh sách có 1 dealer, kiểm tra size và nội dung của kết quả.
         * - Kết quả mong đợi: Trả về một danh sách DealerResponse có 1 phần tử với mã là "D001".
         */
        @Test
        void getAllDealers_mapsEachEntityToResponse() {
            when(dealerRepository.findAll()).thenReturn(List.of(dealer));
            when(modelMapper.map(dealer, DealerResponse.class)).thenReturn(response);

            List<DealerResponse> result = dealerService.getAllDealers();

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getDealerCode()).isEqualTo("D001");
        }

        /**
         * Lấy thông tin chi tiết đại lý theo ID - Trường hợp thành công
         * - Tham số: UUID dealerId (ID của đại lý cần tìm)
         * - Mục tiêu: Xác nhận service trả về đúng thông tin đại lý khi ID tồn tại trong DB.
         * - Cách thức: Giả lập repo tìm thấy dealer theo ID, kiểm tra kết quả không null và đúng mã code.
         * - Kết quả mong đợi: Trả về DealerResponse không null và dealerCode phải là "D001".
         */
        @Test
        void getDealerById_success() {
            when(dealerRepository.findById(dealerId)).thenReturn(Optional.of(dealer));
            when(modelMapper.map(dealer, DealerResponse.class)).thenReturn(response);

            DealerResponse result = dealerService.getDealerById(dealerId);

            assertNotNull(result);
            assertEquals("D001", result.getDealerCode());
        }

        /**
         * Lấy thông tin chi tiết đại lý theo ID - Trường hợp không tìm thấy
         * - Tham số: UUID dealerId (ID không tồn tại)
         * - Mục tiêu: Đảm bảo service ném ra ngoại lệ ResourceNotFoundException khi không tìm thấy đại lý.
         * - Cách thức: Giả lập repo trả về Optional.empty() cho ID cung cấp.
         * - Kết quả mong đợi: Ném ra ResourceNotFoundException.
         */
        @Test
        void getDealerById_notFound_throwsResourceNotFoundException() {
            when(dealerRepository.findById(dealerId)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class, () -> dealerService.getDealerById(dealerId));
        }

        /**
         * Lấy đại lý theo mã Code - Trường hợp thành công (Kiểm thử tham số hóa)
         * - Tham số: String dealerCode (Các mã đại lý khác nhau: "D001", "DM-2024", "X-99")
         * - Mục tiêu: Xác nhận tìm kiếm theo code hoạt động đúng với nhiều bộ dữ liệu đầu vào.
         * - Cách thức: Chạy test nhiều lần với các giá trị code khác nhau, kiểm tra kết quả trả về đúng code đó.
         * - Kết quả mong đợi: DealerResponse trả về có dealerCode khớp với tham số đầu vào.
         */
        @ParameterizedTest(name = "getDealerByCode — tìm thấy với code [{0}]")
        @ValueSource(strings = {"D001", "DM-2024", "X-99"})
        void getDealerByCode_success_parameterized(String dealerCode) {
            dealer.setDealerCode(dealerCode);
            response.setDealerCode(dealerCode);
            when(dealerRepository.findByDealerCode(dealerCode)).thenReturn(Optional.of(dealer));
            when(modelMapper.map(dealer, DealerResponse.class)).thenReturn(response);

            DealerResponse result = dealerService.getDealerByCode(dealerCode);

            assertEquals(dealerCode, result.getDealerCode());
        }

        /**
         * @param missingCode mã không tồn tại — kỳ vọng thống nhất: {@link ResourceNotFoundException}
         */
        @ParameterizedTest(name = "getDealerByCode — không tìm thấy [{0}]")
        @ValueSource(strings = {"X", "UNKNOWN", "__none__"})
        void getDealerByCode_notFound_parameterized(String missingCode) {
            when(dealerRepository.findByDealerCode(missingCode)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class, () -> dealerService.getDealerByCode(missingCode));
        }

        /**
         * @param searchText tham số search — cùng hành vi: gọi {@code searchDealers} và map từng bản ghi
         */
        @ParameterizedTest(name = "searchDealers — text=[{0}]")
        @ValueSource(strings = {"Hanoi", "HCM", "EV dealer"})
        void searchDealers_returnsMappedList_parameterized(String searchText) {
            when(dealerRepository.searchDealers(searchText)).thenReturn(List.of(dealer));
            when(modelMapper.map(dealer, DealerResponse.class)).thenReturn(response);

            List<DealerResponse> result = dealerService.searchDealers(searchText);

            assertThat(result).hasSize(1);
        }

        /**
         * @param city mã / tên thành phố — ứng với {@code findActiveDealersByCity}
         */
        @ParameterizedTest(name = "getDealersByCity — city=[{0}]")
        @CsvSource({"HN", "HCM", "Da Nang"})
        void getDealersByCity_returnsActiveInCity_parameterized(String city) {
            when(dealerRepository.findActiveDealersByCity(city)).thenReturn(List.of(dealer));
            when(modelMapper.map(dealer, DealerResponse.class)).thenReturn(response);

            List<DealerResponse> result = dealerService.getDealersByCity(city);

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

        /**
         * @param region vùng
         * @param namePattern phần tên dealer dùng để lọc (theo repository)
         */
        @ParameterizedTest(name = "getDealersByRegionAndName — region={0}, name={1}")
        @CsvSource(value = {
                "North|ACME",
                "South|BestEV",
                "Central|"
        }, delimiterString = "|")
        void getDealersByRegionAndName_delegatesToRepository_parameterized(String region, String namePattern) {
            when(dealerRepository.findByRegionAndDealerName(region, namePattern))
                    .thenReturn(List.of(dealer));

            List<Dealer> result = dealerService.getDealersByRegionAndName(region, namePattern);

            assertThat(result).containsExactly(dealer);
        }
    }

    @Nested
    @DisplayName("Tạo / cập nhật / xóa")
    class WriteOperations {

        /**
         * Tạo mới đại lý - Trường hợp thành công
         * - Tham số: DealerRequest request (Thông tin đại lý mới)
         * - Mục tiêu: Kiểm tra quy trình tạo đại lý: check trùng mã, set trạng thái ACTIVE, lưu vào DB và trả về DTO.
         * - Cách thức: Giả lập không trùng mã code, map request sang entity, lưu và map ngược lại response.
         * - Kết quả mong đợi: Trả về DealerResponse không null, trạng thái dealer entity chuyển sang ACTIVE, repo.save được gọi.
         */
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

        /**
         * Đình chỉ hoạt động đại lý (Suspend) - Trường hợp thành công
         * - Tham số: UUID dealerId (ID đại lý cần đình chỉ)
         * - Mục tiêu: Thay đổi trạng thái của đại lý từ bất kỳ sang SUSPENDED.
         * - Cách thức: Tìm dealer, set status SUSPENDED, lưu lại.
         * - Kết quả mong đợi: Trạng thái của dealer entity phải là SUSPENDED.
         */
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
