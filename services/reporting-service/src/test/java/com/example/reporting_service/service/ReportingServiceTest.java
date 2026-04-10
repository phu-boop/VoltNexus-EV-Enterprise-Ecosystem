package com.example.reporting_service.service;

import com.example.reporting_service.dto.InventoryVelocityDTO;
import com.example.reporting_service.model.InventorySummaryByRegion;
import com.example.reporting_service.model.SalesSummaryByDealership;
import com.example.reporting_service.repository.InventorySummaryRepository;
import com.example.reporting_service.repository.SalesSummaryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.jpa.domain.Specification;

import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReportingServiceTest {

    @Mock
    private InventorySummaryRepository inventoryRepo;

    @Mock
    private SalesSummaryRepository salesRepo;

    @InjectMocks
    private ReportingService reportingService;

    @Mock
    private Specification<InventorySummaryByRegion> inventorySpec;

    @Mock
    private Specification<SalesSummaryByDealership> salesSpec;

    @BeforeEach
    void setUp() {
        // Cài đặt bất kỳ giá trị mặc định nào (nếu cần) trước mỗi test case
    }

    @Test
    @DisplayName("Nên tính toán Inventory Velocity chính xác khi có doanh số bán ra (Sales > 0)")
    void calculateInventoryVelocity_WithSales_ShouldCalculateCorrectly() {
        // 1. Arrange: Tạo data giả lập (Mock Data)
        InventorySummaryByRegion inventoryMock = new InventorySummaryByRegion();
        inventoryMock.setRegion("North");
        inventoryMock.setModelId(1L);
        inventoryMock.setModelName("Tesla Model S");
        inventoryMock.setVariantId(1L);
        inventoryMock.setVariantName("Plaid");
        inventoryMock.setTotalStock(60L); // Có 60 xe đang tồn kho

        SalesSummaryByDealership salesMock = new SalesSummaryByDealership();
        salesMock.setRegion("North");
        salesMock.setModelId(1L);
        salesMock.setVariantId(1L);
        salesMock.setTotalUnitsSold(30L); // Bán ra 30 xe trong 30 ngày

        // Giả lập Specification and() method để tránh NullPointerException khi code thực thi: salesSpec.and(...)
        Specification<SalesSummaryByDealership> combinedSpec = mock(Specification.class);
        when(salesSpec.and(any())).thenReturn(combinedSpec);

        // Giả lập Repository trả về danh sách
        when(inventoryRepo.findAll(inventorySpec)).thenReturn(List.of(inventoryMock));
        when(salesRepo.findAll(combinedSpec)).thenReturn(List.of(salesMock));

        // 2. Act: Gọi hàm cần test
        List<InventoryVelocityDTO> results = reportingService.calculateInventoryVelocity(inventorySpec, salesSpec);

        // 3. Assert: Kiểm chứng kết quả
        assertThat(results).hasSize(1);
        InventoryVelocityDTO dto = results.get(0);
        
        // Kiểm tra DTO map đúng data
        assertThat(dto.getRegion()).isEqualTo("North");
        assertThat(dto.getModelName()).isEqualTo("Tesla Model S");
        assertThat(dto.getCurrentStock()).isEqualTo(60L);
        
        // Kiểm tra tính toán Logic:
        // Doanh số 30 ngày là 30 xe -> Trung bình mỗi ngày bán 1 xe (30 / 30) -> avgDailySales = 1.0
        assertThat(dto.getAverageDailySales()).isEqualTo(1.0);
        
        // Cung ứng còn lại = Tồn kho / Tốc độ bán = 60 / 1.0 = 60 ngày
        assertThat(dto.getDaysOfSupply()).isEqualTo(60.0);

        // Verify Repository đã được gọi đúng 1 lần
        verify(inventoryRepo, times(1)).findAll(inventorySpec);
        verify(salesRepo, times(1)).findAll(combinedSpec);
    }

    @Test
    @DisplayName("Nên trả về daysOfSupply là Infinity khi KHÔNG bán được chiếc xe nào (Sales = 0)")
    void calculateInventoryVelocity_NoSales_ShouldReturnInfinitySupply() {
        // 1. Arrange: Tạo data tồn kho nhưng KHÔNG CÓ doanh số
        InventorySummaryByRegion inventoryMock = new InventorySummaryByRegion();
        inventoryMock.setRegion("South");
        inventoryMock.setModelId(2L);
        inventoryMock.setVariantId(2L);
        inventoryMock.setTotalStock(100L); // Có 100 xe tồn kho

        Specification<SalesSummaryByDealership> combinedSpec = mock(Specification.class);
        when(salesSpec.and(any())).thenReturn(combinedSpec);

        // Repository tồn kho trả về 1 dòng. Nhưng DOANH SỐ trả về rỗng (0 chiếc bán ra)
        when(inventoryRepo.findAll(inventorySpec)).thenReturn(List.of(inventoryMock));
        when(salesRepo.findAll(combinedSpec)).thenReturn(Collections.emptyList());

        // 2. Act
        List<InventoryVelocityDTO> results = reportingService.calculateInventoryVelocity(inventorySpec, salesSpec);

        // 3. Assert
        assertThat(results).hasSize(1);
        InventoryVelocityDTO dto = results.get(0);
        
        assertThat(dto.getCurrentStock()).isEqualTo(100L);
        assertThat(dto.getSalesLast30Days()).isEqualTo(0L);
        assertThat(dto.getAverageDailySales()).isEqualTo(0.0);
        
        // Không bán được chiếc nào -> Thời gian bán hết số tồn là vô biên (Infinity)
        assertThat(dto.getDaysOfSupply()).isEqualTo(Double.POSITIVE_INFINITY);
    }

    @Test
    @DisplayName("Nên trả về danh sách rỗng khi không có hàng tồn kho nào khớp điều kiện filter")
    void calculateInventoryVelocity_EmptyInventory_ShouldReturnEmptyList() {
        // 1. Arrange
        when(inventoryRepo.findAll(inventorySpec)).thenReturn(Collections.emptyList());
        
        // Cần giả lập mốc salesSpec do logic gọi hàm
        Specification<SalesSummaryByDealership> combinedSpec = mock(Specification.class);
        when(salesSpec.and(any())).thenReturn(combinedSpec);
        when(salesRepo.findAll(combinedSpec)).thenReturn(Collections.emptyList());

        // 2. Act
        List<InventoryVelocityDTO> results = reportingService.calculateInventoryVelocity(inventorySpec, salesSpec);

        // 3. Assert
        assertThat(results).isEmpty();
        verify(inventoryRepo).findAll(inventorySpec);
    }

    @Test
    @DisplayName("Nên map đúng doanh số cho TỪNG LOẠI XE theo chuỗi (Region + Model + Variant)")
    void calculateInventoryVelocity_MultipleItems_ShouldMapCorrectlyByKeys() {
        // 1. Arrange: Tạo 2 vùng tồn kho khác nhau
        InventorySummaryByRegion inv1 = new InventorySummaryByRegion();
        inv1.setRegion("North"); inv1.setModelId(1L); inv1.setVariantId(1L);
        inv1.setTotalStock(100L);

        InventorySummaryByRegion inv2 = new InventorySummaryByRegion();
        inv2.setRegion("South"); inv2.setModelId(2L); inv2.setVariantId(2L);
        inv2.setTotalStock(50L);

        // Tạo 2 doanh số bán khác nhau
        SalesSummaryByDealership sales1 = new SalesSummaryByDealership();
        sales1.setRegion("North"); sales1.setModelId(1L); sales1.setVariantId(1L);
        sales1.setTotalUnitsSold(30L); // Bán 30 xe North

        SalesSummaryByDealership sales2 = new SalesSummaryByDealership();
        sales2.setRegion("South"); sales2.setModelId(2L); sales2.setVariantId(2L);
        sales2.setTotalUnitsSold(15L); // Bán 15 xe South

        Specification<SalesSummaryByDealership> combinedSpec = mock(Specification.class);
        when(salesSpec.and(any())).thenReturn(combinedSpec);

        when(inventoryRepo.findAll(inventorySpec)).thenReturn(List.of(inv1, inv2));
        when(salesRepo.findAll(combinedSpec)).thenReturn(List.of(sales1, sales2));

        // 2. Act
        List<InventoryVelocityDTO> results = reportingService.calculateInventoryVelocity(inventorySpec, salesSpec);

        // 3. Assert
        assertThat(results).hasSize(2);

        // Xe North
        InventoryVelocityDTO dtoNorth = results.stream().filter(r -> r.getRegion().equals("North")).findFirst().get();
        assertThat(dtoNorth.getSalesLast30Days()).isEqualTo(30L); // Nhận đúng 30
        assertThat(dtoNorth.getAverageDailySales()).isEqualTo(1.0); // 30/30 = 1.0
        assertThat(dtoNorth.getDaysOfSupply()).isEqualTo(100.0); // 100/1.0 = 100

        // Xe South
        InventoryVelocityDTO dtoSouth = results.stream().filter(r -> r.getRegion().equals("South")).findFirst().get();
        assertThat(dtoSouth.getSalesLast30Days()).isEqualTo(15L); // Nhận đúng 15
        assertThat(dtoSouth.getAverageDailySales()).isEqualTo(0.5); // 15/30 = 0.5
        assertThat(dtoSouth.getDaysOfSupply()).isEqualTo(100.0); // 50/0.5 = 100
    }
}
