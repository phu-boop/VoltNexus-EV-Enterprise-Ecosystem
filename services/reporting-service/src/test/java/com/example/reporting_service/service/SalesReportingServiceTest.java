package com.example.reporting_service.service;

import com.example.reporting_service.dto.ApiRespond;
import com.example.reporting_service.dto.DealerInventoryDto;
import com.example.reporting_service.dto.SaleEventDTO;
import com.example.reporting_service.model.SalesRecord;
import com.example.reporting_service.repository.DealerCacheRepository;
import com.example.reporting_service.repository.DealerStockSnapshotRepository;
import com.example.reporting_service.repository.SalesRecordRepository;
import com.example.reporting_service.repository.VehicleCacheRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SalesReportingServiceTest {

    @Mock
    private SalesRecordRepository salesRecordRepository;

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private GeminiForecastingService geminiForecastingService;

    @Mock
    private DealerCacheRepository dealerCacheRepository;

    @Mock
    private VehicleCacheRepository vehicleCacheRepository;

    @Mock
    private DealerStockSnapshotRepository dealerStockSnapshotRepository;

    @InjectMocks
    private SalesReportingService salesReportingService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(salesReportingService, "salesServiceUrl", "http://mock-sales");
        ReflectionTestUtils.setField(salesReportingService, "inventoryServiceUrl", "http://mock-inventory");
        ReflectionTestUtils.setField(salesReportingService, "vehicleServiceUrl", "http://mock-vehicle");
        ReflectionTestUtils.setField(salesReportingService, "dealerServiceUrl", "http://mock-dealer");
    }

    @Test
    @DisplayName("Nên record Sale thành công khi chưa tồn tại orderId")
    void recordSale_ShouldSucceed() {
        SalesRecord record = new SalesRecord();
        record.setOrderId(UUID.randomUUID());
        record.setTotalAmount(new BigDecimal("999.99"));

        when(salesRecordRepository.existsByOrderId(record.getOrderId())).thenReturn(false);
        when(restTemplate.getForObject(anyString(), eq(Object.class))).thenReturn(new Object());
        when(salesRecordRepository.save(any(SalesRecord.class))).thenReturn(record);

        assertDoesNotThrow(() -> salesReportingService.recordSale(record));
        verify(salesRecordRepository, times(1)).save(record);
    }

    @Test
    @DisplayName("Nên ném Exception khi record Sale bị trùng OrderId")
    void recordSale_WhenDuplicate_ShouldThrowException() {
        SalesRecord record = new SalesRecord();
        record.setOrderId(UUID.randomUUID());

        when(salesRecordRepository.existsByOrderId(record.getOrderId())).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> salesReportingService.recordSale(record));
        assertTrue(ex.getMessage().contains("already exists"));

        verify(salesRecordRepository, never()).save(any());
    }

    @Test
    @DisplayName("Nên gọi API lấy Forecast từ Gemini")
    void generateDemandForecast_ShouldCallGemini() {
        SalesRecord record = new SalesRecord();
        record.setModelName("VF 8");
        record.setTotalAmount(new BigDecimal("1000"));
        record.setRegion("North");
        record.setOrderDate(LocalDateTime.now());

        when(salesRecordRepository.findByModelName("VF 8")).thenReturn(List.of(record));
        when(geminiForecastingService.generateForecast(anyString(), eq("VF 8"))).thenReturn("Nhu cầu mua tăng mạnh 30%");

        String result = salesReportingService.generateDemandForecast("VF 8");

        assertEquals("Nhu cầu mua tăng mạnh 30%", result);
    }

    @Test
    @DisplayName("Nên đồng bộ Sales Data từ external API")
    void syncSalesData_ShouldSucceed() {
        when(salesRecordRepository.findMaxOrderDate()).thenReturn(null);

        SaleEventDTO event = new SaleEventDTO();
        event.setOrderId(UUID.randomUUID().toString());
        event.setSalePrice(999.99);

        ResponseEntity<List<SaleEventDTO>> response = ResponseEntity.ok(List.of(event));

        when(restTemplate.exchange(
                anyString(), eq(HttpMethod.GET), isNull(), ArgumentMatchers.<ParameterizedTypeReference<List<SaleEventDTO>>>any()
        )).thenReturn(response);

        salesReportingService.syncSalesData();

        verify(salesRecordRepository, times(1)).save(any(SalesRecord.class));
    }

    @Test
    @DisplayName("Nên đồng bộ Inventory Data từ external API")
    void syncInventoryData_ShouldSucceed() {
        DealerInventoryDto dto = new DealerInventoryDto();
        dto.setDealerId(UUID.randomUUID());
        dto.setVariantId(2L);
        dto.setAvailableQuantity(10);

        ApiRespond<List<DealerInventoryDto>> apiRespond = ApiRespond.<List<DealerInventoryDto>>builder()
                .code(200)
                .data(List.of(dto))
                .build();

        ResponseEntity<ApiRespond<List<DealerInventoryDto>>> response = ResponseEntity.ok(apiRespond);

        when(restTemplate.exchange(
                anyString(), eq(HttpMethod.GET), isNull(), ArgumentMatchers.<ParameterizedTypeReference<ApiRespond<List<DealerInventoryDto>>>>any()
        )).thenReturn(response);

        salesReportingService.syncInventoryData();

        verify(dealerStockSnapshotRepository, times(1)).saveAll(anyList());
    }
}
