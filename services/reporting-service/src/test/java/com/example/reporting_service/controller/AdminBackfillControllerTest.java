package com.example.reporting_service.controller;

import com.example.reporting_service.repository.DealerCacheRepository;
import com.example.reporting_service.repository.VehicleCacheRepository;
import com.ev.common_lib.dto.dealer.DealerBasicDto;
import com.ev.common_lib.dto.respond.ApiRespond;
import com.ev.common_lib.dto.vehicle.VariantDetailDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AdminBackfillController.class)
@AutoConfigureMockMvc(addFilters = false) // Tắt Security khi test
class AdminBackfillControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DealerCacheRepository dealerCacheRepo;

    @MockBean
    private VehicleCacheRepository vehicleCacheRepo;

    @MockBean
    private RestTemplate restTemplate;

    @Autowired
    private AdminBackfillController adminBackfillController;

    @BeforeEach
    void setUp() {
        // Tiêm các URL mock vào controller bằng Reflection vì nó đọc từ @Value
        ReflectionTestUtils.setField(adminBackfillController, "dealerServiceUrl", "http://mock-dealer");
        ReflectionTestUtils.setField(adminBackfillController, "vehicleServiceUrl", "http://mock-vehicle");
    }

    @Test
    @DisplayName("Nên backfill Dealers thành công khi API trả về dữ liệu")
    void backfillDealers_ShouldSucceed() throws Exception {
        // Arrange
        DealerBasicDto dealer = new DealerBasicDto();
        dealer.setDealerId(UUID.randomUUID());
        dealer.setDealerName("Dealer 1");
        dealer.setRegion("North");

        ApiRespond<List<DealerBasicDto>> apiRespond = ApiRespond.<List<DealerBasicDto>>builder()
                .code(200)
                .data(List.of(dealer))
                .build();

        ResponseEntity<ApiRespond<List<DealerBasicDto>>> responseEntity = ResponseEntity.ok(apiRespond);

        String expectedUrl = "http://mock-dealer/api/dealers/list-all";
        when(restTemplate.exchange(
                eq(expectedUrl),
                eq(HttpMethod.GET),
                isNull(),
                ArgumentMatchers.<ParameterizedTypeReference<ApiRespond<List<DealerBasicDto>>>>any()
        )).thenReturn(responseEntity);

        // Act & Assert
        mockMvc.perform(post("/api/v1/admin/backfill/dealers"))
                .andExpect(status().isOk())
                .andExpect(content().string("Đã lấp đầy 1 đại lý."));

        verify(dealerCacheRepo, times(1)).deleteAllInBatch();
        verify(dealerCacheRepo, times(1)).saveAll(anyList());
    }

    @Test
    @DisplayName("Nên trả về 400 Bad Request khi API Dealer trả về rỗng/lỗi")
    void backfillDealers_WhenApiFails_ShouldReturnBadRequest() throws Exception {
        // Arrange
        ApiRespond<List<DealerBasicDto>> apiRespond = ApiRespond.<List<DealerBasicDto>>builder()
                .code(500)
                .data(null)
                .build();

        ResponseEntity<ApiRespond<List<DealerBasicDto>>> responseEntity = ResponseEntity.ok(apiRespond);

        when(restTemplate.exchange(
                anyString(), eq(HttpMethod.GET), isNull(), ArgumentMatchers.<ParameterizedTypeReference<ApiRespond<List<DealerBasicDto>>>>any()
        )).thenReturn(responseEntity);

        // Act & Assert
        mockMvc.perform(post("/api/v1/admin/backfill/dealers"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Lỗi: Không nhận được dữ liệu"));

        verify(dealerCacheRepo, never()).deleteAllInBatch(); // K chạy lệnh xoá
    }

    @Test
    @DisplayName("Nên backfill Vehicles thành công khi API trả về dữ liệu")
    void backfillVehicles_ShouldSucceed() throws Exception {
        // Arrange
        VariantDetailDto vehicle = new VariantDetailDto();
        vehicle.setVariantId(1L);
        vehicle.setVersionName("Standard Range");
        vehicle.setModelId(2L);
        vehicle.setModelName("VF 8");

        ApiRespond<List<VariantDetailDto>> apiRespond = ApiRespond.<List<VariantDetailDto>>builder()
                .code(200)
                .data(List.of(vehicle))
                .build();

        ResponseEntity<ApiRespond<List<VariantDetailDto>>> responseEntity = ResponseEntity.ok(apiRespond);

        String expectedUrl = "http://mock-vehicle/vehicle-catalog/variants/all-for-backfill";
        when(restTemplate.exchange(
                eq(expectedUrl),
                eq(HttpMethod.GET),
                isNull(),
                ArgumentMatchers.<ParameterizedTypeReference<ApiRespond<List<VariantDetailDto>>>>any()
        )).thenReturn(responseEntity);

        // Act & Assert
        mockMvc.perform(post("/api/v1/admin/backfill/vehicles"))
                .andExpect(status().isOk())
                .andExpect(content().string("Đã lấp đầy 1 xe."));

        verify(vehicleCacheRepo, times(1)).deleteAllInBatch();
        verify(vehicleCacheRepo, times(1)).saveAll(anyList());
    }
}
