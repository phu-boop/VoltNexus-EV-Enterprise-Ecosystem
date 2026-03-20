package com.ev.ai_service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.kafka.core.KafkaTemplate;

@SpringBootTest
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
