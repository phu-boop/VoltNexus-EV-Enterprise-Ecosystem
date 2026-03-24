package com.ev.customer_service.service;

import com.ev.customer_service.entity.TestDriveAppointment;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TestDriveNotificationServiceTest {

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private TestDriveNotificationService notificationService;

    private TestDriveAppointment appointment;

    @BeforeEach
    void setUp() {
        appointment = new TestDriveAppointment();
        appointment.setAppointmentId(1L);
        appointment.setAppointmentDate(LocalDateTime.now().plusDays(1));
        appointment.setTestDriveLocation("Showroom A");
        appointment.setStaffId("STAFF1");
        appointment.setModelId(101L);

        // Set private @Value fields using ReflectionTestUtils
        ReflectionTestUtils.setField(notificationService, "notificationEnabled", true);
        ReflectionTestUtils.setField(notificationService, "notificationServiceUrl", "http://test-url");
    }

    @Test
    @DisplayName("Gửi thông báo xác nhận lịch hẹn (Email & SMS)")
    void sendAppointmentConfirmation_success() {
        notificationService.sendAppointmentConfirmation(appointment, "customer@example.com", "0912345678", "John Doe");

        // Since the current implementation just logs, we verify no interactions with
        // restTemplate yet
        // (if it was enabled, we would verify postForObject)
        verifyNoInteractions(restTemplate);
    }

    @Test
    @DisplayName("Gửi thông báo cập nhật lịch hẹn")
    void sendAppointmentUpdate_success() {
        notificationService.sendAppointmentUpdate(appointment, "customer@example.com", "0912345678", "John Doe");
        verifyNoInteractions(restTemplate);
    }

    @Test
    @DisplayName("Gửi thông báo hủy lịch hẹn")
    void sendAppointmentCancellation_success() {
        appointment.setCancellationReason("Customer requested");
        notificationService.sendAppointmentCancellation(appointment, "customer@example.com", "0912345678", "John Doe");
        verifyNoInteractions(restTemplate);
    }

    @Test
    @DisplayName("Gửi nhắc nhở lịch hẹn")
    void sendAppointmentReminder_success() {
        notificationService.sendAppointmentReminder(appointment, "customer@example.com", "0912345678", "John Doe");
        verifyNoInteractions(restTemplate);
    }

    @Test
    @DisplayName("Gửi thông báo cho nhân viên")
    void sendStaffNotification_success() {
        notificationService.sendStaffNotification(appointment, "staff@example.com", "Staff A");
        verifyNoInteractions(restTemplate);
    }

    @Test
    @DisplayName("Không gửi thông báo khi disabled")
    void sendConfirmation_disabled_doesNothing() {
        ReflectionTestUtils.setField(notificationService, "notificationEnabled", false);

        notificationService.sendAppointmentConfirmation(appointment, "customer@example.com", null, "John Doe");

        verifyNoInteractions(restTemplate);
    }
}
