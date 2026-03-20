package com.ev.ai_service.service;

import com.ev.ai_service.dto.ChatRequest;
import com.ev.ai_service.dto.ChatResponse;

public interface ChatService {
    ChatResponse processMessage(ChatRequest request);
}
