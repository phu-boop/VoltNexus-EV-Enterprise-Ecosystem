package com.ev.ai_service.controller;

import com.ev.ai_service.dto.UserQueryDTO;
import com.ev.ai_service.service.RagChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai/chat")
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final RagChatService ragChatService;

    @PostMapping("/ask")
    public ResponseEntity<String> askAI(@RequestBody UserQueryDTO queryRequest) {
        log.info("Received chat request: {}", queryRequest.getQuestion());
        String response = ragChatService.chat(queryRequest.getQuestion());
        return ResponseEntity.ok(response);
    }
}
