import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, Bot, User, Loader } from "lucide-react";
import { toast } from "react-toastify";
import apiPublic from "../services/apiPublic";

const AIChatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Xin chào! Tôi là trợ lý AI tư vấn xe điện. Tôi có thể giúp bạn:\n- Tư vấn chọn xe phù hợp với nhu cầu\n- So sánh các mẫu xe\n- Tính toán chi phí\n- Trả lời câu hỏi về xe điện\n\nBạn cần tư vấn gì?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call AI service endpoint
      const response = await apiPublic.post('/ai/api/chat', {
        message: input,
        context: 'customer_consultation',
      });

      // Handle different response structures
      let botResponse = null;
      if (response.data) {
        botResponse = response.data?.response || response.data?.data?.response || response.data?.message || response.data?.data?.message;
      }

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: botResponse || 'Xin lỗi, tôi không thể trả lời câu hỏi này.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error calling AI service:", error);
      
      // Fallback response - always use fallback when API fails
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: getFallbackResponse(input),
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Only show error toast for non-401 errors (401 is expected for public endpoints)
      if (error.response?.status !== 401) {
        toast.warning("Không thể kết nối với AI service. Đang sử dụng phản hồi mặc định.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getFallbackResponse = (userInput) => {
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('xe nào') || lowerInput.includes('chọn xe') || lowerInput.includes('tư vấn')) {
      return 'Để tư vấn chọn xe phù hợp, bạn có thể cho tôi biết:\n- Quãng đường đi mỗi ngày\n- Ngân sách\n- Số chỗ ngồi cần thiết\n- Ưu tiên (hiệu suất, tiết kiệm, không gian)\n\nVí dụ: "Tôi đi làm 20km mỗi ngày, ngân sách 1 tỷ, cần 5 chỗ ngồi"';
    }
    
    if (lowerInput.includes('giá') || lowerInput.includes('chi phí')) {
      return 'Bạn có thể sử dụng các công cụ tính toán trên website:\n- TCO Calculator: So sánh chi phí Gas vs EV\n- Financing Calculator: Tính trả góp\n\nHoặc cho tôi biết mẫu xe bạn quan tâm, tôi sẽ cung cấp thông tin giá.';
    }
    
    if (lowerInput.includes('sạc') || lowerInput.includes('pin')) {
      return 'Xe điện của chúng tôi hỗ trợ:\n- Sạc nhanh: 30-35 phút đạt 80% pin\n- Sạc thường: Tại nhà qua đêm\n- Quãng đường: 300-550km tùy mẫu\n\nBạn có thể xem bản đồ trạm sạc trên website để tìm trạm gần nhất.';
    }
    
    return 'Cảm ơn bạn đã hỏi! Tôi có thể giúp bạn:\n- Tư vấn chọn xe\n- So sánh mẫu xe\n- Tính toán chi phí\n- Thông tin về sạc và pin\n\nBạn muốn biết thêm điều gì?';
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    'Xe nào phù hợp đi làm 20km/ngày?',
    'So sánh VF 8S và VF 9',
    'Chi phí sở hữu xe điện trong 5 năm?',
    'Thời gian sạc pin bao lâu?',
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            <Bot className="w-10 h-10 text-blue-600" />
            Trợ Lý AI Tư Vấn Xe Điện
          </h1>
          <p className="text-gray-600">
            Đặt câu hỏi và nhận tư vấn thông minh về xe điện
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col" style={{ height: '600px' }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.type === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-blue-600" />
                  </div>
                )}
                
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.text}</div>
                  <div className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString('vi-VN', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>

                {message.type === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-blue-600" />
                </div>
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <Loader className="w-5 h-5 animate-spin text-gray-600" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className="px-6 pb-2">
              <div className="text-xs text-gray-500 mb-2">Câu hỏi nhanh:</div>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInput(question);
                      setTimeout(() => handleSend(), 100);
                    }}
                    className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập câu hỏi của bạn..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatbot;
