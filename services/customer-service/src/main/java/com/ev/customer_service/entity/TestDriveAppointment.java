package com.ev.customer_service.entity;

import com.ev.customer_service.converter.BinaryUuidConverter;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "test_drive_appointments", indexes = {
    @Index(name = "idx_dealer_date", columnList = "dealer_id,appointment_date"),
    @Index(name = "idx_staff_date", columnList = "staff_id,appointment_date"),
    @Index(name = "idx_model_date", columnList = "model_id,appointment_date"),
    @Index(name = "idx_status", columnList = "status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestDriveAppointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "appointment_id")
    private Long appointmentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    // dealer_id stored as binary UUID in DB, mapped to String (hex representation)
    @Column(name = "dealer_id", nullable = false, columnDefinition = "BINARY(16)")
    @Convert(converter = BinaryUuidConverter.class)
    private String dealerId;

    @Column(name = "model_id", nullable = false)
    private Long modelId;

    @Column(name = "variant_id")
    private Long variantId; // Phiên bản xe cụ thể (optional)

    // Vehicle information (denormalized for email display)
    @Column(name = "vehicle_model_name", length = 100)
    private String vehicleModelName; // Tên mẫu xe: "VF 8S", "VF 9"
    
    @Column(name = "vehicle_variant_name", length = 200)
    private String vehicleVariantName; // Tên phiên bản: "Plus 4WD (Màu lỏ vãi)"

    @Column(name = "staff_id", length = 50)
    private String staffId; // UUID từ user-service
    
    @Column(name = "staff_name", length = 255)
    private String staffName; // Tên nhân viên: "Unknown (staff@email.com)"

    @Column(name = "appointment_date", nullable = false)
    private LocalDateTime appointmentDate;
    
    @Column(name = "appointment_time", length = 50)
    private String appointmentTime; // Time slot: "09:00 - 11:00"

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "test_drive_location", length = 500)
    private String testDriveLocation; // Địa điểm lái thử

    @Column(name = "status", length = 20)
    private String status; // SCHEDULED, CONFIRMED, COMPLETED, CANCELLED

    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason; // Lý do hủy

    @Column(name = "cancelled_by")
    private String cancelledBy; // Email người hủy

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "customer_notes", columnDefinition = "TEXT")
    private String customerNotes; // Ghi chú từ khách hàng

    @Column(name = "staff_notes", columnDefinition = "TEXT")
    private String staffNotes; // Ghi chú từ nhân viên

    @Column(name = "notification_sent")
    private Boolean notificationSent = false; // Đã gửi thông báo chưa

    @Column(name = "reminder_sent")
    private Boolean reminderSent = false; // Đã gửi nhắc nhở chưa

    // Confirmation tracking fields
    @Column(name = "confirmation_token", length = 255)
    private String confirmationToken; // Token để xác nhận qua email

    @Column(name = "confirmation_sent_at")
    private LocalDateTime confirmationSentAt; // Thời gian gửi email xác nhận

    @Column(name = "confirmation_expires_at")
    private LocalDateTime confirmationExpiresAt; // Hết hạn xác nhận (3 ngày sau khi gửi)

    @Column(name = "first_reminder_sent_at")
    private LocalDateTime firstReminderSentAt; // Thời gian gửi reminder lần 1

    @Column(name = "second_reminder_sent_at")
    private LocalDateTime secondReminderSentAt; // Thời gian gửi reminder lần 2

    @Column(name = "is_confirmed")
    private Boolean isConfirmed = false; // Khách hàng đã xác nhận chưa

    @Column(name = "feedback_rating")
    private Integer feedbackRating; // 1-5

    @Column(name = "feedback_comment", columnDefinition = "TEXT")
    private String feedbackComment;

    @Column(name = "created_by")
    private String createdBy; // Email người tạo

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_by")
    private String updatedBy; // Email người cập nhật

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Tính toán thời gian kết thúc dựa trên appointment_date và duration_minutes
     */
    public LocalDateTime getEndTime() {
        if (appointmentDate != null && durationMinutes != null) {
            return appointmentDate.plusMinutes(durationMinutes);
        }
        return null;
    }

    /**
     * Kiểm tra xem lịch hẹn có đang active không (chưa hủy, chưa hoàn thành)
     */
    public boolean isActive() {
        return !"CANCELLED".equals(status) && !"COMPLETED".equals(status);
    }
}
