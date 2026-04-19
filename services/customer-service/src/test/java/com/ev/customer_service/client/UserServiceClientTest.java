package com.ev.customer_service.client;

import com.ev.customer_service.dto.response.StaffDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceClientTest {

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private UserServiceClient userServiceClient;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(userServiceClient, "userServiceUrl", "http://user-service/api/v1/users");
    }

    @Test
    @DisplayName("Lấy thông tin nhân viên theo ID thành công")
    void getStaffById_success() {
        Map<String, Object> userData = Map.of(
                "id", "STAFF-1",
                "email", "staff1@ev.com",
                "name", "staff1",
                "fullName", "Staff One",
                "phone", "0123456789",
                "address", "Address 1",
                "status", "ACTIVE");
        Map<String, Object> responseBody = Map.of("data", userData);

        when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), isNull(), any(ParameterizedTypeReference.class)))
                .thenReturn(ResponseEntity.of(java.util.Optional.of(responseBody)));

        StaffDTO result = userServiceClient.getStaffById("STAFF-1");

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo("STAFF-1");
        assertThat(result.getFullName()).isEqualTo("Staff One");
    }

    @Test
    @DisplayName("Lấy thông tin nhân viên → Response không hợp lệ")
    void getStaffById_invalidResponse() {
        Map<String, Object> responseBody = Map.of("message", "error");

        when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), isNull(), any(ParameterizedTypeReference.class)))
                .thenReturn(ResponseEntity.of(java.util.Optional.of(responseBody)));

        StaffDTO result = userServiceClient.getStaffById("STAFF-1");

        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Lấy tất cả nhân viên thành công")
    void getAllStaff_success() {
        List<Map<String, Object>> userList = List.of(
                Map.of("id", "S1", "fullName", "Staff 1"),
                Map.of("id", "S2", "fullName", "Staff 2"));
        Map<String, Object> responseBody = Map.of("data", userList);

        when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), isNull(), any(ParameterizedTypeReference.class)))
                .thenReturn(ResponseEntity.of(java.util.Optional.of(responseBody)));

        List<StaffDTO> result = userServiceClient.getAllStaff();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getId()).isEqualTo("S1");
    }

    @Test
    @DisplayName("Lỗi khi gọi User Service → ném RuntimeException")
    void getAllStaff_error() {
        when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), isNull(), any(ParameterizedTypeReference.class)))
                .thenThrow(new RuntimeException("Connection timeout"));

        assertThatThrownBy(() -> userServiceClient.getAllStaff())
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Unable to fetch staff list");
    }

    @Test
    @DisplayName("Kiểm tra nhân viên active → true")
    void isStaffActive_true() {
        Map<String, Object> userData = Map.of("id", "S1", "status", "ACTIVE");
        Map<String, Object> responseBody = Map.of("data", userData);

        when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), isNull(), any(ParameterizedTypeReference.class)))
                .thenReturn(ResponseEntity.of(java.util.Optional.of(responseBody)));

        boolean result = userServiceClient.isStaffActive("S1");

        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("Kiểm tra nhân viên inactive → false")
    void isStaffActive_false() {
        Map<String, Object> userData = Map.of("id", "S1", "status", "INACTIVE");
        Map<String, Object> responseBody = Map.of("data", userData);

        when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), isNull(), any(ParameterizedTypeReference.class)))
                .thenReturn(ResponseEntity.of(java.util.Optional.of(responseBody)));

        boolean result = userServiceClient.isStaffActive("S1");

        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("Kiểm tra nhân viên → lỗi kết nối → false")
    void isStaffActive_error_false() {
        when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), isNull(), any(ParameterizedTypeReference.class)))
                .thenThrow(new RuntimeException("API Down"));

        boolean result = userServiceClient.isStaffActive("S1");

        assertThat(result).isFalse();
    }
}
