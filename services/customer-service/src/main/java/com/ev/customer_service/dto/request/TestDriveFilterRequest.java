package com.ev.customer_service.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO để filter lịch hẹn lái thử theo nhiều tiêu chí
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class TestDriveFilterRequest {

    private String dealerId; // Binary UUID as hex string
    
    private Long customerId;
    
    private Long modelId;
    
    private Long variantId;
    
    private String staffId; // UUID
    
    private List<String> statuses; // SCHEDULED, CONFIRMED, COMPLETED, CANCELLED
    
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private LocalDateTime startDate;
    
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private LocalDateTime endDate;
    
    private String customerName; // Tìm theo tên khách hàng
    
    private String location; // Tìm theo địa điểm
}
