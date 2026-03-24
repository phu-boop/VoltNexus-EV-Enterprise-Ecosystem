package com.ev.ai_service.service;

import com.ev.ai_service.dto.ProductionPlanDto;
import com.ev.ai_service.entity.DemandForecast;
import com.ev.ai_service.entity.InventorySnapshot;
import com.ev.ai_service.entity.ProductionPlan;
import com.ev.ai_service.repository.DemandForecastRepository;
import com.ev.ai_service.repository.InventorySnapshotRepository;
import com.ev.ai_service.repository.ProductionPlanRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductionPlanServiceTest {

    @Mock
    private DemandForecastRepository forecastRepository;
    @Mock
    private InventorySnapshotRepository inventoryRepository;
    @Mock
    private ProductionPlanRepository productionPlanRepository;

    @InjectMocks
    private ProductionPlanService productionPlanService;

    @Test
    @DisplayName("Tạo kế hoạch sản xuất thành công")
    void generateProductionPlan_success() {
        LocalDate planMonth = LocalDate.of(2024, 4, 1);

        DemandForecast f1 = DemandForecast.builder()
                .variantId(1L)
                .predictedDemand(100)
                .build();
        when(forecastRepository.findTopForecastsByDateRange(any(), any())).thenReturn(List.of(f1));

        InventorySnapshot i1 = InventorySnapshot.builder()
                .variantId(1L)
                .availableQuantity(20)
                .build();
        when(inventoryRepository.findTopByVariantIdOrderBySnapshotDateDesc(1L)).thenReturn(Optional.of(i1));

        when(productionPlanRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        List<ProductionPlanDto> results = productionPlanService.generateProductionPlan(planMonth);

        assertThat(results).hasSize(1);
        ProductionPlanDto plan = results.get(0);
        assertThat(plan.getVariantId()).isEqualTo(1L);
        assertThat(plan.getPredictedDemand()).isEqualTo(100);
        assertThat(plan.getCurrentInventory()).isEqualTo(20);
        // Gap = 100 + 20(safety) - 20 = 100
        assertThat(plan.getProductionGap()).isEqualTo(100);
        assertThat(plan.getPriority()).isEqualTo("HIGH");
    }

    @Test
    @DisplayName("Cập nhật kế hoạch sản xuất nếu đã tồn tại")
    void generateProductionPlan_updateExisting() {
        LocalDate planMonth = LocalDate.of(2024, 4, 1);

        DemandForecast f1 = DemandForecast.builder().variantId(1L).predictedDemand(50).build();
        when(forecastRepository.findTopForecastsByDateRange(any(), any())).thenReturn(List.of(f1));
        when(inventoryRepository.findTopByVariantIdOrderBySnapshotDateDesc(1L)).thenReturn(Optional.empty());

        ProductionPlan existing = ProductionPlan.builder()
                .id(100L)
                .variantId(1L)
                .planMonth(planMonth)
                .status("DRAFT")
                .build();
        when(productionPlanRepository.findByVariantIdAndPlanMonth(1L, planMonth)).thenReturn(existing);
        when(productionPlanRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        List<ProductionPlanDto> results = productionPlanService.generateProductionPlan(planMonth);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getId()).isEqualTo(100L);
        verify(productionPlanRepository).save(existing);
    }

    @Test
    @DisplayName("Lấy danh sách kế hoạch sản xuất theo tháng")
    void getProductionPlansByMonth_success() {
        LocalDate month = LocalDate.now();
        ProductionPlan plan = ProductionPlan.builder().id(1L).build();
        when(productionPlanRepository.findPriorityPlansByMonth(month)).thenReturn(List.of(plan));

        List<ProductionPlanDto> results = productionPlanService.getProductionPlansByMonth(month);

        assertThat(results).hasSize(1);
    }

    @Test
    @DisplayName("Xác định độ ưu tiên LOW khi tồn kho dồi dào")
    void generateProductionPlan_lowPriority() {
        LocalDate planMonth = LocalDate.of(2024, 4, 1);
        DemandForecast f1 = DemandForecast.builder().variantId(1L).predictedDemand(10).build();
        when(forecastRepository.findTopForecastsByDateRange(any(), any())).thenReturn(List.of(f1));

        InventorySnapshot i1 = InventorySnapshot.builder().variantId(1L).availableQuantity(50).build();
        when(inventoryRepository.findTopByVariantIdOrderBySnapshotDateDesc(1L)).thenReturn(Optional.of(i1));
        when(productionPlanRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        List<ProductionPlanDto> results = productionPlanService.generateProductionPlan(planMonth);

        assertThat(results.get(0).getPriority()).isEqualTo("LOW");
        assertThat(results.get(0).getProductionGap()).isEqualTo(0);
        assertThat(results.get(0).getRecommendations()).contains("✓ Tồn kho ổn định. ");
    }

    @Test
    @DisplayName("Xác định độ ưu tiên MEDIUM khi tồn kho trung bình")
    void generateProductionPlan_mediumPriority() {
        LocalDate planMonth = LocalDate.of(2024, 4, 1);
        // Demand 100, Safety 20 -> Total Need 120. Inventory 50 -> Gap 70.
        // Ratio = 50 / 100 = 0.5 (< 0.6) -> MEDIUM
        DemandForecast f1 = DemandForecast.builder().variantId(1L).predictedDemand(100).build();
        when(forecastRepository.findTopForecastsByDateRange(any(), any())).thenReturn(List.of(f1));

        InventorySnapshot i1 = InventorySnapshot.builder().variantId(1L).availableQuantity(50).build();
        when(inventoryRepository.findTopByVariantIdOrderBySnapshotDateDesc(1L)).thenReturn(Optional.of(i1));
        when(productionPlanRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        List<ProductionPlanDto> results = productionPlanService.generateProductionPlan(planMonth);

        assertThat(results.get(0).getPriority()).isEqualTo("MEDIUM");
        assertThat(results.get(0).getProductionGap()).isEqualTo(70);
    }
}
