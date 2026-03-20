package com.ev.sales_service.config;

import com.ev.sales_service.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketChannelInterceptor implements ChannelInterceptor {

    private final JwtUtil jwtUtil;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            // 1. Validate JWT on CONNECT
            List<String> authorization = accessor.getNativeHeader("Authorization");
            if (authorization != null && !authorization.isEmpty()) {
                String token = authorization.get(0).replace("Bearer ", "");
                if (jwtUtil.isTokenValid(token)) {
                    String email = jwtUtil.extractEmail(token);
                    String role = jwtUtil.extractRole(token);
                    String profileId = jwtUtil.extractProfileId(token);

                    // Create a simple Principal to hold user info
                    Principal user = new UsernamePasswordAuthenticationToken(email, null, Collections.emptyList());
                    accessor.setUser(user);
                    
                    // Store details in session attributes for later use in SUBSCRIBE
                    accessor.getSessionAttributes().put("profileId", profileId);
                    accessor.getSessionAttributes().put("role", role);
                    
                    log.info("WebSocket Connected: {} (Role: {}, ProfileId: {})", email, role, profileId);
                } else {
                    log.error("Invalid JWT Token in WebSocket Connection");
                    return null; // Reject connection
                }
            } else {
                log.error("Missing Authorization Header in WebSocket Connection");
                return null; // Reject connection
            }
        } else if (accessor != null && StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            // 2. Validate Topic Subscription Authorization
            String destination = accessor.getDestination();
            if (destination != null && destination.startsWith("/topic/dealer/")) {
                String profileId = (String) accessor.getSessionAttributes().get("profileId");
                String role = (String) accessor.getSessionAttributes().get("role");
                
                String expectedDealerId = destination.replace("/topic/dealer/", "");
                
                // Allow if user is ADMIN or if their profileId matches the dealerId
                if ("ADMIN".equals(role) || "EVM_ADMIN".equals(role) || (profileId != null && profileId.equals(expectedDealerId))) {
                    log.info("Authorized subscription to {} for user {}", destination, accessor.getUser().getName());
                } else {
                    log.error("Unauthorized subscription attempt to {} by user {} (ProfileId: {})", destination, accessor.getUser().getName(), profileId);
                    return null; // Reject subscription
                }
            }
        }

        return message;
    }
}
