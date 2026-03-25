package com.ev.customer_service.service;

import com.ev.customer_service.dto.request.CancelTestDriveRequest;
import com.ev.customer_service.dto.request.PublicTestDriveRequest;
import com.ev.customer_service.dto.request.TestDriveFeedbackRequest;
import com.ev.customer_service.dto.request.TestDriveRequest;
import com.ev.customer_service.dto.request.UpdateTestDriveRequest;
import com.ev.customer_service.dto.request.TestDriveFilterRequest;
import com.ev.customer_service.dto.response.TestDriveResponse;
import com.ev.customer_service.dto.response.TestDriveStatisticsResponse;
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
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
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
        customer.setPhone("0123456789");

        appointment = new TestDriveAppointment();
        appointment.setAppointmentId(1L);
        appointment.setCustomer(customer);
        appointment.setDealerId("DEALER1");
        appointment.setModelId(101L);
        appointment.setAppointmentDate(LocalDateTime.now().plusDays(1));
        appointment.setStatus("SCHEDULED");
        appointment.setDurationMinutes(60);

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
            testDriveRequest.setStaffId("STAFF1");
            when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
            when(appointmentRepository.save(any(TestDriveAppointment.class))).thenReturn(appointment);

            TestDriveResponse result = testDriveService.createAppointment(testDriveRequest);

            assertThat(result).isNotNull();
            verify(appointmentRepository, times(2)).save(any(TestDriveAppointment.class));
            verify(emailConfirmationService).sendConfirmationEmail(any(), any(), any(), any(), any(), any());
        }

        @Test
        @DisplayName("Tạo lịch hẹn thành công - default duration")
        void createAppointment_defaultDuration() {
            testDriveRequest.setDurationMinutes(null);
            when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
            when(appointmentRepository.save(any(TestDriveAppointment.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            testDriveService.createAppointment(testDriveRequest);

            verify(appointmentRepository, atLeastOnce())
                    .save(argThat(a -> a.getDurationMinutes() != null && a.getDurationMinutes() == 60));
        }

        @Test
        @DisplayName("Customer không tồn tại → ném ResourceNotFoundException")
        void createAppointment_customerNotFound() {
            when(customerRepository.findById(1L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> testDriveService.createAppointment(testDriveRequest))
                    .isInstanceOf(ResourceNotFoundException.class);
        }

        @Test
        @DisplayName("Lỗi gửi email → không throw exception")
        void createAppointment_emailError() {
            when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
            when(appointmentRepository.save(any(TestDriveAppointment.class))).thenReturn(appointment);
            doThrow(new RuntimeException("Mail server down")).when(emailConfirmationService)
                    .sendConfirmationEmail(any(), any(), any(), any(), any(), any());

            TestDriveResponse result = testDriveService.createAppointment(testDriveRequest);

            assertThat(result).isNotNull();
            verify(appointmentRepository, times(1)).save(any(TestDriveAppointment.class));
        }
    }

    @Nested
    @DisplayName("createPublicAppointment()")
    class CreatePublicAppointment {
        @Test
        @DisplayName("Tạo lịch hẹn public thành công - customer mới, name 1 phần")
        void createPublic_success_newCustomer() {
            PublicTestDriveRequest request = new PublicTestDriveRequest();
            request.setCustomerName("PublicUser");
            request.setCustomerEmail("public@ev.com");
            request.setCustomerPhone("0987654321");
            request.setModelId(101L);
            request.setAppointmentDate(LocalDateTime.now().plusDays(1));

            when(customerRepository.findByPhone(anyString())).thenReturn(Optional.empty());
            when(customerRepository.findByEmail(anyString())).thenReturn(Optional.empty());
            when(customerRepository.save(any(Customer.class))).thenAnswer(i -> i.getArgument(0));
            when(appointmentRepository.save(any(TestDriveAppointment.class))).thenReturn(appointment);

            TestDriveResponse result = testDriveService.createPublicAppointment(request);

            assertThat(result).isNotNull();
            verify(customerRepository)
                    .save(argThat(c -> c.getFirstName().equals("PublicUser") && c.getLastName().equals("")));
        }

        @Test
        @DisplayName("Tạo public - update customer info branches")
        void createPublic_updateBranches() {
            PublicTestDriveRequest request = new PublicTestDriveRequest();
            request.setCustomerPhone("0123456789");
            request.setCustomerEmail("new@ev.com");
            request.setProfileId("P1");
            request.setModelId(101L);
            request.setAppointmentDate(LocalDateTime.now().plusDays(1));

            customer.setProfileId(null);
            customer.setPhone("0123456789");

            when(customerRepository.findByPhone("0123456789")).thenReturn(Optional.of(customer));
            when(customerRepository.existsByEmail("new@ev.com")).thenReturn(true);
            when(appointmentRepository.save(any(TestDriveAppointment.class))).thenReturn(appointment);

            testDriveService.createPublicAppointment(request);

            assertThat(customer.getProfileId()).isEqualTo("P1");
            assertThat(customer.getEmail()).isEqualTo("john.doe@example.com");
            verify(customerRepository).save(customer);
        }

        @Test
        @DisplayName("Tạo lịch hẹn public - matching email")
        void createPublic_matchEmail() {
            PublicTestDriveRequest request = new PublicTestDriveRequest();
            request.setCustomerEmail("john.doe@example.com");
            request.setModelId(101L);
            request.setAppointmentDate(LocalDateTime.now().plusDays(1));

            when(customerRepository.findByEmail("john.doe@example.com")).thenReturn(Optional.of(customer));
            when(appointmentRepository.save(any(TestDriveAppointment.class))).thenReturn(appointment);

            testDriveService.createPublicAppointment(request);

            verify(appointmentRepository, atLeastOnce()).save(any(TestDriveAppointment.class));
        }

        @Test
        @DisplayName("Tạo public - case email empty")
        void createPublic_emptyEmail() {
            PublicTestDriveRequest request = new PublicTestDriveRequest();
            request.setCustomerEmail("");
            request.setModelId(101L);
            request.setAppointmentDate(LocalDateTime.now().plusDays(1));

            when(appointmentRepository.save(any(TestDriveAppointment.class))).thenReturn(appointment);

            testDriveService.createPublicAppointment(request);

            verify(emailConfirmationService, never()).sendConfirmationEmail(any(), any(), any(), any(), any(), any());
        }
    }

    @Nested
    @DisplayName("updateAppointment()")
    class UpdateAppointment {
        @Test
        @DisplayName("Cập nhật full fields")
        void update_full() {
            UpdateTestDriveRequest req = new UpdateTestDriveRequest();
            req.setAppointmentDate(LocalDateTime.now().plusDays(2));
            req.setAppointmentTime("10:00 - 11:00");
            req.setDurationMinutes(45);
            req.setModelId(202L);
            req.setVariantId(303L);
            req.setStaffId("S2");
            req.setTestDriveLocation("Home");
            req.setStaffNotes("Notes");
            req.setUpdatedBy("Verifier");

            when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));
            when(appointmentRepository.save(any(TestDriveAppointment.class))).thenAnswer(i -> i.getArgument(0));

            testDriveService.updateAppointment(1L, req);

            verify(appointmentRepository).save(argThat(a -> a.getDurationMinutes() == 45 &&
                    a.getStaffId().equals("S2") &&
                    a.getVariantId() == 303L &&
                    a.getTestDriveLocation().equals("Home")));
        }

        @Test
        @DisplayName("Lỗi thông báo khi update")
        void update_notificationError() {
            UpdateTestDriveRequest req = new UpdateTestDriveRequest();
            req.setStaffId("S1");
            when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));
            when(appointmentRepository.save(any(TestDriveAppointment.class))).thenReturn(appointment);
            doThrow(new RuntimeException()).when(notificationService).sendAppointmentUpdate(any(), any(), any(), any());

            testDriveService.updateAppointment(1L, req);

            verify(appointmentRepository).save(any());
        }
    }

    @Nested
    @DisplayName("confirm / cancel by token branches")
    class TokenBranches {
        @Test
        void confirm_tokenNull() {
            appointment.setConfirmationToken(null);
            when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));
            assertThatThrownBy(() -> testDriveService.confirmAppointmentByToken(1L, "any"))
                    .isInstanceOf(IllegalArgumentException.class);
        }

        @Test
        void confirm_expiredNull() {
            appointment.setConfirmationToken("T");
            appointment.setConfirmationExpiresAt(null);
            when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));
            testDriveService.confirmAppointmentByToken(1L, "T");
            assertThat(appointment.getIsConfirmed()).isTrue();
        }

        @Test
        void cancel_tokenNull() {
            appointment.setConfirmationToken(null);
            when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));
            assertThatThrownBy(() -> testDriveService.cancelAppointmentByToken(1L, "any"))
                    .isInstanceOf(IllegalArgumentException.class);
        }
    }

    @Nested
    @DisplayName("submitFeedback branches")
    class FeedbackBranches {
        @Test
        void submit_noNotes() {
            appointment.setStatus("COMPLETED");
            TestDriveFeedbackRequest req = new TestDriveFeedbackRequest();
            req.setFeedbackRating(4);
            req.setStaffNotes(null);
            req.setUpdatedBy(null);

            when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));
            when(appointmentRepository.save(any())).thenReturn(appointment);

            testDriveService.submitFeedback(1L, req);

            assertThat(appointment.getFeedbackRating()).isEqualTo(4);
        }

        @Test
        void submit_appendNotes() {
            appointment.setStatus("COMPLETED");
            appointment.setStaffNotes("Initial");
            TestDriveFeedbackRequest req = new TestDriveFeedbackRequest();
            req.setStaffNotes("New");

            when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));
            when(appointmentRepository.save(any())).thenReturn(appointment);

            testDriveService.submitFeedback(1L, req);

            assertThat(appointment.getStaffNotes()).contains("Initial").contains("New");
        }
    }

    @Nested
    @DisplayName("Statistics branches")
    class StatisticsBranches {
        @Test
        void stats_allStatuses() {
            List<TestDriveAppointment> list = new ArrayList<>();
            list.add(createAppt("SCHEDULED"));
            list.add(createAppt("CONFIRMED"));
            list.add(createAppt("COMPLETED"));
            list.add(createAppt("CANCELLED"));
            list.add(createAppt("EXPIRED"));

            when(appointmentRepository.findByDateRange(any(), any())).thenReturn(list);
            TestDriveStatisticsResponse res = testDriveService.getStatistics(null, LocalDateTime.now(),
                    LocalDateTime.now());

            assertThat(res.getScheduledCount()).isEqualTo(1);
            assertThat(res.getConfirmedCount()).isEqualTo(1);
            assertThat(res.getCompletedCount()).isEqualTo(1);
            assertThat(res.getCancelledCount()).isEqualTo(1);
            assertThat(res.getCompletionRate()).isEqualTo(20.0);
        }

        @Test
        void stats_empty() {
            when(appointmentRepository.findByDateRange(any(), any())).thenReturn(new ArrayList<>());
            TestDriveStatisticsResponse res = testDriveService.getStatistics(null, LocalDateTime.now(),
                    LocalDateTime.now());
            assertThat(res.getCompletionRate()).isEqualTo(0.0);
        }

        private TestDriveAppointment createAppt(String status) {
            TestDriveAppointment a = new TestDriveAppointment();
            a.setStatus(status);
            a.setAppointmentDate(LocalDateTime.now());
            a.setModelId(1L);
            a.setCustomer(customer);
            return a;
        }
    }

    @Nested
    @DisplayName("validateNoConflicts branches")
    class ConflictsBranches {
        @Test
        @DisplayName("validate branches - null inputs")
        void validate_nullInputs() {
            PublicTestDriveRequest req = new PublicTestDriveRequest();
            // date/duration null -> return early
            req.setAppointmentDate(null);

            when(customerRepository.save(any())).thenReturn(customer);
            when(appointmentRepository.save(any())).thenReturn(appointment);

            testDriveService.createPublicAppointment(req);

            verify(appointmentRepository, never()).findConflictingAppointmentsByStaff(any(), any(), any());
        }

        @Test
        @DisplayName("validate branches - staff empty")
        void validate_staffEmpty() {
            testDriveRequest.setStaffId("");
            when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
            when(appointmentRepository.save(any())).thenReturn(appointment);
            testDriveService.createAppointment(testDriveRequest);
            verify(appointmentRepository, never()).findConflictingAppointmentsByStaff(any(), any(), any());
        }
    }

    @Nested
    @DisplayName("Misc coverage")
    class Misc {
        @Test
        void completeAppointment_success() {
            when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));
            testDriveService.completeAppointment(1L);
            assertThat(appointment.getStatus()).isEqualTo("COMPLETED");
        }

        @Test
        void confirmDirect_success() {
            when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));
            testDriveService.confirmAppointment(1L);
            assertThat(appointment.getStatus()).isEqualTo("CONFIRMED");
        }

        @Test
        void getAppointmentsByProfileId_found() {
            when(customerRepository.findByProfileId("P1")).thenReturn(Optional.of(customer));
            when(appointmentRepository.findByCustomerCustomerId(1L)).thenReturn(List.of(appointment));
            var result = testDriveService.getAppointmentsByProfileId("P1");
            assertThat(result).hasSize(1);
        }
    }
}
