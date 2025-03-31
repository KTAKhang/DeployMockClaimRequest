import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendMessageRequest } from "../../redux/actions/chatActions";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const chatContainerRef = useRef(null);

  const dispatch = useDispatch();
  const messages = useSelector((state) => state.chat.messages);
  const isLoading = useSelector((state) => state.chat.isLoading);
  const error = useSelector((state) => state.chat.error);

  const sendMessage = () => {
    if (!input.trim()) return;

    // Dispatch action to send message
    dispatch(sendMessageRequest(input));
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
      {/* Chatbot button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none z-40"
      >
        {isOpen ? "❌" : "💬"}
      </button>

      {/* Chat window */}
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

          {/* Chat content */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-3 space-y-2"
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] p-2 rounded-lg ${
                    msg.sender === "user"
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-800 rounded-bl-none"
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-800 rounded-lg p-2">
                  Typing...
                </div>
              </div>
            )}

            {error && (
              <div className="flex justify-start">
                <div className="bg-red-200 text-red-800 rounded-lg p-2">
                  {error}
                </div>
              </div>
            )}
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
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 text-white p-2 rounded-r-lg hover:bg-blue-700"
              disabled={isLoading}
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
