package com.ev.customer_service.scheduler;

import com.ev.customer_service.entity.Customer;
import com.ev.customer_service.entity.TestDriveAppointment;
import com.ev.customer_service.repository.TestDriveAppointmentRepository;
import com.ev.customer_service.service.EmailConfirmationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AppointmentConfirmationSchedulerTest {

    @Mock
    private TestDriveAppointmentRepository appointmentRepository;

    @Mock
    private EmailConfirmationService emailService;

    @InjectMocks
    private AppointmentConfirmationScheduler scheduler;

    private TestDriveAppointment appointment;
    private Customer customer;

    @BeforeEach
    void setUp() {
        customer = new Customer();
        customer.setFirstName("John");
        customer.setLastName("Doe");
        customer.setEmail("john@example.com");

        appointment = new TestDriveAppointment();
        appointment.setAppointmentId(1L);
        appointment.setCustomer(customer);
        appointment.setStatus("SCHEDULED");
        appointment.setVehicleModelName("EV6");
        appointment.setVehicleVariantName("GT-Line");
        appointment.setIsConfirmed(false);
    }

    @Test
    @DisplayName("Gửi reminder lần 1 thành công")
    void sendFirstReminders_success() {
        LocalDateTime now = LocalDateTime.now();
        appointment.setConfirmationSentAt(now.minusDays(1).minusHours(1));
        appointment.setFirstReminderSentAt(null);

        when(appointmentRepository.findAll()).thenReturn(List.of(appointment));

        scheduler.processConfirmations();

        verify(emailService).sendFirstReminderEmail(eq(appointment), eq("john@example.com"), anyString(), anyString(),
                anyString());
        verify(appointmentRepository).save(appointment);
        assertThat(appointment.getFirstReminderSentAt()).isNotNull();
    }

    @Test
    @DisplayName("Gửi reminder lần 2 thành công")
    void sendSecondReminders_success() {
        LocalDateTime now = LocalDateTime.now();
        appointment.setConfirmationSentAt(now.minusDays(2).minusHours(1));
        appointment.setFirstReminderSentAt(now.minusDays(1));
        appointment.setSecondReminderSentAt(null);

        when(appointmentRepository.findAll()).thenReturn(List.of(appointment));

        scheduler.processConfirmations();

        verify(emailService).sendSecondReminderEmail(eq(appointment), eq("john@example.com"), anyString(), anyString(),
                anyString());
        verify(appointmentRepository).save(appointment);
        assertThat(appointment.getSecondReminderSentAt()).isNotNull();
    }

    @Test
    @DisplayName("Hết hạn sau 3 ngày chưa xác nhận")
    void expireUnconfirmedAppointments_success() {
        LocalDateTime now = LocalDateTime.now();
        appointment.setConfirmationExpiresAt(now.minusMinutes(1));
        appointment.setIsConfirmed(false);

        when(appointmentRepository.findAll()).thenReturn(List.of(appointment));

        scheduler.processConfirmations();

        assertThat(appointment.getStatus()).isEqualTo("EXPIRED");
        assertThat(appointment.getCancelledBy()).isEqualTo("SYSTEM");
        verify(emailService).sendExpirationEmail(eq(appointment), eq("john@example.com"), anyString(), anyString(),
                anyString());
        verify(appointmentRepository).save(appointment);
    }

    @Test
    @DisplayName("Hết hạn nếu sắp đến ngày hẹn mà chưa xác nhận")
    void expireNearAppointments_success() {
        LocalDateTime now = LocalDateTime.now();
        appointment.setAppointmentDate(now.plusDays(2)); // < 3 days away
        appointment.setIsConfirmed(false);

        when(appointmentRepository.findAll()).thenReturn(List.of(appointment));

        scheduler.processConfirmations();

        assertThat(appointment.getStatus()).isEqualTo("EXPIRED");
        assertThat(appointment.getCancelledBy()).isEqualTo("SYSTEM");
        verify(emailService).sendExpirationEmail(eq(appointment), eq("john@example.com"), anyString(), anyString(),
                anyString());
    }

    @Test
    @DisplayName("Không xử lý nếu đã xác nhận")
    void processConfirmations_alreadyConfirmed() {
        appointment.setIsConfirmed(true);
        when(appointmentRepository.findAll()).thenReturn(List.of(appointment));

        scheduler.processConfirmations();

        verifyNoInteractions(emailService);
        verify(appointmentRepository, never()).save(any());
    }
}
