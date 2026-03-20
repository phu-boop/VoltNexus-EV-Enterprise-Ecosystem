package com.ev.sales_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReportIssueRequest {

    @NotBlank(message = "Lý do báo cáo không được để trống.")
    private String reason;
    
}
