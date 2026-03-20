package com.ev.sales_service.config;

import com.ev.sales_service.service.Interface.QuotationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

@Configuration
@EnableScheduling
@Slf4j
public class SchedulerConfig {

    @Autowired
    private QuotationService quotationService;

    @Scheduled(cron = "0 0 2 * * ?") // Chạy mỗi ngày lúc 2:00 AM
    public void expireOldQuotations() {
        log.info("Starting expired quotations cleanup...");
        quotationService.expireOldQuotations();
        log.info("Expired quotations cleanup completed");
    }
}