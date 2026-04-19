package com.ev.ai_service.service.Implementation;

import com.ev.ai_service.dto.ChatRequest;
import com.ev.ai_service.dto.ChatResponse;
import com.ev.ai_service.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatServiceImpl implements ChatService {

    @Value("${openai.api.key:}")
    private String openaiApiKey;

    @Value("${openai.model:gpt-3.5-turbo}")
    private String openaiModel;

    @Override
    public ChatResponse processMessage(ChatRequest request) {
        String message = request.getMessage();
        String context = request.getContext() != null ? request.getContext() : "customer_consultation";
        String conversationId = request.getConversationId() != null 
            ? request.getConversationId() 
            : UUID.randomUUID().toString();

        // Build prompt based on context
        String systemPrompt = buildSystemPrompt(context);
        String userPrompt = message;

        // Call OpenAI API (simplified - in production, use OpenAI Java SDK)
        String response = generateAIResponse(systemPrompt, userPrompt);

        return ChatResponse.builder()
                .response(response)
                .conversationId(conversationId)
                .context(context)
                .build();
    }

    private String buildSystemPrompt(String context) {
        StringBuilder prompt = new StringBuilder();
        
        prompt.append("Bạn là trợ lý AI chuyên tư vấn về xe điện cho khách hàng.\n");
        prompt.append("Nhiệm vụ của bạn:\n");
        prompt.append("1. Tư vấn khách hàng chọn xe điện phù hợp với nhu cầu\n");
        prompt.append("2. So sánh các mẫu xe điện (VF 8S, VF 9, VF e34, VF 5 Plus, VF 6)\n");
        prompt.append("3. Tính toán chi phí và tiết kiệm\n");
        prompt.append("4. Trả lời câu hỏi về pin, sạc, quãng đường\n");
        prompt.append("5. Hướng dẫn về trạm sạc và bảo dưỡng\n\n");
        prompt.append("Thông tin về các mẫu xe:\n");
        prompt.append("- VF 8S: 450km, 75kWh, 1.2-1.5 tỷ\n");
        prompt.append("- VF 9: 550km, 95kWh, 1.8-2 tỷ\n");
        prompt.append("- VF e34: 350km, 55kWh, 850-950 triệu\n");
        prompt.append("- VF 5 Plus: 300km, 50kWh, 600-700 triệu\n");
        prompt.append("- VF 6: 400km, 65kWh, 1-1.15 tỷ (Pre-order)\n\n");
        prompt.append("Trả lời bằng tiếng Việt, thân thiện và chuyên nghiệp.");

        return prompt.toString();
    }

    private String generateAIResponse(String systemPrompt, String userMessage) {
        // Simplified implementation - in production, integrate with OpenAI API
        // For now, return intelligent fallback responses
        
        String lowerMessage = userMessage.toLowerCase();
        
        // Vehicle recommendation based on daily distance
        if (lowerMessage.contains("đi làm") || lowerMessage.contains("mỗi ngày")) {
            return extractDailyDistanceAndRecommend(userMessage);
        }
        
        // Price comparison
        if (lowerMessage.contains("so sánh") || lowerMessage.contains("khác nhau")) {
            return compareVehicles(userMessage);
        }
        
        // Cost calculation
        if (lowerMessage.contains("chi phí") || lowerMessage.contains("tiết kiệm")) {
            return provideCostAdvice();
        }
        
        // Charging questions
        if (lowerMessage.contains("sạc") || lowerMessage.contains("pin")) {
            return provideChargingInfo();
        }
        
        // Default response
        return "Cảm ơn bạn đã hỏi! Tôi có thể giúp bạn:\n" +
               "1. Tư vấn chọn xe phù hợp (cho tôi biết quãng đường đi mỗi ngày và ngân sách)\n" +
               "2. So sánh các mẫu xe\n" +
               "3. Tính toán chi phí sở hữu\n" +
               "4. Thông tin về sạc và pin\n\n" +
               "Bạn muốn biết thêm điều gì?";
    }

    private String extractDailyDistanceAndRecommend(String message) {
        // Simple extraction - in production, use NLP
        if (message.contains("20") || message.contains("hai mươi")) {
            return "Với quãng đường 20km/ngày, bạn có thể chọn:\n" +
                   "✅ VF e34 (350km) - Phù hợp nhất, giá tốt\n" +
                   "✅ VF 5 Plus (300km) - Tiết kiệm nhất\n" +
                   "💡 Mỗi tuần chỉ cần sạc 1-2 lần. Chi phí điện khoảng 30,000-50,000 VNĐ/tháng.";
        }
        if (message.contains("50") || message.contains("năm mươi")) {
            return "Với quãng đường 50km/ngày, bạn nên chọn:\n" +
                   "✅ VF 8S (450km) - Cân bằng tốt\n" +
                   "✅ VF e34 (350km) - Đủ dùng, giá tốt\n" +
                   "💡 Mỗi tuần cần sạc 2-3 lần. Chi phí điện khoảng 100,000-150,000 VNĐ/tháng.";
        }
        return "Để tư vấn chính xác, bạn có thể cho tôi biết:\n" +
               "- Quãng đường đi mỗi ngày (km)\n" +
               "- Ngân sách (triệu VNĐ)\n" +
               "- Số chỗ ngồi cần thiết\n" +
               "- Ưu tiên (hiệu suất, tiết kiệm, không gian)";
    }

    private String compareVehicles(String message) {
        if (message.contains("VF 8S") && message.contains("VF 9")) {
            return "So sánh VF 8S vs VF 9:\n\n" +
                   "VF 8S:\n" +
                   "- Quãng đường: 450km\n" +
                   "- Pin: 75kWh\n" +
                   "- Giá: 1.2-1.5 tỷ\n" +
                   "- Phù hợp: Gia đình nhỏ, đi làm\n\n" +
                   "VF 9:\n" +
                   "- Quãng đường: 550km\n" +
                   "- Pin: 95kWh\n" +
                   "- Giá: 1.8-2 tỷ\n" +
                   "- Phù hợp: Gia đình lớn, đi xa\n\n" +
                   "💡 Nếu ngân sách cho phép và cần không gian lớn, chọn VF 9. Nếu muốn tiết kiệm, chọn VF 8S.";
        }
        return "Bạn muốn so sánh mẫu xe nào? Tôi có thể so sánh:\n" +
               "- VF 8S vs VF 9\n" +
               "- VF e34 vs VF 5 Plus\n" +
               "- Hoặc bất kỳ mẫu nào khác";
    }

    private String provideCostAdvice() {
        return "Chi phí sở hữu xe điện:\n\n" +
               "💰 Tiết kiệm nhiên liệu:\n" +
               "- Xe xăng: ~25,000 VNĐ/km\n" +
               "- Xe điện: ~3,000 VNĐ/km\n" +
               "- Tiết kiệm: ~22,000 VNĐ/km\n\n" +
               "🔧 Bảo dưỡng:\n" +
               "- Xe xăng: ~5 triệu/năm\n" +
               "- Xe điện: ~2 triệu/năm\n" +
               "- Tiết kiệm: ~3 triệu/năm\n\n" +
               "💡 Trong 5 năm, bạn có thể tiết kiệm 100-200 triệu so với xe xăng!\n\n" +
               "Sử dụng công cụ TCO Calculator trên website để tính chi tiết.";
    }

    private String provideChargingInfo() {
        return "Thông tin về sạc và pin:\n\n" +
               "⚡ Sạc nhanh:\n" +
               "- Thời gian: 30-35 phút đạt 80% pin\n" +
               "- Có tại các trạm VinFast\n" +
               "- Phí: Miễn phí hoặc tính theo kWh\n\n" +
               "🔌 Sạc tại nhà:\n" +
               "- Lắp đặt wallbox: ~10-15 triệu\n" +
               "- Sạc qua đêm: 6-8 giờ\n" +
               "- Chi phí điện: ~3,000 VNĐ/kWh\n\n" +
               "📍 Xem bản đồ trạm sạc trên website để tìm trạm gần nhất!";
    }
}
