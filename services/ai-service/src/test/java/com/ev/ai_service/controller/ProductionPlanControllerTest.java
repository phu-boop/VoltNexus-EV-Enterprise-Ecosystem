package com.ev.ai_service.controller;

import com.ev.ai_service.dto.ProductionPlanDto;
import com.ev.ai_service.service.ProductionPlanService;
import com.ev.common_lib.dto.respond.ApiRespond;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductionPlanControllerTest {

    @Mock
    private ProductionPlanService productionPlanService;

    @InjectMocks
    private ProductionPlanController productionPlanController;

    @Test
    @DisplayName("Tạo kế hoạch sản xuất qua Controller thành công")
    void generateProductionPlan_success() {
        LocalDate month = LocalDate.now();
        ProductionPlanDto dto = ProductionPlanDto.builder().id(1L).build();
        when(productionPlanService.generateProductionPlan(month)).thenReturn(List.of(dto));

        ResponseEntity<ApiRespond<List<ProductionPlanDto>>> response = productionPlanController
                .generateProductionPlan(month);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getData()).hasSize(1);
    }

    @Test
    @DisplayName("Lấy kế hoạch sản xuất qua Controller thành công")
    void getProductionPlans_success() {
        LocalDate month = LocalDate.now();
        when(productionPlanService.getProductionPlansByMonth(month)).thenReturn(List.of());

        ResponseEntity<ApiRespond<List<ProductionPlanDto>>> response = productionPlanController
                .getProductionPlans(month);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    @DisplayName("Approve kế hoạch sản xuất qua Controller thành công")
    void approveProductionPlan_success() {
        ProductionPlanDto dto = ProductionPlanDto.builder().id(1L).status("APPROVED").build();
        when(productionPlanService.approveProductionPlan(1L)).thenReturn(dto);

        ResponseEntity<ApiRespond<ProductionPlanDto>> response = productionPlanController.approveProductionPlan(1L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getData().getStatus()).isEqualTo("APPROVED");
    }

    @Test
    @DisplayName("Xử lý lỗi khi tạo kế hoạch sản xuất")
    void generateProductionPlan_error() {
        when(productionPlanService.generateProductionPlan(any())).thenThrow(new RuntimeException("Service Error"));

        ResponseEntity<ApiRespond<List<ProductionPlanDto>>> response = productionPlanController
                .generateProductionPlan(LocalDate.now());

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody().getMessage()).contains("Service Error");
    }

    @Test
    @DisplayName("Xử lý lỗi khi lấy kế hoạch sản xuất")
    void getProductionPlans_error() {
        when(productionPlanService.getProductionPlansByMonth(any())).thenThrow(new RuntimeException("Fetch Error"));

        ResponseEntity<ApiRespond<List<ProductionPlanDto>>> response = productionPlanController
                .getProductionPlans(LocalDate.now());

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody().getMessage()).contains("Fetch Error");
    }

    @Test
    @DisplayName("Xử lý lỗi khi approve kế hoạch sản xuất")
    void approveProductionPlan_error() {
        when(productionPlanService.approveProductionPlan(anyLong())).thenThrow(new RuntimeException("Approve Error"));

        ResponseEntity<ApiRespond<ProductionPlanDto>> response = productionPlanController.approveProductionPlan(1L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody().getMessage()).contains("Approve Error");
    }
}
