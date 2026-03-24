package com.ev.customer_service.service;

import com.ev.customer_service.entity.TestDriveAppointment;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailConfirmationServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private MimeMessage mimeMessage;

    @InjectMocks
    private EmailConfirmationService emailService;

    private TestDriveAppointment appointment;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(emailService, "fromEmail", "no-reply@test.com");
        ReflectionTestUtils.setField(emailService, "baseUrl", "http://backend.com");
        ReflectionTestUtils.setField(emailService, "frontendUrl", "http://frontend.com");

        appointment = new TestDriveAppointment();
        appointment.setAppointmentId(1L);
        appointment.setAppointmentDate(LocalDateTime.now().plusDays(5));
        appointment.setConfirmationExpiresAt(LocalDateTime.now().plusDays(1));
        appointment.setDurationMinutes(30);
        appointment.setTestDriveLocation("Showroom A");
        appointment.setConfirmationToken("token123");
        appointment.setStaffId("STAFF-1");
    }

    @Test
    @DisplayName("Gửi email xác nhận thành công")
    void sendConfirmationEmail_success() {
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        emailService.sendConfirmationEmail(appointment, "customer@test.com", "John Doe", "EV6", "GT-Line", "Staff A");

        verify(mailSender).send(mimeMessage);
    }

    @Test
    @DisplayName("Gửi email nhắc nhở lần 1 thành công")
    void sendFirstReminderEmail_success() {
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        emailService.sendFirstReminderEmail(appointment, "customer@test.com", "John Doe", "EV6", "GT-Line");

        verify(mailSender).send(mimeMessage);
    }

    @Test
    @DisplayName("Gửi email nhắc nhở lần 2 thành công")
    void sendSecondReminderEmail_success() {
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        emailService.sendSecondReminderEmail(appointment, "customer@test.com", "John Doe", "EV6", "GT-Line");

        verify(mailSender).send(mimeMessage);
    }

    @Test
    @DisplayName("Gửi email hết hạn thành công")
    void sendExpirationEmail_success() {
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        emailService.sendExpirationEmail(appointment, "customer@test.com", "John Doe", "EV6", "GT-Line");

        verify(mailSender).send(mimeMessage);
    }
}
