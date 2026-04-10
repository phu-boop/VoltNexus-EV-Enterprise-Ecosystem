package com.example.reporting_service.controller;

import com.example.reporting_service.dto.SalesRecordRequest;
import com.example.reporting_service.model.SalesRecord;
import com.example.reporting_service.service.SalesReportingService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ReportingController.class)
@AutoConfigureMockMvc(addFilters = false) // Tắt Security khi test
class ReportingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SalesReportingService salesReportingService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Nên gửi request reportSale thành công")
    void reportSale_ShouldReturnSuccess() throws Exception {
        SalesRecordRequest req = new SalesRecordRequest();
        req.setOrderId(UUID.randomUUID());
        req.setTotalAmount(new BigDecimal("999.99"));
        req.setDealerName("Dealer A");
        req.setModelName("VF 8");

        doNothing().when(salesReportingService).recordSale(any(SalesRecord.class));

        mockMvc.perform(post("/api/reports/sales")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Sale recorded successfully"));

        verify(salesReportingService, times(1)).recordSale(any(SalesRecord.class));
    }

    @Test
    @DisplayName("Nên bắt lỗi nếu reportSale bị văng Exception")
    void reportSale_ShouldReturn500OnError() throws Exception {
        SalesRecordRequest req = new SalesRecordRequest();
        req.setOrderId(UUID.randomUUID());
        req.setTotalAmount(new BigDecimal("999.99"));

        doThrow(new RuntimeException("Lỗi DB")).when(salesReportingService).recordSale(any(SalesRecord.class));

        mockMvc.perform(post("/api/reports/sales")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.message").value("Failed to record sale: Lỗi DB"));
    }

    @Test
    @DisplayName("Nên lấy báo cáo Sales Summary thành công")
    void getSalesSummary_ShouldReturnList() throws Exception {
        SalesRecord record = new SalesRecord();
        UUID orderId = UUID.randomUUID();
        record.setOrderId(orderId);
        record.setModelName("VF 5");

        when(salesReportingService.getAllRecords()).thenReturn(List.of(record));

        mockMvc.perform(get("/api/reports/sales/summary")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].orderId").value(orderId.toString()))
                .andExpect(jsonPath("$[0].modelName").value("VF 5"));
    }

    @Test
    @DisplayName("Nên lấy Forecast dự báo thành công")
    void getForecast_ShouldReturnString() throws Exception {
        when(salesReportingService.getDemandForecast("VF 8")).thenReturn("Nhu cầu đang tăng mạnh");

        mockMvc.perform(post("/api/reports/forecast")
                .param("modelName", "VF 8")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.forecast").value("Nhu cầu đang tăng mạnh"));
    }

    @Test
    @DisplayName("Nên lấy trạng thái Cache Forecast thành công")
    void checkForecast_ShouldReturnBoolean() throws Exception {
        when(salesReportingService.checkForecastCache("VF 8")).thenReturn(true);

        mockMvc.perform(get("/api/reports/forecast/check")
                .param("modelName", "VF 8")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exists").value(true));
    }
}
