import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "أنت", text: input, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // استخدم fetch بدلاً من axios
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      });
      
      const data = await response.json();

      setTimeout(() => {
        const botMessage = { sender: "البوت", text: data.reply, isUser: false };
        setMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);
      }, 1000 + Math.random() * 1000);
    } catch (error) {
      setTimeout(() => {
        const botMessage = { sender: "البوت", text: "⚠️ حصل خطأ في الاتصال.", isUser: false };
        setMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);
      }, 1000);
    }

    setInput("");
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 animate-pulse"
          style={{
            background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
          <MessageCircle size={28} className="relative z-10" />
          
          {/* نقطة الإشعار */}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
          </div>
        </button>
      ) : (
        <div className="w-96 h-[500px] bg-white/95 backdrop-blur-lg shadow-2xl rounded-3xl flex flex-col border border-gray-200/20 overflow-hidden animate-in slide-in-from-right-4 duration-300">
          {/* الهيدر المطور */}
          <div 
            className="relative p-5 flex justify-between items-center text-white overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
            }}
          >
            {/* تأثير الخلفية المتحركة */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-20 h-20 bg-white rounded-full -translate-x-10 -translate-y-10 animate-pulse"></div>
              <div className="absolute bottom-0 right-0 w-16 h-16 bg-white rounded-full translate-x-8 translate-y-8 animate-pulse delay-300"></div>
            </div>
            
            <div className="flex items-center gap-4 relative z-10">
              {/* أيقونة AI محسنة */}
              <div className="relative">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-content-center backdrop-blur-sm">
                  <div className="w-8 h-8 bg-white rounded-full relative overflow-hidden mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600"></div>
                    <div className="absolute top-2 left-2 w-4 h-4 bg-white rounded-full opacity-80"></div>
                  </div>
                </div>
                {/* مؤشر الاتصال */}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              
              <div>
                <h3 className="font-bold text-lg">مساعد الذكاء الاصطناعي</h3>
                <p className="text-white/80 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  متصل الآن
                </p>
              </div>
            </div>

            <button 
              onClick={() => setIsOpen(false)}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors duration-200 relative z-10"
            >
              <X size={20} />
            </button>
          </div>

          {/* منطقة الرسائل المطورة */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gradient-to-b from-gray-50/50 to-white">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <MessageCircle size={24} className="text-white" />
                </div>
                <p className="text-gray-500">مرحباً! كيف يمكنني مساعدتك؟</p>
              </div>
            )}
            
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex gap-3 animate-in slide-in-from-bottom-2 duration-300 ${
                  msg.isUser ? 'justify-end' : 'justify-start'
                }`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* أفاتار للبوت */}
                {!msg.isUser && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    🤖
                  </div>
                )}
                
                <div className={`flex flex-col max-w-xs ${msg.isUser ? 'items-end' : 'items-start'}`}>
                  <div 
                    className={`px-4 py-3 rounded-2xl shadow-sm backdrop-blur-sm border transition-all duration-200 hover:shadow-md ${
                      msg.isUser 
                        ? 'text-white border-blue-200/20 rounded-br-md' 
                        : 'bg-white/80 text-gray-800 border-gray-200/50 rounded-bl-md'
                    }`}
                    style={msg.isUser ? {
                      background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                    } : {}}
                  >
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                  <span className="text-xs text-gray-400 mt-1 px-2">
                    {new Date().toLocaleTimeString('ar', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>

                {/* أفاتار للمستخدم */}
                {msg.isUser && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    👤
                  </div>
                )}
              </div>
            ))}

            {/* مؤشر الكتابة */}
            {isTyping && (
              <div className="flex gap-3 animate-in slide-in-from-bottom-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  🤖
                </div>
                <div className="bg-white/80 backdrop-blur-sm px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-gray-200/50 flex items-center gap-2">
                  <span className="text-gray-600 text-sm">يكتب</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* منطقة الإدخال المطورة */}
          <div className="p-4 bg-white/80 backdrop-blur-sm border-t border-gray-200/50">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="w-full px-4 py-3 pr-12 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 bg-white/80 backdrop-blur-sm text-gray-800 placeholder-gray-500"
                  placeholder="اكتب رسالتك هنا..."
                  dir="rtl"
                />
                {input.trim() && (
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                )}
              </div>
              
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:shadow-md"
                style={{
                  background: input.trim() && !isTyping
                    ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                    : "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                }}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}