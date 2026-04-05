package com.ev.customer_service.service;

import com.ev.customer_service.entity.TestDriveAppointment;
import jakarta.mail.MessagingException;
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

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailConfirmationServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private MimeMessage mimeMessage;

    @InjectMocks
    private EmailConfirmationService emailConfirmationService;

    private TestDriveAppointment appointment;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(emailConfirmationService, "fromEmail", "test@ev.com");
        ReflectionTestUtils.setField(emailConfirmationService, "baseUrl", "http://api.ev.com");
        ReflectionTestUtils.setField(emailConfirmationService, "frontendUrl", "http://ev.com");

        appointment = new TestDriveAppointment();
        appointment.setAppointmentId(1L);
        appointment.setAppointmentDate(LocalDateTime.now().plusDays(1));
        appointment.setDurationMinutes(60);
        appointment.setConfirmationToken("token123");
        appointment.setConfirmationExpiresAt(LocalDateTime.now().plusDays(3));
        appointment.setTestDriveLocation("Showroom A");
        appointment.setModelId(101L);
        appointment.setVariantId(202L);

        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
    }

    @Test
    @DisplayName("Gửi email xác nhận thành công - Đầy đủ thông tin")
    void sendConfirmationEmail_success() {
        assertThatCode(() -> emailConfirmationService.sendConfirmationEmail(
                appointment, "customer@test.com", "John", "Model X", "Variant S", "Staff A"))
                .doesNotThrowAnyException();

        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("Gửi email xác nhận thành công - Thiếu model/variant (sử dụng ID)")
    void sendConfirmationEmail_missingModelVariant_success() {
        assertThatCode(() -> emailConfirmationService.sendConfirmationEmail(
                appointment, "customer@test.com", "John", null, null, null)).doesNotThrowAnyException();

        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("Lỗi MessagingException khi gửi email xác nhận -> ném RuntimeException")
    void sendConfirmationEmail_messagingException_throwsRuntimeException() {
        doThrow(new RuntimeException(new MessagingException("Connection failed")))
                .when(mailSender).send(any(MimeMessage.class));

        assertThatThrownBy(() -> emailConfirmationService.sendConfirmationEmail(
                appointment, "customer@test.com", "John", "Model X", "Variant S", "Staff A"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Failed to send confirmation email");
    }

    @Test
    @DisplayName("Gửi email nhắc nhở lần 1 thành công")
    void sendFirstReminderEmail_success() {
        assertThatCode(() -> emailConfirmationService.sendFirstReminderEmail(
                appointment, "customer@test.com", "John", "Model X", "Variant S")).doesNotThrowAnyException();

        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("Gửi email nhắc nhở lần 2 thành công - Thiếu variant")
    void sendSecondReminderEmail_success() {
        assertThatCode(() -> emailConfirmationService.sendSecondReminderEmail(
                appointment, "customer@test.com", "John", "Model X", null)).doesNotThrowAnyException();

        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("Gửi email hết hạn thành công")
    void sendExpirationEmail_success() {
        assertThatCode(() -> emailConfirmationService.sendExpirationEmail(
                appointment, "customer@test.com", "John", "Model X", "Variant S")).doesNotThrowAnyException();

        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("MessagingException khi gửi email nhắc nhở -> bắt lỗi và log (không throw)")
    void sendReminderEmail_messagingException_caught() {
        doThrow(new RuntimeException(new MessagingException("Error"))).when(mailSender).send(any(MimeMessage.class));

        // Should not throw
        emailConfirmationService.sendFirstReminderEmail(appointment, "customer@test.com", "John", "X", "S");
        emailConfirmationService.sendSecondReminderEmail(appointment, "customer@test.com", "John", "X", "S");
        emailConfirmationService.sendExpirationEmail(appointment, "customer@test.com", "John", "X", "S");

        verify(mailSender, times(3)).send(any(MimeMessage.class));
    }
}
