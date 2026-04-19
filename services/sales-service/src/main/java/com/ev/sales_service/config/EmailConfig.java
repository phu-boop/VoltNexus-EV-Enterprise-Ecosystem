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
    private String orderConfirmPath = "/sales/sendmail/customer-response/order/{token}/confirm"; // Giả sử order cũng dùng token sau này, hoặc giữ nguyên tạm thời
    private String quotationConfirmPath = "/sales/sendmail/customer-response/public/quotation/confirm?token={token}&accepted={accepted}";

    public String getOrderConfirmUrl(String token) {
        return trimUrl(baseUrl) + orderConfirmPath.replace("{token}", token);
    }

    public String getQuotationAcceptUrl(String token) {
        return trimUrl(baseUrl) + quotationConfirmPath.replace("{token}", token).replace("{accepted}", "true");
    }

    public String getQuotationRejectUrl(String token) {
        return trimUrl(baseUrl) + quotationConfirmPath.replace("{token}", token).replace("{accepted}", "false");
    }

    public String getOrderConfirmUrl(String token, boolean accepted) {
        return trimUrl(baseUrl) + "/sales/sendmail/customer-response/public/order/confirm?token=" + token + "&accepted=" + accepted;
    }

    // =================== Utils ===================
    private String trimUrl(String url) {
        if (url == null) return "";
        return url.strip(); // Loại bỏ khoảng trắng đầu/cuối
    }
}
