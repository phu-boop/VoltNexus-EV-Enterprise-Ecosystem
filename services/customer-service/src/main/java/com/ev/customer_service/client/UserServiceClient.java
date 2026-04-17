package com.ev.customer_service.client;

import com.ev.customer_service.dto.response.StaffDTO;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Client để gọi API từ User Service
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceClient {

    private final RestTemplate restTemplate;

    @Value("${user.service.url}")
    private String userServiceUrl;

    private static final String KEY_DATA = "data";
    private static final String KEY_ID = "id";
    private static final String KEY_EMAIL = "email";
    private static final String KEY_NAME = "name";
    private static final String KEY_FULL_NAME = "fullName";
    private static final String KEY_PHONE = "phone";
    private static final String KEY_ADDRESS = "address";
    private static final String KEY_STATUS = "status";
    private static final String DEFAULT_STATUS = "INACTIVE";

    /**
     * Lấy thông tin nhân viên theo UUID
     * Endpoint: GET /users/{uuid}
     * Response: ApiRespond<UserRespond>
     */
    public StaffDTO getStaffById(String staffId) {
        String baseUrl = userServiceUrl.endsWith("/") ? userServiceUrl.substring(0, userServiceUrl.length() - 1) : userServiceUrl;
        String[] candidateUrls = baseUrl.contains("/users")
                ? new String[] {
                baseUrl + "/internal/staff/" + staffId,
                        baseUrl + "/internal/" + staffId,
                        baseUrl + "/" + staffId
                }
                : new String[] {
                baseUrl + "/users/internal/staff/" + staffId,
                        baseUrl + "/users/internal/" + staffId,
                        baseUrl + "/users/" + staffId
                };

        Exception lastException = null;

        for (String url : candidateUrls) {
            try {
                log.info("Calling User Service to get staff info: {}", url);

                ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                        url,
                        HttpMethod.GET,
                        null,
                        new ParameterizedTypeReference<Map<String, Object>>() {
                        });

                Map<String, Object> body = response.getBody();
                if (body == null || !body.containsKey(KEY_DATA)) {
                    log.warn("Invalid response from User Service for {}: {}", url, body);
                    continue;
                }

                Map<String, Object> userData = (Map<String, Object>) body.get(KEY_DATA);
                StaffDTO staff = mapToStaffDTO(userData);

                log.info("Successfully fetched staff: {}", staff.getFullName());
                return staff;
            } catch (Exception e) {
                lastException = e;
                log.warn("Error calling User Service URL {} for staffId {}: {}", url, staffId, e.getMessage());
            }
        }

        throw new RuntimeException("Unable to fetch staff information from User Service", lastException);
    }

    /**
     * Lấy danh sách tất cả nhân viên
     * Endpoint: GET /users
     */
    public List<StaffDTO> getAllStaff() {
        try {
            String url = userServiceUrl;
            log.info("Calling User Service to get all staff: {}", url);

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<Map<String, Object>>() {
                    });

            Map<String, Object> body = response.getBody();
            if (body == null || !body.containsKey(KEY_DATA)) {
                return new ArrayList<>();
            }

            List<Map<String, Object>> userList = (List<Map<String, Object>>) body.get(KEY_DATA);

            return userList.stream()
                    .map(this::mapToStaffDTO)
                    .toList();
        } catch (Exception e) {
            log.error("Error calling User Service to get all staff: {}", e.getMessage());
            throw new RuntimeException("Unable to fetch staff list from User Service", e);
        }
    }

    private StaffDTO mapToStaffDTO(Map<String, Object> userData) {
        StaffDTO staff = new StaffDTO();
        staff.setId(getStringValue(userData, KEY_ID));
        staff.setEmail(getStringValue(userData, KEY_EMAIL));
        staff.setName(getStringValue(userData, KEY_NAME));
        staff.setFullName(getStringValue(userData, KEY_FULL_NAME));
        staff.setPhone(getStringValue(userData, KEY_PHONE));
        staff.setAddress(getStringValue(userData, KEY_ADDRESS));
        staff.setStatus(userData.get(KEY_STATUS) != null ? userData.get(KEY_STATUS).toString() : DEFAULT_STATUS);
        return staff;
    }

    private String getStringValue(Map<String, Object> data, String key) {
        return data.get(key) != null ? data.get(key).toString() : null;
    }

    /**
     * Kiểm tra xem nhân viên có tồn tại và đang hoạt động không
     */
    public boolean isStaffActive(String staffId) {
        StaffDTO staff = getStaffById(staffId);
        if (staff == null) {
            throw new IllegalArgumentException("Staff not found");
        }
        return Boolean.TRUE.equals(staff.getActive());
    }
}
