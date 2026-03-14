package com.ev.customer_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO để gửi thông báo
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationRequest {

    private String recipientEmail;
    private String recipientPhone;
    private String recipientName;
    private String subject;
    private String message;
    private String notificationType; // EMAIL, SMS, PUSH
    private String templateName; // Template notification
}
