package com.ev.ai_service;

import org.junit.jupiter.api.Test;

import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.kafka.core.KafkaTemplate;

/**
 * Removed  to avoid needing a live DB/Kafka on CI.
 * Real business logic tests should be in separate unit test classes.
 */
class AiServiceApplicationTests {

	@MockBean
	private VectorStore vectorStore;

	@MockBean
	private ChatModel chatModel;

	@MockBean
	private EmbeddingModel embeddingModel;

	@MockBean
	private KafkaTemplate<String, Object> kafkaTemplate;

	@Test
	void contextLoads() {
	}

}
