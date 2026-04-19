package com.ev.customer_service.client;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;

class NotificationServiceClientTest {

    private NotificationServiceClient client;
    private MockRestServiceServer server;
    private RestTemplate restTemplate;

    @BeforeEach
    void setUp() {
        restTemplate = new RestTemplate();
        server = MockRestServiceServer.createServer(restTemplate);
        client = new NotificationServiceClient(restTemplate);
        ReflectionTestUtils.setField(client, "notificationServiceUrl", "http://notification-service");
    }

    @Test
    @DisplayName("Gửi thông báo phân công thành công")
    void sendAssignmentNotification_success() {
        server.expect(requestTo("http://notification-service/send"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess("OK", MediaType.TEXT_PLAIN));

        client.sendAssignmentNotification("staff-1", "staff@example.com", "John Doe", "FB-001");

        server.verify();
    }

    @Test
    @DisplayName("Gửi thông báo phân công thất bại (lỗi server) -> catch exception")
    void sendAssignmentNotification_error_catchesException() {
        server.expect(requestTo("http://notification-service/send"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withServerError());

        client.sendAssignmentNotification("staff-1", "staff@example.com", "John Doe", "FB-001");

        server.verify();
    }

    @Test
    @DisplayName("Gửi thông báo hủy phân công thành công")
    void sendUnassignmentNotification_success() {
        server.expect(requestTo("http://notification-service/send"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess("OK", MediaType.TEXT_PLAIN));

        client.sendUnassignmentNotification("staff-1", "staff@example.com", "John Doe", "FB-001");

        server.verify();
    }

    @Test
    @DisplayName("Gửi thông báo hủy phân công thất bại -> catch exception")
    void sendUnassignmentNotification_error_catchesException() {
        server.expect(requestTo("http://notification-service/send"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withServerError());

        client.sendUnassignmentNotification("staff-1", "staff@example.com", "John Doe", "FB-001");

        server.verify();
    }
}
