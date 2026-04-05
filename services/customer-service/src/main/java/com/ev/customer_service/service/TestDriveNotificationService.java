package com.ev.customer_service.service;

import com.ev.customer_service.dto.NotificationRequest;
import com.ev.customer_service.entity.TestDriveAppointment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.format.DateTimeFormatter;

/**
 * Service để gửi thông báo (Email/SMS) cho khách hàng và nhân viên
 * 
 * Trong thực tế, bạn có thể tích hợp:
 * - Email: SendGrid, AWS SES, hoặc SMTP server
 * - SMS: Twilio, AWS SNS
 * - Push Notification: Firebase Cloud Messaging (FCM)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TestDriveNotificationService {

    private final RestTemplate restTemplate;

    @Value("${notification.service.url:http://payment-service:8085/api/notifications}")
    private String notificationServiceUrl;

    @Value("${notification.enabled:true}")
    private boolean notificationEnabled;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final String NOTIF_TYPE_EMAIL = "EMAIL";
    private static final String NOTIF_TYPE_SMS = "SMS";
    private static final String MSG_SALUTATION = "Kính gửi %s,\n\n";
    private static final String MSG_CLOSING = "\n\nTrân trọng,\nEV Dealer Management System";

    /**
     * Gửi thông báo xác nhận lịch hẹn cho khách hàng
     */
    public void sendAppointmentConfirmation(TestDriveAppointment appointment, String customerEmail,
            String customerPhone, String customerName) {
        if (!notificationEnabled) {
            log.info("Notification is disabled");
            return;
        }

        try {
            String message = buildConfirmationMessage(appointment, customerName);

            NotificationRequest emailNotification = NotificationRequest.builder()
                    .recipientEmail(customerEmail)
                    .recipientName(customerName)
                    .subject("Xác nhận lịch hẹn lái thử xe")
                    .message(message)
                    .notificationType(NOTIF_TYPE_EMAIL)
                    .templateName("TEST_DRIVE_CONFIRMATION")
                    .build();

            sendNotification(emailNotification);

            // Gửi SMS nếu có số điện thoại
            if (customerPhone != null && !customerPhone.isEmpty()) {
                NotificationRequest smsNotification = NotificationRequest.builder()
                        .recipientPhone(customerPhone)
                        .recipientName(customerName)
                        .message(buildSMSConfirmationMessage(appointment))
                        .notificationType(NOTIF_TYPE_SMS)
                        .build();

                sendNotification(smsNotification);
            }

            log.info("Sent confirmation notification for appointment ID: {}", appointment.getAppointmentId());
        } catch (Exception e) {
            log.error("Failed to send confirmation notification for appointment ID: {}",
                    appointment.getAppointmentId(), e);
        }
    }

    /**
     * Gửi thông báo cập nhật lịch hẹn
     */
    public void sendAppointmentUpdate(TestDriveAppointment appointment, String customerEmail,
            String customerPhone, String customerName) {
        if (!notificationEnabled) {
            return;
        }

        try {
            String message = buildUpdateMessage(appointment, customerName);

            NotificationRequest notification = NotificationRequest.builder()
                    .recipientEmail(customerEmail)
                    .recipientName(customerName)
                    .subject("Cập nhật lịch hẹn lái thử xe")
                    .message(message)
                    .notificationType(NOTIF_TYPE_EMAIL)
                    .templateName("TEST_DRIVE_UPDATE")
                    .build();

            sendNotification(notification);

            log.info("Sent update notification for appointment ID: {}", appointment.getAppointmentId());
        } catch (Exception e) {
            log.error("Failed to send update notification", e);
        }
    }

    /**
     * Gửi thông báo hủy lịch hẹn
     */
    public void sendAppointmentCancellation(TestDriveAppointment appointment, String customerEmail,
            String customerPhone, String customerName) {
        if (!notificationEnabled) {
            return;
        }

        try {
            String message = buildCancellationMessage(appointment, customerName);

            NotificationRequest notification = NotificationRequest.builder()
                    .recipientEmail(customerEmail)
                    .recipientName(customerName)
                    .subject("Hủy lịch hẹn lái thử xe")
                    .message(message)
                    .notificationType(NOTIF_TYPE_EMAIL)
                    .templateName("TEST_DRIVE_CANCELLATION")
                    .build();

            sendNotification(notification);

            log.info("Sent cancellation notification for appointment ID: {}", appointment.getAppointmentId());
        } catch (Exception e) {
            log.error("Failed to send cancellation notification", e);
        }
    }

    /**
     * Gửi nhắc nhở trước 24h
     */
    public void sendAppointmentReminder(TestDriveAppointment appointment, String customerEmail,
            String customerPhone, String customerName) {
        if (!notificationEnabled) {
            return;
        }

        try {
            String message = buildReminderMessage(appointment, customerName);

            NotificationRequest notification = NotificationRequest.builder()
                    .recipientEmail(customerEmail)
                    .recipientName(customerName)
                    .subject("Nhắc nhở lịch hẹn lái thử xe")
                    .message(message)
                    .notificationType(NOTIF_TYPE_EMAIL)
                    .templateName("TEST_DRIVE_REMINDER")
                    .build();

            sendNotification(notification);

            log.info("Sent reminder notification for appointment ID: {}", appointment.getAppointmentId());
        } catch (Exception e) {
            log.error("Failed to send reminder notification", e);
        }
    }

    /**
     * Gửi thông báo cho nhân viên khi có lịch hẹn mới
     */
    public void sendStaffNotification(TestDriveAppointment appointment, String staffEmail, String staffName) {
        if (!notificationEnabled) {
            return;
        }

        try {
            String message = buildStaffNotificationMessage(appointment, staffName);

            NotificationRequest notification = NotificationRequest.builder()
                    .recipientEmail(staffEmail)
                    .recipientName(staffName)
                    .subject("Lịch hẹn lái thử xe mới")
                    .message(message)
                    .notificationType(NOTIF_TYPE_EMAIL)
                    .templateName("STAFF_APPOINTMENT_NOTIFICATION")
                    .build();

            sendNotification(notification);

            log.info("Sent staff notification for appointment ID: {}", appointment.getAppointmentId());
        } catch (Exception e) {
            log.error("Failed to send staff notification", e);
        }
    }

    /**
     * Gửi notification thực tế (gọi API hoặc service khác)
     */
    private void sendNotification(NotificationRequest notification) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<NotificationRequest> request = new HttpEntity<>(notification, headers);

            // Trong thực tế, gọi đến notification service hoặc third-party API
            // restTemplate.postForObject(notificationServiceUrl, request, String.class);

            // Mock: chỉ log ra console
            log.info("Sending {} notification to: {}",
                    notification.getNotificationType(),
                    notification.getRecipientEmail() != null ? notification.getRecipientEmail()
                            : notification.getRecipientPhone());
            log.info("Subject: {}", notification.getSubject());
            log.info("Message: {}", notification.getMessage());

        } catch (Exception e) {
            log.error("Error sending notification", e);
        }
    }

    // ==================== Message Builders ====================

    private String buildConfirmationMessage(TestDriveAppointment appointment, String customerName) {
        return String.format(
                MSG_SALUTATION +
                        "Lịch hẹn lái thử xe của bạn đã được xác nhận:\n\n" +
                        "📅 Thời gian: %s\n" +
                        "⏱️ Thời lượng: %d phút\n" +
                        "📍 Địa điểm: %s\n" +
                        "🚗 Mẫu xe: Model ID %d\n" +
                        "👤 Nhân viên phụ trách: Staff ID %s\n\n" +
                        "Vui lòng đến đúng giờ. Nếu có thay đổi, vui lòng liên hệ với chúng tôi." +
                        MSG_CLOSING,
                customerName,
                appointment.getAppointmentDate().format(DATE_FORMATTER),
                appointment.getDurationMinutes(),
                appointment.getTestDriveLocation(),
                appointment.getModelId(),
                appointment.getStaffId());
    }

    private String buildSMSConfirmationMessage(TestDriveAppointment appointment) {
        return String.format(
                "EVDMS: Lịch hẹn lái thử xe đã xác nhận. Thời gian: %s. Địa điểm: %s",
                appointment.getAppointmentDate().format(DATE_FORMATTER),
                appointment.getTestDriveLocation());
    }

    private String buildUpdateMessage(TestDriveAppointment appointment, String customerName) {
        return String.format(
                MSG_SALUTATION +
                        "Lịch hẹn lái thử xe của bạn đã được CẬP NHẬT:\n\n" +
                        "📅 Thời gian mới: %s\n" +
                        "📍 Địa điểm: %s\n\n" +
                        "Vui lòng kiểm tra lại thông tin." +
                        MSG_CLOSING,
                customerName,
                appointment.getAppointmentDate().format(DATE_FORMATTER),
                appointment.getTestDriveLocation());
    }

    private String buildCancellationMessage(TestDriveAppointment appointment, String customerName) {
        return String.format(
                MSG_SALUTATION +
                        "Lịch hẹn lái thử xe của bạn đã bị HỦY:\n\n" +
                        "📅 Thời gian: %s\n" +
                        "❌ Lý do: %s\n\n" +
                        "Nếu bạn muốn đặt lịch mới, vui lòng liên hệ với chúng tôi." +
                        MSG_CLOSING,
                customerName,
                appointment.getAppointmentDate().format(DATE_FORMATTER),
                appointment.getCancellationReason());
    }

    private String buildReminderMessage(TestDriveAppointment appointment, String customerName) {
        return String.format(
                MSG_SALUTATION +
                        "Nhắc nhở: Bạn có lịch hẹn lái thử xe vào NGÀY MAI:\n\n" +
                        "📅 Thời gian: %s\n" +
                        "📍 Địa điểm: %s\n\n" +
                        "Vui lòng đến đúng giờ." +
                        MSG_CLOSING,
                customerName,
                appointment.getAppointmentDate().format(DATE_FORMATTER),
                appointment.getTestDriveLocation());
    }

    private String buildStaffNotificationMessage(TestDriveAppointment appointment, String staffName) {
        return String.format(
                MSG_SALUTATION +
                        "Bạn được phân công phụ trách lịch hẹn lái thử xe:\n\n" +
                        "📅 Thời gian: %s\n" +
                        "📍 Địa điểm: %s\n" +
                        "👤 Khách hàng: Customer ID %d\n" +
                        "🚗 Mẫu xe: Model ID %d\n\n" +
                        "Vui lòng chuẩn bị và liên hệ khách hàng trước buổi lái thử." +
                        MSG_CLOSING,
                staffName,
                appointment.getAppointmentDate().format(DATE_FORMATTER),
                appointment.getTestDriveLocation(),
                appointment.getCustomer().getCustomerId(),
                appointment.getModelId());
    }
}
