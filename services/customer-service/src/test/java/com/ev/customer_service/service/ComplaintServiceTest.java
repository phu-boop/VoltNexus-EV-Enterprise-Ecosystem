package com.ev.customer_service.service;

import com.ev.customer_service.dto.request.*;
import com.ev.customer_service.dto.response.ComplaintResponse;
import com.ev.customer_service.dto.response.ComplaintStatisticsResponse;
import com.ev.customer_service.entity.Complaint;
import com.ev.customer_service.entity.Customer;
import com.ev.customer_service.enums.ComplaintSeverity;
import com.ev.customer_service.enums.ComplaintStatus;
import com.ev.customer_service.exception.ResourceNotFoundException;
import com.ev.customer_service.repository.ComplaintRepository;
import com.ev.customer_service.repository.CustomerRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ComplaintServiceTest {

    @Mock
    private ComplaintRepository complaintRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private ObjectMapper objectMapper;

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private ComplaintService complaintService;

    private Customer customer;
    private Complaint complaint;
    private CreateComplaintRequest createRequest;

    @BeforeEach
    void setUp() {
        customer = new Customer();
        customer.setCustomerId(1L);
        customer.setFirstName("John");
        customer.setLastName("Doe");
        customer.setEmail("john@example.com");

        complaint = new Complaint();
        complaint.setComplaintId(1L);
        complaint.setComplaintCode("FB-20240324-0001");
        complaint.setCustomer(customer);
        complaint.setComplaintType(com.ev.customer_service.enums.ComplaintType.SERVICE_ATTITUDE);
        complaint.setSeverity(ComplaintSeverity.MEDIUM);
        complaint.setStatus(ComplaintStatus.NEW);
        complaint.setCreatedAt(LocalDateTime.now());

        createRequest = new CreateComplaintRequest();
        createRequest.setCustomerId(1L);
        createRequest.setComplaintType(com.ev.customer_service.enums.ComplaintType.SERVICE_ATTITUDE);
        createRequest.setSeverity(ComplaintSeverity.MEDIUM);
        createRequest.setDescription("Test description");
    }

    @Nested
    @DisplayName("Tạo mới khiếu nại")
    class CreateComplaint {
        @Test
        @DisplayName("Tạo thành công")
        void createComplaint_success() {
            when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
            when(complaintRepository.save(any(Complaint.class))).thenReturn(complaint);

            ComplaintResponse response = complaintService.createComplaint(createRequest);

            assertThat(response).isNotNull();
            assertThat(response.getComplaintCode()).isEqualTo("FB-20240324-0001");
            verify(complaintRepository).save(any(Complaint.class));
        }

        @Test
        @DisplayName("Customer không tồn tại → ném ResourceNotFoundException")
        void createComplaint_customerNotFound() {
            when(customerRepository.findById(1L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> complaintService.createComplaint(createRequest))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("Phân công khiếu nại")
    class AssignComplaint {
        @Test
        @DisplayName("Phân công thành công")
        void assignComplaint_success() {
            AssignComplaintRequest assignRequest = new AssignComplaintRequest();
            assignRequest.setAssignedStaffId("STAFF-1");
            assignRequest.setAssignedStaffName("Staff A");

            when(complaintRepository.findById(1L)).thenReturn(Optional.of(complaint));
            when(complaintRepository.save(any(Complaint.class))).thenReturn(complaint);

            ComplaintResponse response = complaintService.assignComplaint(1L, assignRequest);

            assertThat(response).isNotNull();
            verify(complaintRepository).save(complaint);
            assertThat(complaint.getStatus()).isEqualTo(ComplaintStatus.IN_PROGRESS);
        }
    }

    @Nested
    @DisplayName("Giải quyết & Đóng khiếu nại")
    class ResolveAndClose {
        @Test
        @DisplayName("Giải quyết thành công")
        void resolveComplaint_success() {
            ResolveComplaintRequest resolveRequest = new ResolveComplaintRequest();
            resolveRequest.setCustomerMessage("Resolved!");
            resolveRequest.setSendNotification(false);

            when(complaintRepository.findById(1L)).thenReturn(Optional.of(complaint));
            when(complaintRepository.save(any(Complaint.class))).thenReturn(complaint);

            ComplaintResponse response = complaintService.resolveComplaint(1L, resolveRequest);

            assertThat(response).isNotNull();
            assertThat(complaint.getStatus()).isEqualTo(ComplaintStatus.RESOLVED);
        }

        @Test
        @DisplayName("Đóng khiếu nại thành công")
        void closeComplaint_success() {
            complaint.setStatus(ComplaintStatus.RESOLVED);
            when(complaintRepository.findById(1L)).thenReturn(Optional.of(complaint));
            when(complaintRepository.save(any(Complaint.class))).thenReturn(complaint);

            ComplaintResponse response = complaintService.closeComplaint(1L);

            assertThat(response.getStatus()).isEqualTo(ComplaintStatus.CLOSED);
        }

        @Test
        @DisplayName("Đóng khiếu nại chưa giải quyết → ném IllegalStateException")
        void closeComplaint_notResolved() {
            complaint.setStatus(ComplaintStatus.IN_PROGRESS);
            when(complaintRepository.findById(1L)).thenReturn(Optional.of(complaint));

            assertThatThrownBy(() -> complaintService.closeComplaint(1L))
                    .isInstanceOf(IllegalStateException.class);
        }
    }

    @Nested
    @DisplayName("Thống kê khiếu nại")
    class Statistics {
        @Test
        @DisplayName("Lấy thống kê thành công")
        void getStatistics_success() {
            LocalDateTime now = LocalDateTime.now();
            when(complaintRepository.countByDealerIdAndDateRange(anyString(), any(), any())).thenReturn(10L);
            when(complaintRepository.countByDealerIdAndStatusAndDateRange(anyString(), any(), any(), any()))
                    .thenReturn(2L);
            when(complaintRepository.countByDealerIdAndSeverityAndDateRange(anyString(), any(), any(), any()))
                    .thenReturn(1L);
            when(complaintRepository.countByComplaintTypeAndDateRange(anyString(), any(), any()))
                    .thenReturn(Collections.singletonList(new Object[] { "SERVICE_ATTITUDE", 5L }));
            when(complaintRepository.countByAssignedStaffAndDateRange(anyString(), any(), any()))
                    .thenReturn(Collections.singletonList(new Object[] { "STAFF-1", 3L }));

            // Overdue counts
            when(complaintRepository.countOverdueComplaintsWithDateRange(anyString(), any(), any(), any(), any()))
                    .thenReturn(0L);

            ComplaintStatisticsResponse stats = complaintService.getStatistics("DEALER-1", now.minusDays(1), now);

            assertThat(stats).isNotNull();
            assertThat(stats.getTotalComplaints()).isEqualTo(10L);
            assertThat(stats.getByStatus().get("NEW")).isEqualTo(2L);
        }
    }

    @Nested
    @DisplayName("Gửi thông báo")
    class Notifications {
        @Test
        @DisplayName("Gửi thông báo cho khách (Email)")
        void sendNotificationToCustomer_success() throws Exception {
            complaint.setResolution("Fixed item");
            complaint.setResolvedDate(LocalDateTime.now());

            when(complaintRepository.findById(1L)).thenReturn(Optional.of(complaint));
            MimeMessage mockMessage = mock(MimeMessage.class);
            when(mailSender.createMimeMessage()).thenReturn(mockMessage);

            complaintService.sendNotificationToCustomer(1L);

            verify(mailSender).send(any(MimeMessage.class));
            verify(complaintRepository).save(complaint);
            assertThat(complaint.getNotificationSent()).isTrue();
        }

        @Test
        @DisplayName("Gửi thông báo khi chưa có kết quả → ném IllegalStateException")
        void sendNotificationToCustomer_noResolution() {
            complaint.setResolution(null);
            complaint.setCustomerMessage(null);
            when(complaintRepository.findById(1L)).thenReturn(Optional.of(complaint));

            assertThatThrownBy(() -> complaintService.sendNotificationToCustomer(1L))
                    .isInstanceOf(IllegalStateException.class);
        }
    }

    @Nested
    @DisplayName("Cập nhật tiến độ & Lấy thông tin")
    class UpdatesAndRetrieval {
        @Test
        @DisplayName("Thêm cập nhật tiến độ thành công")
        void addProgressUpdate_success() throws Exception {
            ComplaintProgressUpdate update = new ComplaintProgressUpdate();
            update.setUpdateNote("Investigating");
            update.setUpdatedByStaffId("STAFF-1");

            when(complaintRepository.findById(1L)).thenReturn(Optional.of(complaint));
            when(objectMapper.readValue(anyString(), any(com.fasterxml.jackson.core.type.TypeReference.class)))
                    .thenReturn(new java.util.ArrayList<>());
            when(objectMapper.writeValueAsString(any())).thenReturn("[]");
            when(complaintRepository.save(any(Complaint.class))).thenReturn(complaint);

            ComplaintResponse response = complaintService.addProgressUpdate(1L, update);

            assertThat(response).isNotNull();
            verify(complaintRepository).save(complaint);
        }

        @Test
        @DisplayName("Lấy khiếu nại theo ID thành công")
        void getComplaintById_success() {
            when(complaintRepository.findById(1L)).thenReturn(Optional.of(complaint));
            ComplaintResponse response = complaintService.getComplaintById(1L);
            assertThat(response.getComplaintId()).isEqualTo(1L);
        }

        @Test
        @DisplayName("Lấy danh sách theo dealer thành công")
        void getComplaintsByDealer_success() {
            when(complaintRepository.findByDealerId("DEALER-1")).thenReturn(java.util.List.of(complaint));
            java.util.List<ComplaintResponse> responses = complaintService.getComplaintsByDealer("DEALER-1");
            assertThat(responses).hasSize(1);
        }

        @Test
        @DisplayName("Lọc khiếu nại (Filter) thành công")
        void filterComplaints_success() {
            ComplaintFilterRequest filter = new ComplaintFilterRequest();
            filter.setDealerId("DEALER-1");
            filter.setPage(0);
            filter.setSize(10);
            filter.setSortBy("createdAt");
            filter.setSortDirection("DESC");

            org.springframework.data.domain.Page<Complaint> page = new org.springframework.data.domain.PageImpl<>(
                    java.util.List.of(complaint));
            when(complaintRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class),
                    any(org.springframework.data.domain.Pageable.class)))
                    .thenReturn(page);

            org.springframework.data.domain.Page<ComplaintResponse> result = complaintService.filterComplaints(filter);

            assertThat(result.getContent()).hasSize(1);
        }
    }
}
