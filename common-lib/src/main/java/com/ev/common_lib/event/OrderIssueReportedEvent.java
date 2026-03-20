package com.ev.common_lib.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderIssueReportedEvent {
    private UUID orderId;
    private UUID dealerId;
    private String reportedByEmail; // Email của người báo cáo
    private String reason;          // Lý do báo cáo
    private String description;     // Mô tả
    private LocalDateTime reportedAt;     // Thời điểm báo cáo
}
