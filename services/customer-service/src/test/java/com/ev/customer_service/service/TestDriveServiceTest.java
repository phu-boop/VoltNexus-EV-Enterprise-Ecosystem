package com.ev.customer_service.service;

import com.ev.customer_service.dto.request.TestDriveRequest;
import com.ev.customer_service.dto.request.UpdateTestDriveRequest;
import com.ev.customer_service.dto.response.TestDriveResponse;
import com.ev.customer_service.entity.Customer;
import com.ev.customer_service.entity.TestDriveAppointment;
import com.ev.customer_service.exception.ResourceNotFoundException;
import com.ev.customer_service.repository.CustomerRepository;
import com.ev.customer_service.repository.TestDriveAppointmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TestDriveServiceTest {

    @Mock
    private TestDriveAppointmentRepository appointmentRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private TestDriveNotificationService notificationService;

    @Mock
    private EmailConfirmationService emailConfirmationService;

    @Spy
    private ModelMapper modelMapper = new ModelMapper();

    @InjectMocks
    private TestDriveService testDriveService;

    private Customer customer;
    private TestDriveAppointment appointment;
    private TestDriveRequest testDriveRequest;

    @BeforeEach
    void setUp() {
        customer = new Customer();
        customer.setCustomerId(1L);
        customer.setFirstName("John");
        customer.setLastName("Doe");
        customer.setEmail("john.doe@example.com");

        appointment = new TestDriveAppointment();
        appointment.setAppointmentId(1L);
        appointment.setCustomer(customer);
        appointment.setDealerId("DEALER1");
        appointment.setModelId(101L);
        appointment.setAppointmentDate(LocalDateTime.now().plusDays(1));
        appointment.setStatus("SCHEDULED");

        testDriveRequest = new TestDriveRequest();
        testDriveRequest.setCustomerId(1L);
        testDriveRequest.setDealerId("DEALER1");
        testDriveRequest.setModelId(101L);
        testDriveRequest.setAppointmentDate(LocalDateTime.now().plusDays(1));
        testDriveRequest.setDurationMinutes(60);
    }

    @Nested
    @DisplayName("createAppointment()")
    class CreateAppointment {

        @Test
        @DisplayName("Tạo lịch hẹn thành công")
        void createAppointment_success() {
            when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
            when(appointmentRepository.save(any(TestDriveAppointment.class))).thenReturn(appointment);

            TestDriveResponse result = testDriveService.createAppointment(testDriveRequest);

            assertThat(result).isNotNull();
            verify(appointmentRepository, times(2)).save(any(TestDriveAppointment.class));
            verify(emailConfirmationService).sendConfirmationEmail(any(), any(), any(), any(), any(), any());
        }

        @Test
        @DisplayName("Customer không tồn tại → ném ResourceNotFoundException")
        void createAppointment_customerNotFound() {
            when(customerRepository.findById(1L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> testDriveService.createAppointment(testDriveRequest))
                    .isInstanceOf(ResourceNotFoundException.class);
        }

        @Test
        @DisplayName("Trùng lịch nhân viên → ném IllegalStateException")
        void createAppointment_conflictStaff() {
            testDriveRequest.setStaffId("STAFF1");
            when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));

            TestDriveAppointment conflict = new TestDriveAppointment();
            conflict.setAppointmentDate(LocalDateTime.now());

            when(appointmentRepository.findConflictingAppointmentsByStaff(anyString(), any(), any()))
                    .thenReturn(List.of(conflict));

            assertThatThrownBy(() -> testDriveService.createAppointment(testDriveRequest))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Nhân viên đã có lịch hẹn");
        }
    }

    @Nested
    @DisplayName("confirmAppointmentByToken()")
    class ConfirmAppointmentByToken {

        @Test
        @DisplayName("Xác nhận qua token thành công")
        void confirmByToken_success() {
            appointment.setConfirmationToken("valid-token");
            appointment.setConfirmationExpiresAt(LocalDateTime.now().plusHours(1));
            when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));

            testDriveService.confirmAppointmentByToken(1L, "valid-token");

            assertThat(appointment.getStatus()).isEqualTo("CONFIRMED");
            assertThat(appointment.getIsConfirmed()).isTrue();
            verify(appointmentRepository).save(appointment);
        }

        @Test
        @DisplayName("Token không hợp lệ → ném IllegalArgumentException")
        void confirmByToken_invalidToken() {
            appointment.setConfirmationToken("valid-token");
            when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));

            assertThatThrownBy(() -> testDriveService.confirmAppointmentByToken(1L, "wrong-token"))
                    .isInstanceOf(IllegalArgumentException.class);
        }

        @Test
        @DisplayName("Token hết hạn → ném IllegalStateException")
        void confirmByToken_expiredToken() {
            appointment.setConfirmationToken("valid-token");
            appointment.setConfirmationExpiresAt(LocalDateTime.now().minusHours(1));
            when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));

            assertThatThrownBy(() -> testDriveService.confirmAppointmentByToken(1L, "valid-token"))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("expired");
        }
    }

    @Nested
    @DisplayName("updateAppointment()")
    class UpdateAppointment {

        @Test
        @DisplayName("Cập nhật thành công và gửi thông báo")
        void updateAppointment_success() {
            UpdateTestDriveRequest updateRequest = new UpdateTestDriveRequest();
            updateRequest.setAppointmentDate(LocalDateTime.now().plusDays(2));

            when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));
            when(appointmentRepository.save(any(TestDriveAppointment.class))).thenReturn(appointment);

            testDriveService.updateAppointment(1L, updateRequest);

            verify(appointmentRepository).save(appointment);
            verify(notificationService).sendAppointmentUpdate(any(), any(), any(), any());
        }

        @Test
        @DisplayName("Cập nhật appointment đã hoàn thành → ném IllegalStateException")
        void updateAppointment_completed_throwsException() {
            appointment.setStatus("COMPLETED");
            when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));

            assertThatThrownBy(() -> testDriveService.updateAppointment(1L, new UpdateTestDriveRequest()))
                    .isInstanceOf(IllegalStateException.class);
        }
    }

    @Nested
    @DisplayName("getStatistics()")
    class GetStatistics {

        @Test
        @DisplayName("Tính toán thống kê đúng tỉ lệ")
        void getStatistics_calculatesCorrectly() {
            TestDriveAppointment completed = new TestDriveAppointment();
            completed.setStatus("COMPLETED");
            completed.setAppointmentDate(LocalDateTime.now());

            TestDriveAppointment cancelled = new TestDriveAppointment();
            cancelled.setStatus("CANCELLED");
            cancelled.setAppointmentDate(LocalDateTime.now());

            when(appointmentRepository.findByDealerIdAndDateRange(anyString(), any(), any()))
                    .thenReturn(List.of(completed, cancelled));

            var stats = testDriveService.getStatistics("DEALER1", LocalDateTime.now().minusDays(1),
                    LocalDateTime.now());

            assertThat(stats.getTotalAppointments()).isEqualTo(2);
            assertThat(stats.getCompletionRate()).isEqualTo(50.0);
            assertThat(stats.getCancellationRate()).isEqualTo(50.0);
        }
    }
}
