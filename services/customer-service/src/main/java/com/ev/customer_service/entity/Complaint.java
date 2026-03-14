package com.ev.customer_service.entity;

import com.ev.customer_service.enums.ComplaintChannel;
import com.ev.customer_service.enums.ComplaintSeverity;
import com.ev.customer_service.enums.ComplaintStatus;
import com.ev.customer_service.enums.ComplaintType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Entity quản lý phản hồi và khiếu nại của khách hàng
 * Hỗ trợ theo dõi từ lúc nhận phản hồi đến khi giải quyết xong
 */
@Entity
@Table(name = "complaints")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "complaint_id")
    private Long complaintId;

    @Column(name = "complaint_code", unique = true, length = 30)
    private String complaintCode; // Auto-generated: FB-YYYYMMDD-XXXX

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "dealer_id", nullable = false)
    private Long dealerId;

    @Column(name = "order_id")
    private Long orderId;

    @Enumerated(EnumType.STRING)
    @Column(name = "complaint_type", length = 50, nullable = false)
    private ComplaintType complaintType; // VEHICLE_QUALITY, SERVICE_ATTITUDE, SALES_PROCESS, OTHER

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", length = 20, nullable = false)
    private ComplaintSeverity severity; // LOW, MEDIUM, HIGH, CRITICAL

    @Enumerated(EnumType.STRING)
    @Column(name = "channel", length = 30)
    private ComplaintChannel channel; // IN_STORE, EMAIL, WEBSITE, PHONE, OTHER

    @Column(name = "description", columnDefinition = "TEXT", nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    private ComplaintStatus status; // NEW, IN_PROGRESS, RESOLVED, CLOSED

    // Nhân viên được gán xử lý phản hồi
    @Column(name = "assigned_staff_id", length = 36)
    private String assignedStaffId; // UUID từ User Service

    @Column(name = "assigned_staff_name", length = 200)
    private String assignedStaffName;

    // Ghi chú nội bộ từ manager khi gán task
    @Column(name = "internal_notes", columnDefinition = "TEXT")
    private String internalNotes;

    // Cập nhật tiến độ xử lý
    @Column(name = "progress_updates", columnDefinition = "TEXT")
    private String progressUpdates; // Lưu dạng JSON array các updates

    // Giải pháp xử lý nội bộ (dành cho nhân viên)
    @Column(name = "internal_resolution", columnDefinition = "TEXT")
    private String internalResolution;

    // Thông điệp gửi cho khách hàng (hiển thị trong email)
    @Column(name = "customer_message", columnDefinition = "TEXT")
    private String customerMessage;

    // DEPRECATED: Giữ lại để tương thích ngược, sẽ xóa sau
    @Column(name = "resolution", columnDefinition = "TEXT")
    private String resolution;

    @Column(name = "resolved_date")
    private LocalDateTime resolvedDate;

    // Thời gian phản hồi với khách hàng (SLA tracking)
    @Column(name = "first_response_at")
    private LocalDateTime firstResponseAt;

    // Đánh dấu đã gửi thông báo kết quả cho khách hàng
    @Column(name = "notification_sent")
    private Boolean notificationSent = false;

    @Column(name = "notification_sent_at")
    private LocalDateTime notificationSentAt;

    // Người tạo phản hồi (staff ghi nhận)
    @Column(name = "created_by_staff_id", length = 36)
    private String createdByStaffId;

    @Column(name = "created_by_staff_name", length = 200)
    private String createdByStaffName;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Helper methods
    public String getCustomerName() {
        if (customer != null) {
            return customer.getFirstName() + " " + customer.getLastName();
        }
        return "Unknown";
    }

    public String getCustomerPhone() {
        return customer != null ? customer.getPhone() : null;
    }

    public String getCustomerEmail() {
        return customer != null ? customer.getEmail() : null;
    }
}
