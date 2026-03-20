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

    /**
     * Lấy thông tin nhân viên theo UUID
     * Endpoint: GET /users/{uuid}
     * Response: ApiRespond<UserRespond>
     */
    public StaffDTO getStaffById(String staffId) {
        try {
            String url = userServiceUrl + "/" + staffId;
            log.info("Calling User Service to get staff info: {}", url);

            // User Service trả về ApiRespond<UserRespond>
            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    Map.class);

            Map<String, Object> body = response.getBody();
            if (body == null || !body.containsKey("data")) {
                log.error("Invalid response from User Service: {}", body);
                return null;
            }

            // Extract data từ ApiRespond wrapper
            Map<String, Object> userData = (Map<String, Object>) body.get("data");

            // Map UserRespond to StaffDTO
            StaffDTO staff = new StaffDTO();
            staff.setId(userData.get("id") != null ? userData.get("id").toString() : null);
            staff.setEmail(userData.get("email") != null ? userData.get("email").toString() : null);
            staff.setName(userData.get("name") != null ? userData.get("name").toString() : null);
            staff.setFullName(userData.get("fullName") != null ? userData.get("fullName").toString() : null);
            staff.setPhone(userData.get("phone") != null ? userData.get("phone").toString() : null);
            staff.setAddress(userData.get("address") != null ? userData.get("address").toString() : null);
            staff.setStatus(userData.get("status") != null ? userData.get("status").toString() : "INACTIVE");

            log.info("Successfully fetched staff: {}", staff.getFullName());
            return staff;

        } catch (Exception e) {
            log.error("Error calling User Service for staffId {}: {}", staffId, e.getMessage(), e);
            throw new RuntimeException("Unable to fetch staff information from User Service: " + e.getMessage(), e);
        }
    }

    /**
     * Lấy danh sách tất cả nhân viên
     * Endpoint: GET /users
     */
    public List<StaffDTO> getAllStaff() {
        try {
            String url = userServiceUrl;
            log.info("Calling User Service to get all staff: {}", url);

            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    Map.class);

            Map<String, Object> body = response.getBody();
            if (body == null || !body.containsKey("data")) {
                return new ArrayList<>();
            }

            List<Map<String, Object>> userList = (List<Map<String, Object>>) body.get("data");
            List<StaffDTO> staffList = new ArrayList<>();

            for (Map<String, Object> userData : userList) {
                StaffDTO staff = new StaffDTO();
                staff.setId(userData.get("id") != null ? userData.get("id").toString() : null);
                staff.setEmail(userData.get("email") != null ? userData.get("email").toString() : null);
                staff.setName(userData.get("name") != null ? userData.get("name").toString() : null);
                staff.setFullName(userData.get("fullName") != null ? userData.get("fullName").toString() : null);
                staff.setPhone(userData.get("phone") != null ? userData.get("phone").toString() : null);
                staff.setAddress(userData.get("address") != null ? userData.get("address").toString() : null);
                staff.setStatus(userData.get("status") != null ? userData.get("status").toString() : "INACTIVE");
                staffList.add(staff);
            }

            return staffList;
        } catch (Exception e) {
            log.error("Error calling User Service to get all staff: {}", e.getMessage());
            throw new RuntimeException("Unable to fetch staff list from User Service", e);
        }
    }

    /**
     * Kiểm tra xem nhân viên có tồn tại và đang hoạt động không
     */
    public boolean isStaffActive(String staffId) {
        try {
            StaffDTO staff = getStaffById(staffId);
            return staff != null && Boolean.TRUE.equals(staff.getActive());
        } catch (Exception e) {
            log.error("Error checking staff status for staffId {}: {}", staffId, e.getMessage());
            return false;
        }
    }
}
