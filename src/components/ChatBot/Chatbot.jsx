import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatContainerRef = useRef(null);

  const GEMINI_API_KEY = "AIzaSyDUynqdtb7LPVxHUMewcIDBtTrPcKYgGwc"; // 🔥 Thay thế bằng API Key của bạn

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: input }] }],
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const botMessage = {
        sender: "bot",
        text:
          response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          "I couldn't understand that.",
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Network error, please try again." },
      ]);
    }

    setInput("");
  };

  useEffect(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Nút mở chatbot */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none z-40"
      >
        {isOpen ? "❌" : "💬"}
      </button>

      {/* Khung chat */}
      {isOpen && (
        <div className="fixed bottom-5 right-5 w-80 bg-white shadow-lg rounded-lg flex flex-col h-[450px] border border-gray-300 z-50">
          {/* Header */}
          <div className="bg-blue-600 text-white p-3 flex items-center rounded-t-lg justify-between">
            <div className="flex items-center">
              <span className="mr-2">🤖</span>
              <span className="font-bold">Gemini AI</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white">
              ❌
            </button>
          </div>

          {/* Nội dung chat */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-3 space-y-2"
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
              >
                <div
                  className={`max-w-[75%] p-2 rounded-lg ${msg.sender === "user"
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-200 text-gray-800 rounded-bl-none"
                    }`}
                >
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-3 flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type something..."
              className="flex-1 border border-gray-300 rounded-l-lg py-2 px-3 focus:outline-none"
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 text-white p-2 rounded-r-lg hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
