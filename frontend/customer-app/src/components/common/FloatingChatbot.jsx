import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, Bot, User, Loader, X, Minus } from "lucide-react";
import { toast } from "react-toastify";
import apiPublic from "../../services/apiPublic";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  // Constants for Storage
  const STORAGE_KEY = 'vms_chat_history';
  const TIMESTAMP_KEY = 'vms_chat_timestamp';
  const TTL_MINUTES = 10;

  const [messages, setMessages] = useState(() => {
    try {
      const savedMessages = localStorage.getItem(STORAGE_KEY);
      const savedTimestamp = localStorage.getItem(TIMESTAMP_KEY);

      if (savedMessages && savedTimestamp) {
        const now = Date.now();
        const diffMinutes = (now - parseInt(savedTimestamp, 10)) / (1000 * 60);

        if (diffMinutes < TTL_MINUTES) {
             // Parse and revive Date objects
             return JSON.parse(savedMessages).map(msg => ({
                 ...msg,
                 timestamp: new Date(msg.timestamp)
             }));
        } else {
            // Expired: Clear storage
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(TIMESTAMP_KEY);
        }
      }
    } catch (e) {
      console.error("Failed to load chat history", e);
    }
    
    // Default initial state
    return [
      {
        id: 1,
        type: 'bot',
        text: 'Xin chào! Tôi là trợ lý AI tư vấn xe điện. Tôi có thể giúp bạn:\n\n- Tư vấn chọn xe phù hợp với nhu cầu\n- So sánh các mẫu xe\n- Tính toán chi phí\n- Trả lời câu hỏi về xe điện\n\nBạn cần tư vấn gì?',
        timestamp: new Date(),
      },
    ];
  });

  // Save to localStorage whenever messages change
  useEffect(() => {
      if (messages.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
        localStorage.setItem(TIMESTAMP_KEY, Date.now().toString());
      }
  }, [messages]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

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
      // Get token from localStorage (don't hardcode)
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      };

      // Call via Gateway
      const response = await apiPublic.post('/ai/chat/ask', {
        question: input 
      }, config);

      // Handle plain string response from backend
      const botResponse = response.data;

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: botResponse || 'Xin lỗi, tôi không thể trả lời câu hỏi này.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error calling AI service:", error);
      
      let errorMessage = getFallbackResponse(input);
      let isRateLimitError = false;

      if (error.response && error.response.status === 429) {
          errorMessage = 'Bạn đã dùng hết 5 câu hỏi miễn phí trong 5 phút. Vui lòng đăng nhập để tiếp tục trò chuyện không giới hạn với chuyên gia AI của chúng tôi!';
          isRateLimitError = true;
      }
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: errorMessage,
        timestamp: new Date(),
        isRateLimit: isRateLimitError
      };

      setMessages(prev => [...prev, botMessage]);
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
    'Chi phí 5 năm?',
    'Sạc pin bao lâu?',
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && !isMinimized && (
        <div className="bg-white rounded-2xl shadow-2xl w-[380px] h-[500px] flex flex-col mb-4 overflow-hidden border border-gray-200 transition-all duration-300 animate-in slide-in-from-bottom-10 fade-in">
          {/* Header */}
          <div className="bg-blue-600 p-4 text-white flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-full">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Trợ Lý AI VinFast</h3>
                <p className="text-xs text-blue-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  Sẵn sàng hỗ trợ
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              <button 
                onClick={() => setIsMinimized(true)} 
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                title="Thu nhỏ"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                title="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.type === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                )}
                
                <div
                  className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                  }`}
                >
                  <div className="text-sm leading-relaxed">
                    {message.type === 'bot' ? (
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          table: ({node, ...props}) => <table className="border-collapse border border-gray-300 w-full text-xs my-2" {...props} />,
                          th: ({node, ...props}) => <th className="border border-gray-300 px-2 py-1 bg-gray-100 font-semibold" {...props} />,
                          td: ({node, ...props}) => <td className="border border-gray-300 px-2 py-1" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc pl-4 my-1" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal pl-4 my-1" {...props} />,
                          a: ({node, ...props}) => <a className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                          p: ({node, ...props}) => <p className="mb-1 last:mb-0" {...props} />,
                        }}
                      >
                        {message.text}
                      </ReactMarkdown>
                    ) : (
                      <div className="whitespace-pre-wrap">{message.text}</div>
                    )}
                  </div>
                  
                  {/* Login Button for Rate Limit Error */}
                  {message.isRateLimit && (
                      <button 
                        onClick={() => window.location.href = '/login'}
                        className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm"
                      >
                        Đăng nhập ngay
                      </button>
                  )}

                  <div className={`text-[10px] mt-1 text-right ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="bg-white rounded-2xl px-3 py-2 border border-gray-100 shadow-sm rounded-tl-none">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className="px-4 pb-2 bg-gray-50 overflow-x-auto whitespace-nowrap scrollbar-hide">
              <div className="flex gap-2 pb-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInput(question);
                      setTimeout(() => handleSend(), 100);
                    }}
                    className="px-3 py-1.5 text-xs bg-white border border-blue-100 text-blue-700 hover:bg-blue-50 hover:border-blue-200 rounded-full transition-all shadow-sm"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100">
            <div className="flex gap-2 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập câu hỏi..."
                className="flex-1 pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-gray-400"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="absolute right-1.5 top-1.5 p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => {
          setIsOpen(true);
          setIsMinimized(false);
        }}
        className={`bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-600/30 transition-all duration-300 flex items-center justify-center group ${
          isOpen && !isMinimized ? 'w-12 h-12 rotate-90 opacity-0 pointer-events-none absolute' : 'w-14 h-14 hover:scale-110'
        }`}
      >
        <MessageCircle className="w-7 h-7" />
        <span className="absolute right-1 top-1 w-3 h-3 bg-red-500 border-2 border-blue-600 rounded-full"></span>
      </button>
    </div>
  );
};

export default FloatingChatbot;
