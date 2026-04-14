package com.ev.sales_service.scheduler;

import com.ev.sales_service.entity.Outbox;
import com.ev.sales_service.repository.OutboxRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;

import java.util.Collections;
import java.util.List;
import java.util.concurrent.CompletableFuture;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OutboxScraperTest {

    @Mock
    private OutboxRepository outboxRepository;

    @Mock
    private KafkaTemplate<String, String> kafkaTemplate;

    @InjectMocks
    private OutboxScraper outboxScraper;

    @Test
    void testScrapeOutbox_EmptyEvents() {
        when(outboxRepository.findByStatusOrderByCreatedAtAsc(eq("NEW"), any(PageRequest.class)))
                .thenReturn(Collections.emptyList());

        outboxScraper.scrapeOutbox();

        verify(kafkaTemplate, never()).send(anyString(), anyString(), anyString());
    }

    @Test
    void testScrapeOutbox_Success() throws Exception {
        Outbox outbox = new Outbox();
        outbox.setId("1");
        outbox.setAggregateType("Promotion");
        outbox.setAggregateId("p-1");
        outbox.setPayload("{ \"promo\": \"yes\"}");
        outbox.setAttempts(0);

        when(outboxRepository.findByStatusOrderByCreatedAtAsc(eq("NEW"), any(PageRequest.class)))
                .thenReturn(List.of(outbox));

        CompletableFuture<SendResult<String, String>> future = new CompletableFuture<>();
        future.complete(null);
        when(kafkaTemplate.send(anyString(), anyString(), anyString())).thenReturn(future);

        outboxScraper.scrapeOutbox();

        verify(kafkaTemplate, times(1)).send("ev.sales.promotion", "p-1", "{ \"promo\": \"yes\"}");
        assertEquals("SENT", outbox.getStatus());
        assertNotNull(outbox.getSentAt());
        verify(outboxRepository, times(1)).save(outbox);
    }

    @Test
    void testScrapeOutbox_InterruptedException() throws Exception {
        Outbox outbox = new Outbox();
        outbox.setId("2");
        outbox.setAggregateType("Promotion");
        outbox.setAggregateId("p-2");
        outbox.setPayload("{ \"promo\": \"no\"}");
        outbox.setAttempts(0);

        when(outboxRepository.findByStatusOrderByCreatedAtAsc(eq("NEW"), any(PageRequest.class)))
                .thenReturn(List.of(outbox));

        CompletableFuture<SendResult<String, String>> mockFuture = mock(CompletableFuture.class);
        when(mockFuture.get()).thenThrow(new InterruptedException("Test interrupt"));
        when(kafkaTemplate.send(anyString(), anyString(), anyString())).thenReturn(mockFuture);

        outboxScraper.scrapeOutbox();

        assertEquals(1, outbox.getAttempts());
        assertNotEquals("FAILED", outbox.getStatus());
        verify(outboxRepository, times(1)).save(outbox);
        assertTrue(Thread.currentThread().isInterrupted());
        
        // Clear interrupt status so it doesn't affect other tests
        Thread.interrupted();
    }

    @Test
    void testScrapeOutbox_Exception_MaxAttempts() throws Exception {
        Outbox outbox = new Outbox();
        outbox.setId("3");
        outbox.setAggregateType("Promotion");
        outbox.setAggregateId("p-3");
        outbox.setPayload("{}");
        outbox.setAttempts(4); // 4 + 1 = 5 (MAX_ATTEMPTS)

        when(outboxRepository.findByStatusOrderByCreatedAtAsc(eq("NEW"), any(PageRequest.class)))
                .thenReturn(List.of(outbox));

        CompletableFuture<SendResult<String, String>> mockFuture = mock(CompletableFuture.class);
        when(mockFuture.get()).thenThrow(new RuntimeException("Test exception"));
        when(kafkaTemplate.send(anyString(), anyString(), anyString())).thenReturn(mockFuture);

        outboxScraper.scrapeOutbox();

        assertEquals(5, outbox.getAttempts());
        assertEquals("FAILED", outbox.getStatus());
        verify(outboxRepository, times(1)).save(outbox);
    }
}
