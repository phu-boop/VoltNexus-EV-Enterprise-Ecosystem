package com.example.reporting_service.controller;

import com.example.reporting_service.dto.InventoryVelocityDTO;
import com.example.reporting_service.model.CentralInventorySummary;
import com.example.reporting_service.model.CentralInventoryTransactionLog;
import com.example.reporting_service.model.InventorySummaryByRegion;
import com.example.reporting_service.model.SalesSummaryByDealership;
import com.example.reporting_service.repository.CentralInventorySummaryRepository;
import com.example.reporting_service.repository.CentralInventoryTransactionLogRepository;
import com.example.reporting_service.repository.InventorySummaryRepository;
import com.example.reporting_service.repository.SalesSummaryRepository;
import com.example.reporting_service.service.ReportingService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ReportController.class)
@AutoConfigureMockMvc(addFilters = false) // Tắt Security khi test
class ReportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private InventorySummaryRepository inventoryRepository;

    @MockBean
    private SalesSummaryRepository salesRepository;

    @MockBean
    private ReportingService reportingService;

    @MockBean
    private CentralInventorySummaryRepository centralInventoryRepo;

    @MockBean
    private CentralInventoryTransactionLogRepository centralTransactionLogRepo;

    @Test
    @DisplayName("Nên lấy báo cáo Tồn kho thành công")
    void getInventoryReport_ShouldReturnList() throws Exception {
        InventorySummaryByRegion summary = new InventorySummaryByRegion();
        summary.setRegion("North");
        summary.setModelName("VF 8");

        when(inventoryRepository.findAll(ArgumentMatchers.<Specification<InventorySummaryByRegion>>any()))
                .thenReturn(List.of(summary));

        mockMvc.perform(get("/reports/inventory")
                .param("region", "North")
                .param("modelId", "1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].region").value("North"))
                .andExpect(jsonPath("$[0].modelName").value("VF 8"));
    }

    @Test
    @DisplayName("Nên lấy báo cáo Doanh số bán hàng thành công")
    void getSalesReport_ShouldReturnList() throws Exception {
        SalesSummaryByDealership sales = new SalesSummaryByDealership();
        sales.setRegion("South");
        sales.setDealershipId(10L);

        when(salesRepository.findAll(ArgumentMatchers.<Specification<SalesSummaryByDealership>>any()))
                .thenReturn(List.of(sales));

        mockMvc.perform(get("/reports/sales")
                .param("region", "South")
                .param("dealershipId", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].region").value("South"))
                .andExpect(jsonPath("$[0].dealershipId").value(10));
    }

    @Test
    @DisplayName("Nên lấy báo cáo Inventory Velocity thành công")
    void getInventoryVelocityReport_ShouldReturnList() throws Exception {
        InventoryVelocityDTO dto = new InventoryVelocityDTO();
        dto.setRegion("Central");
        dto.setModelName("VF 5");
        dto.setAverageDailySales(2.0);

        when(reportingService.calculateInventoryVelocity(any(), any()))
                .thenReturn(List.of(dto));

        mockMvc.perform(get("/reports/inventory-velocity")
                .param("region", "Central")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].region").value("Central"))
                .andExpect(jsonPath("$[0].modelName").value("VF 5"))
                .andExpect(jsonPath("$[0].averageDailySales").value(2.0));
    }

    @Test
    @DisplayName("Nên lấy báo cáo Tồn kho trung tâm thành công")
    void getCentralInventoryReport_ShouldReturnList() throws Exception {
        CentralInventorySummary summary = new CentralInventorySummary();
        summary.setModelId(1L);
        summary.setVariantId(2L);
        summary.setTotalStock(100L);

        when(centralInventoryRepo.findAll(ArgumentMatchers.<Specification<CentralInventorySummary>>any()))
                .thenReturn(List.of(summary));

        mockMvc.perform(get("/reports/central-inventory")
                .param("modelId", "1")
                .param("variantId", "2")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].modelId").value(1))
                .andExpect(jsonPath("$[0].totalStock").value(100));
    }

    @Test
    @DisplayName("Nên lấy lịch sử giao dịch Tồn kho trung tâm thành công")
    void getCentralTransactionHistory_ShouldReturnList() throws Exception {
        CentralInventoryTransactionLog log = new CentralInventoryTransactionLog();
        log.setTransactionType("IMPORT");
        log.setVariantId(2L);
        log.setQuantity(50);

        when(centralTransactionLogRepo.findAll(ArgumentMatchers.<Specification<CentralInventoryTransactionLog>>any()))
                .thenReturn(List.of(log));

        mockMvc.perform(get("/reports/central-inventory/transactions")
                .param("transactionType", "IMPORT")
                .param("variantId", "2")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].transactionType").value("IMPORT"))
                .andExpect(jsonPath("$[0].quantity").value(50));
    }
}
