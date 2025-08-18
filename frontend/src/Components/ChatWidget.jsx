import { useState } from "react";
import axios from "axios";
import { MessageCircle, X } from "lucide-react";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;

    // أضف رسالة المستخدم
    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const { data } = await axios.post("http://localhost:5000/api/chat", {
        message: input,
      });

      // أضف رد البوت
      const botMessage = { sender: "bot", text: data.reply };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const botMessage = { sender: "bot", text: "⚠️ حصل خطأ في الاتصال." };
      setMessages((prev) => [...prev, botMessage]);
    }

    setInput("");
  };

  return (
    <div className="fixed bottom-4 right-4">
      {/* زرار فتح/غلق */}
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700"
        >
          <MessageCircle size={24} />
        </button>
      ) : (
        <div className="w-80 h-96 bg-white shadow-2xl rounded-2xl flex flex-col">
          {/* الهيدر */}
          <div className="bg-blue-600 text-white p-3 flex justify-between items-center rounded-t-2xl">
            <span>💬 المساعد الذكي</span>
            <button onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* منطقة الرسائل */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg max-w-[75%] ${
                  msg.sender === "user"
                    ? "bg-blue-500 text-white ml-auto"
                    : "bg-gray-200 text-black mr-auto"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* الإدخال */}
          <div className="p-2 border-t flex">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 border rounded-lg px-2 py-1 mr-2"
              placeholder="اكتب رسالتك..."
            />
            <button
              onClick={handleSend}
              className="bg-blue-600 text-white px-3 rounded-lg hover:bg-blue-700"
            >
              إرسال
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
