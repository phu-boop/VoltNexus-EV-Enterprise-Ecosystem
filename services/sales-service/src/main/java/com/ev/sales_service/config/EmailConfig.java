package com.ev.sales_service.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "app.urls")
public class EmailConfig {
    private String baseUrl;
    private String frontendUrl;
    private String orderConfirmPath = "/sendmail/customer-response/order/{orderId}/confirm";
    private String quotationAcceptPath = "/sendmail/customer-response/quotation/{quotationId}/accept";
    private String quotationRejectPath = "/sendmail/customer-response/quotation/{quotationId}/reject";

    public String getOrderConfirmUrl(String orderId) {
        return trimUrl(baseUrl) + orderConfirmPath.replace("{orderId}", orderId);
    }

    public String getQuotationAcceptUrl(String quotationId) {
        return trimUrl(baseUrl) + quotationAcceptPath.replace("{quotationId}", quotationId);
    }

    public String getQuotationRejectUrl(String quotationId) {
        return trimUrl(frontendUrl) + quotationRejectPath.replace("{quotationId}", quotationId);
    }

    // =================== Utils ===================
    private String trimUrl(String url) {
        if (url == null) return "";
        return url.strip(); // Loại bỏ khoảng trắng đầu/cuối
    }
}
