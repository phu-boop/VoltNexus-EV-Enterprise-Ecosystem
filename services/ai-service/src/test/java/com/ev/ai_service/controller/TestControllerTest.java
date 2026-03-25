package com.ev.ai_service.controller;

import com.ev.ai_service.repository.InventorySnapshotRepository;
import com.ev.ai_service.repository.SalesHistoryRepository;
import com.ev.common_lib.dto.respond.ApiRespond;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TestControllerTest {

    @Mock
    private SalesHistoryRepository salesHistoryRepository;
    @Mock
    private InventorySnapshotRepository inventorySnapshotRepository;

    @InjectMocks
    private TestController testController;

    @Test
    @DisplayName("Health check thành công")
    void healthCheck_success() {
        ResponseEntity<ApiRespond<String>> response = testController.healthCheck();
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getData()).isEqualTo("OK");
    }

    @Test
    @DisplayName("Lấy trạng thái dữ liệu thành công")
    void getDataStatus_success() {
        when(salesHistoryRepository.count()).thenReturn(100L);
        when(inventorySnapshotRepository.count()).thenReturn(50L);

        var response = testController.getDataStatus();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    @DisplayName("Seed dữ liệu thành công")
    void seedData_success() {
        ResponseEntity<ApiRespond<String>> response = testController.seedData(2, 10);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(salesHistoryRepository).saveAll(anyList());
        verify(inventorySnapshotRepository).saveAll(anyList());
    }

    @Test
    @DisplayName("Xóa dữ liệu thành công")
    void clearData_success() {
        ResponseEntity<ApiRespond<String>> response = testController.clearData();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(salesHistoryRepository).deleteAll();
        verify(inventorySnapshotRepository).deleteAll();
    }

    @Test
    @DisplayName("Lấy mock forecast thành công")
    void getMockForecast_success() {
        ResponseEntity<ApiRespond<Object>> response = testController.getMockForecast();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getData()).isNotNull();
    }

    @Test
    @DisplayName("Lấy trạng thái dữ liệu khi không có dữ liệu")
    void getDataStatus_noData() {
        when(salesHistoryRepository.count()).thenReturn(0L);
        when(inventorySnapshotRepository.count()).thenReturn(0L);

        var response = testController.getDataStatus();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getData().toString()).contains("hasData=false");
        assertThat(response.getBody().getData().toString()).contains("No data");
    }

    @Test
    @DisplayName("Seed dữ liệu thất bại do lỗi database")
    void seedData_exception() {
        when(salesHistoryRepository.saveAll(anyList())).thenThrow(new RuntimeException("DB Error"));

        ResponseEntity<ApiRespond<String>> response = testController.seedData(1, 1);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody().getMessage()).contains("Failed to seed data");
    }

    @Test
    @DisplayName("Xóa dữ liệu thất bại do lỗi database")
    void clearData_exception() {
        doThrow(new RuntimeException("DB Error")).when(salesHistoryRepository).deleteAll();

        ResponseEntity<ApiRespond<String>> response = testController.clearData();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody().getMessage()).contains("Failed to clear data");
    }
}
