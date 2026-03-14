package com.ev.ai_service.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class RagChatService {

    private final ChatClient chatClient;
    private final VectorStore vectorStore;

    // Using compatible constructor for consistency with GeminiAIService
    public RagChatService(ChatModel chatModel, VectorStore vectorStore) {
        this.chatClient = ChatClient.create(chatModel);
        this.vectorStore = vectorStore;
    }

    public String chat(String userQuery) {
        log.info("Processing RAG chat query: {}", userQuery);

        // Step 1: Retrieve context from Vector Store
        List<Document> similarDocuments = vectorStore.similaritySearch(
                SearchRequest.builder()
                        .query(userQuery)
                        .topK(30)
                        .build()
        );

        String context = similarDocuments.stream()
                .map(Document::getText)
                .collect(Collectors.joining("\n\n"));
        
        log.debug("Retrieved Context: {}", context);

        if (context.isEmpty()) {
            context = "No internal data found.";
        }

        // Step 2: Build System Prompt
        String systemPrompt = """
               Bạn là Trợ lý ảo chuyên về xe điện VinFast (VMS).
               Hãy trả lời câu hỏi dựa trên thông tin ngữ cảnh bên dưới (Context).
               
               Context:
               {context}
               
               Yêu cầu:
               1. Trả lời bằng TIẾNG VIỆT.
               2. Tự động nhận diện tên xe (ví dụ: "VF9" = "VF 9", hoặc vf9 = "VF 9").
               3. Nếu có thông tin trong Context, hãy tổng hợp và trả lời chi tiết. SỬ DỤNG FORMAT MARKDOWN ĐỂ TRÌNH BÀY ĐẸP MẮT:
                  - Sử dụng **Bảng (Table)** khi so sánh các thông số hoặc giá cả.
                  - Sử dụng **In đậm (Bold)** cho các từ khóa quan trọng hoặc tên xe.
                  - Sử dụng *Danh sách (List)* để liệt kê tính năng.
               4. Chỉ nói "Xin lỗi !! Tôi không tìm thấy thông tin" nếu Context hoàn toàn trống hoặc không liên quan.
               """.replace("{context}", context);

        // Step 3: Call AI
        try {
            return chatClient.prompt()
                    .system(systemPrompt)
                    .user(userQuery)
                    .call()
                    .content();
        } catch (Exception e) {
            log.error("Error calling AI Chat Client", e);
            return "Sorry, I encountered an error answering your question.";
        }
    }
}
