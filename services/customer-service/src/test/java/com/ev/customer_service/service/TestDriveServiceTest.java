package com.ev.customer_service.service;

import com.ev.customer_service.dto.request.TestDriveRequest;
import com.ev.customer_service.dto.request.UpdateTestDriveRequest;
import com.ev.customer_service.dto.request.PublicTestDriveRequest;
import com.ev.customer_service.dto.request.CancelTestDriveRequest;
import com.ev.customer_service.dto.request.TestDriveFeedbackRequest;
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
    @DisplayName("getAppointmentsByProfileId()")
    class GetAppointmentsByProfileId {

        @Test
        @DisplayName("Lấy danh sách thành công khi customer tồn tại")
        void getByProfileId_success() {
            String profileId = "prof-123";
            when(customerRepository.findByProfileId(profileId)).thenReturn(Optional.of(customer));
            when(appointmentRepository.findByCustomerCustomerId(customer.getCustomerId()))
                    .thenReturn(List.of(appointment));

            List<TestDriveResponse> result = testDriveService.getAppointmentsByProfileId(profileId);

            assertThat(result).hasSize(1);
            verify(customerRepository).findByProfileId(profileId);
        }

        @Test
        @DisplayName("Trả về danh sách trống khi customer không tồn tại")
        void getByProfileId_customerNotFound() {
            String profileId = "new-user";
            when(customerRepository.findByProfileId(profileId)).thenReturn(Optional.empty());

            List<TestDriveResponse> result = testDriveService.getAppointmentsByProfileId(profileId);

            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("createPublicAppointment()")
    class CreatePublicAppointment {

        @Test
        @DisplayName("Tạo lịch hẹn public thành công - customer mới")
        void createPublic_success_newCustomer() {
            PublicTestDriveRequest request = new PublicTestDriveRequest();
            request.setCustomerName("Public User");
            request.setCustomerEmail("public@ev.com");
            request.setCustomerPhone("0987654321");
            request.setModelId(101L);
            request.setAppointmentDate(LocalDateTime.now().plusDays(1));

            // findOrCreateCustomer logic
            when(customerRepository.findByPhone(anyString())).thenReturn(Optional.empty());
            when(customerRepository.findByEmail(anyString())).thenReturn(Optional.empty());
            when(customerRepository.save(any(Customer.class))).thenReturn(customer);
            when(appointmentRepository.save(any(TestDriveAppointment.class))).thenReturn(appointment);

            TestDriveResponse result = testDriveService.createPublicAppointment(request);

            assertThat(result).isNotNull();
            verify(customerRepository).save(any(Customer.class));
            verify(appointmentRepository, times(2)).save(any(TestDriveAppointment.class));
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
            UpdateTestDriveRequest updateReq = new UpdateTestDriveRequest();
            when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));

            assertThatThrownBy(() -> testDriveService.updateAppointment(1L, updateReq))
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

        @Test
        @DisplayName("Tính toán thống kê cho admin (dealerId null)")
        void getStatistics_adminBranch() {
            when(appointmentRepository.findByDateRange(any(), any()))
                    .thenReturn(List.of(appointment));

            var stats = testDriveService.getStatistics(null, LocalDateTime.now().minusDays(1), LocalDateTime.now());

            assertThat(stats.getTotalAppointments()).isEqualTo(1);
            verify(appointmentRepository).findByDateRange(any(), any());
        }
    }

    @Nested
    @DisplayName("getCalendarView()")
    class GetCalendarView {
        @Test
        @DisplayName("Lấy calendar cho dealer")
        void getCalendar_dealer_success() {
            when(appointmentRepository.findByDealerIdAndDateRange(anyString(), any(), any()))
                    .thenReturn(List.of(appointment));

            var result = testDriveService.getCalendarView("DEALER1", LocalDateTime.now(),
                    LocalDateTime.now().plusDays(1));

            assertThat(result).hasSize(1);
            verify(appointmentRepository).findByDealerIdAndDateRange(anyString(), any(), any());
        }

        @Test
        @DisplayName("Lấy calendar cho admin (dealerId null)")
        void getCalendar_admin_success() {
            when(appointmentRepository.findByDateRange(any(), any()))
                    .thenReturn(List.of(appointment));

            var result = testDriveService.getCalendarView(null, LocalDateTime.now(), LocalDateTime.now().plusDays(1));

            assertThat(result).hasSize(1);
            verify(appointmentRepository).findByDateRange(any(), any());
        }
    }

    @Nested
    @DisplayName("cancelAppointment()")
    class CancelAppointment {
        @Test
        @DisplayName("Hủy lịch hẹn thành công")
        void cancelAppointment_success() {
            CancelTestDriveRequest request = new CancelTestDriveRequest();
            request.setCancellationReason("Customer changed mind");
            request.setCancelledBy("CUSTOMER");

            when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));

            testDriveService.cancelAppointment(1L, request);

            assertThat(appointment.getStatus()).isEqualTo("CANCELLED");
            assertThat(appointment.getCancellationReason()).isEqualTo("Customer changed mind");
            verify(appointmentRepository).save(appointment);
            verify(notificationService).sendAppointmentCancellation(any(), any(), any(), any());
        }

        @Test
        @DisplayName("Hủy lịch hẹn đã hủy -> ném IllegalStateException")
        void cancelAppointment_alreadyCancelled_throwsException() {
            appointment.setStatus("CANCELLED");
            CancelTestDriveRequest cancelReq = new CancelTestDriveRequest();
            when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));

            assertThatThrownBy(() -> testDriveService.cancelAppointment(1L, cancelReq))
                    .isInstanceOf(IllegalStateException.class);
        }
    }

    @Nested
    @DisplayName("confirmAppointment()")
    class ConfirmAppointment {
        @Test
        @DisplayName("Xác nhận lịch hẹn thành công")
        void confirmAppointment_success() {
            when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));

            testDriveService.confirmAppointment(1L);

            assertThat(appointment.getStatus()).isEqualTo("CONFIRMED");
            assertThat(appointment.getIsConfirmed()).isTrue();
            verify(appointmentRepository).save(appointment);
        }
    }

    @Nested
    @DisplayName("cancelAppointmentByToken()")
    class CancelAppointmentByToken {
        @Test
        @DisplayName("Hủy qua token thành công")
        void cancelByToken_success() {
            appointment.setConfirmationToken("valid-token");
            when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));

            testDriveService.cancelAppointmentByToken(1L, "valid-token");

            assertThat(appointment.getStatus()).isEqualTo("CANCELLED");
            verify(appointmentRepository).save(appointment);
        }
    }

    @Nested
    @DisplayName("submitFeedback()")
    class SubmitFeedback {
        @Test
        @DisplayName("Gửi feedback thành công cho appointment COMPLETED")
        void submitFeedback_success() {
            appointment.setStatus("COMPLETED");
            TestDriveFeedbackRequest feedbackReq = new TestDriveFeedbackRequest();
            feedbackReq.setFeedbackRating(5);
            feedbackReq.setFeedbackComment("Great!");

            when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));
            when(appointmentRepository.save(any(TestDriveAppointment.class))).thenReturn(appointment);

            var result = testDriveService.submitFeedback(1L, feedbackReq);

            assertThat(result).isNotNull();
            assertThat(appointment.getFeedbackRating()).isEqualTo(5);
            verify(appointmentRepository).save(appointment);
        }

        @Test
        @DisplayName("Gửi feedback cho appointment chưa COMPLETED -> ném IllegalStateException")
        void submitFeedback_notCompleted_throwsException() {
            appointment.setStatus("SCHEDULED");
            TestDriveFeedbackRequest feedbackReq = new TestDriveFeedbackRequest();
            when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));

            assertThatThrownBy(() -> testDriveService.submitFeedback(1L, feedbackReq))
                    .isInstanceOf(IllegalStateException.class);
        }
    }

    @Nested
    @DisplayName("completeAppointment()")
    class CompleteAppointment {
        @Test
        @DisplayName("Hoàn thành lịch hẹn thành công")
        void completeAppointment_success() {
            when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));

            testDriveService.completeAppointment(1L);

            assertThat(appointment.getStatus()).isEqualTo("COMPLETED");
            assertThat(appointment.getCompletedAt()).isNotNull();
            verify(appointmentRepository).save(appointment);
        }
    }

    @Nested
    @DisplayName("getAppointmentsWithFeedback()")
    class GetAppointmentsWithFeedback {
        @Test
        @DisplayName("Lấy danh sách có feedback thành công")
        void getWithFeedback_success() {
            appointment.setFeedbackRating(5);
            when(appointmentRepository.findByDealerId("DEALER1")).thenReturn(List.of(appointment));

            var result = testDriveService.getAppointmentsWithFeedback("DEALER1");

            assertThat(result).hasSize(1);
        }
    }

    @Nested
    @DisplayName("cancelAppointmentByToken() - Error cases")
    class CancelAppointmentByTokenErrors {
        @Test
        @DisplayName("Token không khớp -> ném IllegalArgumentException")
        void cancelByToken_invalidToken_throwsException() {
            appointment.setConfirmationToken("valid");
            when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));

            assertThatThrownBy(() -> testDriveService.cancelAppointmentByToken(1L, "wrong"))
                    .isInstanceOf(IllegalArgumentException.class);
        }

        @Test
        @DisplayName("Hủy appointment đã hoàn thành -> ném IllegalStateException")
        void cancelByToken_completed_throwsException() {
            appointment.setConfirmationToken("valid");
            appointment.setStatus("COMPLETED");
            when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));

            assertThatThrownBy(() -> testDriveService.cancelAppointmentByToken(1L, "valid"))
                    .isInstanceOf(IllegalStateException.class);
        }
    }

    @Nested
    @DisplayName("filterAppointments()")
    class FilterAppointments {
        @Test
        @DisplayName("Lọc thành công với Specification")
        void filterAppointments_success() {
            when(appointmentRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class)))
                    .thenReturn(List.of(appointment));

            var result = testDriveService
                    .filterAppointments(new com.ev.customer_service.dto.request.TestDriveFilterRequest());

            assertThat(result).hasSize(1);
        }
    }
}
