package com.ev.sales_service.dto.response;

import com.ev.sales_service.enums.NotificationAudience;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {
    private String id; 
    private String type;
    private String message;
    private String link;
    private NotificationAudience audience;
    private boolean unread; 
    private String time;    

    @com.fasterxml.jackson.annotation.JsonIgnore
    private LocalDateTime createdAt;
}
