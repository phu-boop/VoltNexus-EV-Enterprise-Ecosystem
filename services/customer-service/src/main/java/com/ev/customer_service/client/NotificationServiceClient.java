package com.ev.customer_service.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

/**
 * Client để gửi thông báo cho nhân viên
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceClient {

    private final RestTemplate restTemplate;

    @Value("${notification.service.url}")
    private String notificationServiceUrl;

    /**
     * Gửi thông báo cho nhân viên được phân công
     */
    public void sendAssignmentNotification(String staffId, String staffEmail, String customerName,
            String customerCode) {
        try {
            Map<String, Object> notification = new HashMap<>();
            notification.put("userId", staffId);
            notification.put("email", staffEmail);
            notification.put("type", "CUSTOMER_ASSIGNMENT");
            notification.put("title", "Phân công khách hàng mới");
            notification.put("message", String.format(
                    "Bạn đã được phân công chăm sóc khách hàng: %s (Mã: %s)",
                    customerName,
                    customerCode));
            notification.put("priority", "HIGH");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(notification, headers);

            String url = notificationServiceUrl + "/send";
            log.info("Sending assignment notification to staff {}: {}", staffId, url);

            restTemplate.postForObject(url, request, String.class);
            log.info("Successfully sent assignment notification to staff {}", staffId);

        } catch (Exception e) {
            // Log lỗi nhưng không throw exception để không làm gián đoạn flow chính
            log.error("Error sending notification to staff {}: {}", staffId, e.getMessage());
        }
    }

    /**
     * Gửi thông báo khi hủy phân công nhân viên
     */
    public void sendUnassignmentNotification(String staffId, String staffEmail, String customerName,
            String customerCode) {
        try {
            Map<String, Object> notification = new HashMap<>();
            notification.put("userId", staffId);
            notification.put("email", staffEmail);
            notification.put("type", "CUSTOMER_UNASSIGNMENT");
            notification.put("title", "Hủy phân công khách hàng");
            notification.put("message", String.format(
                    "Bạn đã được hủy phân công khách hàng: %s (Mã: %s)",
                    customerName,
                    customerCode));
            notification.put("priority", "MEDIUM");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(notification, headers);

            String url = notificationServiceUrl + "/send";
            log.info("Sending unassignment notification to staff {}: {}", staffId, url);

            restTemplate.postForObject(url, request, String.class);
            log.info("Successfully sent unassignment notification to staff {}", staffId);

        } catch (Exception e) {
            log.error("Error sending unassignment notification to staff {}: {}", staffId, e.getMessage());
        }
    }
}
