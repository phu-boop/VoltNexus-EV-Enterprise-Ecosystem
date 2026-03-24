package com.ev.customer_service.service;

import com.ev.customer_service.dto.request.*;
import com.ev.customer_service.dto.response.ComplaintResponse;
import com.ev.customer_service.entity.Complaint;
import com.ev.customer_service.entity.Customer;
import com.ev.customer_service.enums.ComplaintSeverity;
import com.ev.customer_service.enums.ComplaintStatus;
import com.ev.customer_service.enums.ComplaintType;
import com.ev.customer_service.exception.ResourceNotFoundException;
import com.ev.customer_service.repository.ComplaintRepository;
import com.ev.customer_service.repository.CustomerRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.mail.javamail.JavaMailSender;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ComplaintServiceTest {

    @Mock
    private ComplaintRepository complaintRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private JavaMailSender mailSender;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private ComplaintService complaintService;

    private Customer customer;
    private Complaint complaint;

    @BeforeEach
    void setUp() {
        objectMapper.registerModule(new JavaTimeModule());

        customer = new Customer();
        customer.setCustomerId(1L);
        customer.setFirstName("John");
        customer.setLastName("Doe");
        customer.setEmail("john.doe@example.com");

        complaint = new Complaint();
        complaint.setComplaintId(1L);
        complaint.setComplaintCode("FB-20231027-0001");
        complaint.setCustomer(customer);
        complaint.setStatus(ComplaintStatus.NEW);
        complaint.setComplaintType(ComplaintType.VEHICLE_QUALITY);
        complaint.setSeverity(ComplaintSeverity.MEDIUM);
        complaint.setCreatedAt(LocalDateTime.now());
    }

    @Nested
    @DisplayName("createComplaint()")
    class CreateComplaint {
        @Test
        @DisplayName("Tạo khiếu nại thành công")
        void createComplaint_success() {
            CreateComplaintRequest request = new CreateComplaintRequest();
            request.setCustomerId(1L);
            request.setDealerId("DEALER1");
            request.setComplaintType(ComplaintType.SERVICE_ATTITUDE);
            request.setSeverity(ComplaintSeverity.HIGH);

            when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
            when(complaintRepository.save(any(Complaint.class))).thenReturn(complaint);

            ComplaintResponse result = complaintService.createComplaint(request);

            assertThat(result).isNotNull();
            assertThat(result.getComplaintCode()).isEqualTo("FB-20231027-0001");
            verify(complaintRepository).save(any(Complaint.class));
        }

        @Test
        @DisplayName("Customer không tồn tại -> ném ResourceNotFoundException")
        void createComplaint_customerNotFound() {
            CreateComplaintRequest request = new CreateComplaintRequest();
            request.setCustomerId(99L);
            when(customerRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> complaintService.createComplaint(request))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("assignComplaint()")
    class AssignComplaint {
        @Test
        @DisplayName("Phân công thành công")
        void assignComplaint_success() {
            AssignComplaintRequest request = new AssignComplaintRequest();
            request.setAssignedStaffId("STAFF1");
            request.setAssignedStaffName("Staff A");

            when(complaintRepository.findById(1L)).thenReturn(Optional.of(complaint));
            when(complaintRepository.save(any(Complaint.class))).thenReturn(complaint);

            complaintService.assignComplaint(1L, request);

            assertThat(complaint.getAssignedStaffId()).isEqualTo("STAFF1");
            assertThat(complaint.getStatus()).isEqualTo(ComplaintStatus.IN_PROGRESS);
            assertThat(complaint.getFirstResponseAt()).isNotNull();
            verify(complaintRepository).save(complaint);
        }
    }

    @Nested
    @DisplayName("addProgressUpdate()")
    class AddProgressUpdate {
        @Test
        @DisplayName("Thêm cập nhật tiến độ thành công")
        void addProgressUpdate_success() throws JsonProcessingException {
            ComplaintProgressUpdate update = new ComplaintProgressUpdate();
            update.setUpdateNote("Investigating issue");
            update.setUpdatedByStaffId("STAFF1");

            when(complaintRepository.findById(1L)).thenReturn(Optional.of(complaint));
            when(complaintRepository.save(any(Complaint.class))).thenReturn(complaint);

            complaintService.addProgressUpdate(1L, update);

            assertThat(complaint.getProgressUpdates()).contains("Investigating issue");
            verify(complaintRepository).save(complaint);
        }

        @Test
        @DisplayName("Lỗi parse JSON khi lấy progress cũ -> trả về list trống và vẫn add mới được")
        void addProgressUpdate_jsonError_startsFresh() {
            complaint.setProgressUpdates("invalid-json");
            ComplaintProgressUpdate update = new ComplaintProgressUpdate();
            update.setUpdateNote("Note");

            when(complaintRepository.findById(1L)).thenReturn(Optional.of(complaint));
            when(complaintRepository.save(any(Complaint.class))).thenReturn(complaint);

            complaintService.addProgressUpdate(1L, update);

            assertThat(complaint.getProgressUpdates()).contains("Note");
        }
    }

    @Nested
    @DisplayName("resolveComplaint()")
    class ResolveComplaint {
        @Test
        @DisplayName("Giải quyết thành công kèm gửi email")
        void resolveComplaint_withNotification_success() {
            ResolveComplaintRequest request = new ResolveComplaintRequest();
            request.setInternalResolution("Fixed software bug");
            request.setCustomerMessage("Your issue is fixed");
            request.setSendNotification(true);

            when(complaintRepository.findById(1L)).thenReturn(Optional.of(complaint));
            when(complaintRepository.save(any(Complaint.class))).thenReturn(complaint);
            when(mailSender.createMimeMessage()).thenReturn(mock(MimeMessage.class));

            complaintService.resolveComplaint(1L, request);

            assertThat(complaint.getStatus()).isEqualTo(ComplaintStatus.RESOLVED);
            assertThat(complaint.getResolvedDate()).isNotNull();
            verify(mailSender).send(any(MimeMessage.class));
            verify(complaintRepository, times(2)).save(complaint); // save in resolve + save in notification update
        }
    }

    @Nested
    @DisplayName("closeComplaint()")
    class CloseComplaint {
        @Test
        @DisplayName("Đóng thành công khi đã RESOLVED")
        void closeComplaint_success() {
            complaint.setStatus(ComplaintStatus.RESOLVED);
            when(complaintRepository.findById(1L)).thenReturn(Optional.of(complaint));
            when(complaintRepository.save(any(Complaint.class))).thenReturn(complaint);

            complaintService.closeComplaint(1L);

            assertThat(complaint.getStatus()).isEqualTo(ComplaintStatus.CLOSED);
        }

        @Test
        @DisplayName("Đóng khi chưa RESOLVED -> ném IllegalStateException")
        void closeComplaint_notResolved_throwsException() {
            complaint.setStatus(ComplaintStatus.IN_PROGRESS);
            when(complaintRepository.findById(1L)).thenReturn(Optional.of(complaint));

            assertThatThrownBy(() -> complaintService.closeComplaint(1L))
                    .isInstanceOf(IllegalStateException.class);
        }
    }

    @Nested
    @DisplayName("Statistics and Filtering")
    class StatisticsAndFiltering {
        @Test
        @DisplayName("Lọc khiếu nại thành công")
        void filterComplaints_success() {
            ComplaintFilterRequest filter = new ComplaintFilterRequest();
            filter.setPage(0);
            filter.setSize(10);
            filter.setSortBy("createdAt");
            filter.setSortDirection("DESC");

            Page<Complaint> page = new PageImpl<>(List.of(complaint));
            when(complaintRepository.findAll(any(Specification.class), any(PageRequest.class)))
                    .thenReturn(page);

            var result = complaintService.filterComplaints(filter);

            assertThat(result.getContent()).hasSize(1);
        }

        @Test
        @DisplayName("Lấy thống kê thành công")
        void getStatistics_success() {
            LocalDateTime start = LocalDateTime.now().minusDays(30);
            LocalDateTime end = LocalDateTime.now();
            String dealerId = "DEALER1";

            when(complaintRepository.countByDealerIdAndDateRange(eq(dealerId), any(), any())).thenReturn(10L);
            when(complaintRepository.countByDealerIdAndStatusAndDateRange(anyString(), any(), any(), any()))
                    .thenReturn(2L);
            when(complaintRepository.countByDealerIdAndSeverityAndDateRange(anyString(), any(), any(), any()))
                    .thenReturn(1L);
            List<Object[]> typeStats = new ArrayList<>();
            typeStats.add(new Object[] { "VEHICLE_QUALITY", 5L });
            when(complaintRepository.countByComplaintTypeAndDateRange(anyString(), any(), any())).thenReturn(typeStats);

            List<Object[]> staffStats = new ArrayList<>();
            staffStats.add(new Object[] { "STAFF1", 3L });
            when(complaintRepository.countByAssignedStaffAndDateRange(anyString(), any(), any()))
                    .thenReturn(staffStats);
            when(complaintRepository.countOverdueComplaintsWithDateRange(anyString(), any(), any(), any(), any()))
                    .thenReturn(1L);

            var stats = complaintService.getStatistics(dealerId, start, end);

            assertThat(stats.getTotalComplaints()).isEqualTo(10L);
            assertThat(stats.getByType()).containsKey("VEHICLE_QUALITY");
            assertThat(stats.getByStaff()).containsKey("STAFF1");
        }
    }

    @Test
    @DisplayName("Gửi notification thủ công thành công")
    void sendNotificationToCustomer_manual_success() {
        complaint.setCustomerMessage("Ready");
        when(complaintRepository.findById(1L)).thenReturn(Optional.of(complaint));
        when(mailSender.createMimeMessage()).thenReturn(mock(MimeMessage.class));

        complaintService.sendNotificationToCustomer(1L);

        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("Gửi notification thủ công khi chưa có message -> ném IllegalStateException")
    void sendNotificationToCustomer_noMessage_throwsException() {
        complaint.setCustomerMessage(null);
        complaint.setResolution(null);
        when(complaintRepository.findById(1L)).thenReturn(Optional.of(complaint));

        assertThatThrownBy(() -> complaintService.sendNotificationToCustomer(1L))
                .isInstanceOf(IllegalStateException.class);
    }
}
