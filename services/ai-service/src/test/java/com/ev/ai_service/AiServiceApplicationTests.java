package com.ev.ai_service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.ApplicationContext;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.kafka.core.KafkaTemplate;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Lightweight context load test.
 * AI models and Kafka are mocked to avoid needing live infrastructure on CI.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
class AiServiceApplicationTests {

        @MockBean
        private VectorStore vectorStore;

        @MockBean
        private ChatModel chatModel;

        @MockBean
        private EmbeddingModel embeddingModel;

        @MockBean
        private KafkaTemplate<String, Object> kafkaTemplate;

        @Autowired
        private ApplicationContext context;

        @Test
        void contextLoads() {
            assertThat(context).isNotNull();
        }

}
