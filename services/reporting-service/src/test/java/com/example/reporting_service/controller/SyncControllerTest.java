package com.example.reporting_service.controller;

import com.example.reporting_service.service.SalesReportingService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SyncController.class)
@AutoConfigureMockMvc(addFilters = false) // Tắt Security khi test
class SyncControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SalesReportingService salesReportingService;

    @Test
    @DisplayName("Nên gọi đồng bộ Sales Data thành công")
    void syncSalesData_ShouldReturnSuccess() throws Exception {
        doNothing().when(salesReportingService).syncSalesData();

        mockMvc.perform(post("/api/sync/sales")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Sales data synchronization completed successfully."));

        verify(salesReportingService, times(1)).syncSalesData();
    }

    @Test
    @DisplayName("Nên gọi đồng bộ Inventory Data thành công")
    void syncInventoryData_ShouldReturnSuccess() throws Exception {
        doNothing().when(salesReportingService).syncInventoryData();

        mockMvc.perform(post("/api/sync/inventory")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Inventory data synchronization completed successfully."));

        verify(salesReportingService, times(1)).syncInventoryData();
    }

    @Test
    @DisplayName("Nên gọi đồng bộ Metadata thành công")
    void syncMetadata_ShouldReturnSuccess() throws Exception {
        doNothing().when(salesReportingService).syncMetadata();

        mockMvc.perform(post("/api/sync/metadata")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Metadata synchronization (connectivity check) completed."));

        verify(salesReportingService, times(1)).syncMetadata();
    }
}
