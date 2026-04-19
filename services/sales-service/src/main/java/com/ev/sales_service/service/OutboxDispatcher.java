package com.ev.sales_service.service;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class OutboxDispatcher {

    private final OutboxProcessor outboxProcessor;

    @Scheduled(fixedDelayString = "${outbox.dispatch.delay:5000}")
    public void scheduledDispatch() {
        try {
            outboxProcessor.dispatchTransactional(); // ✅ gọi qua bean khác → @Transactional hoạt động
        } catch (Exception e) {
            log.error("🔥 [OutboxDispatcher] Unexpected error during dispatch", e);
        }
    }
}
