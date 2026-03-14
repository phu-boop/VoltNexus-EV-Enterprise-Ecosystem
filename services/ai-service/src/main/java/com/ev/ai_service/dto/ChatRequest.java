package com.ev.ai_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequest {
    private String message;
    private String context; // e.g., "customer_consultation", "vehicle_selection"
    private String conversationId; // Optional: for maintaining conversation history
}
