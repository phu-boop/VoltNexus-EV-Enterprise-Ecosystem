package com.ev.customer_service.controller;

import com.ev.customer_service.dto.request.CancelTestDriveRequest;
import com.ev.customer_service.dto.request.TestDriveRequest;
import com.ev.customer_service.dto.request.UpdateTestDriveRequest;
import com.ev.customer_service.dto.response.ApiResponse;
import com.ev.customer_service.dto.response.TestDriveResponse;
import com.ev.customer_service.service.TestDriveService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TestDriveControllerTest {

    @Mock
    private TestDriveService testDriveService;

    @InjectMocks
    private TestDriveController testDriveController;

    private TestDriveResponse testDriveResponse;

    @BeforeEach
    void setUp() {
        testDriveResponse = TestDriveResponse.builder()
                .appointmentId(1L)
                .customerName("John Doe")
                .vehicleModelName("Model S")
                .status("SCHEDULED")
                .build();
    }

    @Nested
    @DisplayName("GET methods")
    class GetMethods {

        @Test
        @DisplayName("getTestDrivesByDealer - should return list")
        void getTestDrivesByDealer_success() {
            when(testDriveService.getAppointmentsByDealerId("DEALER1")).thenReturn(List.of(testDriveResponse));

            ResponseEntity<ApiResponse<List<TestDriveResponse>>> response = testDriveController
                    .getTestDrivesByDealer("DEALER1");

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody().getData()).hasSize(1);
            verify(testDriveService).getAppointmentsByDealerId("DEALER1");
        }

        @Test
        @DisplayName("getTestDriveById - should return appointment")
        void getTestDriveById_success() {
            when(testDriveService.getAppointmentById(1L)).thenReturn(testDriveResponse);

            ResponseEntity<ApiResponse<TestDriveResponse>> response = testDriveController.getTestDriveById(1L);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody().getData().getAppointmentId()).isEqualTo(1L);
        }
    }

    @Nested
    @DisplayName("POST methods")
    class PostMethods {

        @Test
        @DisplayName("createTestDrive - should return created")
        void createTestDrive_success() {
            TestDriveRequest request = new TestDriveRequest();
            when(testDriveService.createAppointment(any(TestDriveRequest.class))).thenReturn(testDriveResponse);

            ResponseEntity<ApiResponse<TestDriveResponse>> response = testDriveController.createTestDrive(request);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
            assertThat(response.getBody().getMessage()).isEqualTo("Test drive appointment created successfully");
        }
    }

    @Nested
    @DisplayName("PUT methods")
    class PutMethods {

        @Test
        @DisplayName("updateTestDrive - should return updated")
        void updateTestDrive_success() {
            UpdateTestDriveRequest request = new UpdateTestDriveRequest();
            when(testDriveService.updateAppointment(eq(1L), any(UpdateTestDriveRequest.class)))
                    .thenReturn(testDriveResponse);

            ResponseEntity<ApiResponse<TestDriveResponse>> response = testDriveController.updateTestDrive(1L, request);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody().getMessage()).isEqualTo("Test drive appointment updated successfully");
        }

        @Test
        @DisplayName("confirmTestDrive - should return success")
        void confirmTestDrive_success() {
            ResponseEntity<ApiResponse<Void>> response = testDriveController.confirmTestDrive(1L);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody().getMessage()).isEqualTo("Test drive appointment confirmed successfully");
            verify(testDriveService).confirmAppointment(1L);
        }
    }

    @Nested
    @DisplayName("DELETE methods")
    class DeleteMethods {

        @Test
        @DisplayName("cancelTestDrive - should return success")
        void cancelTestDrive_success() {
            CancelTestDriveRequest request = new CancelTestDriveRequest();
            ResponseEntity<ApiResponse<Void>> response = testDriveController.cancelTestDrive(1L, request);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody().getMessage()).isEqualTo("Test drive appointment cancelled successfully");
            verify(testDriveService).cancelAppointment(eq(1L), any(CancelTestDriveRequest.class));
        }
    }
}
