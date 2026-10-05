import React, { useState, useEffect, useRef, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const AIChatbot = () => {
  const { backendUrl, token } = useContext(AppContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchChatHistory = async () => {
    if (!token) return;
    try {
      const { data } = await axios.get(`${backendUrl}/api/ai/history`, {
        headers: { token }
      });
      if (data.success && data.messages) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error("Fetch chat history error:", err);
    }
  };

  useEffect(() => {
    if (token && isOpen) {
      fetchChatHistory();
    }
  }, [token, isOpen]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || loading) return;

    const userText = inputText.trim();
    setInputText('');

    // Optimistic UI update
    const userMsg = { sender: 'user', text: userText, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/ai/chat`,
        { message: userText },
        { headers: { token } }
      );

      if (data.success) {
        setMessages(data.chatHistory || []);
      } else {
        toast.error(data.message || "Failed to get AI response");
      }
    } catch (err) {
      console.error("AI send error:", err);
      toast.error("Error communicating with AI Assistant");
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (!window.confirm("Are you sure you want to clear your chat history?")) return;
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/ai/clear`,
        {},
        { headers: { token } }
      );
      if (data.success) {
        setMessages([]);
        toast.info("Chat history cleared");
      }
    } catch (err) {
      toast.error("Failed to clear chat history");
    }
  };

  if (!token) return null;

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white p-4 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2 group cursor-pointer"
        title="DocBook AI Health Assistant"
      >
        <span className="text-xl">✨</span>
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-500 ease-in-out font-medium text-sm pr-1">
          AI Medical Assistant
        </span>
      </button>

      {/* Chat Window Modal / Slide-over */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end p-0 sm:p-6 bg-black/40 backdrop-blur-xs">
          <div className="bg-white w-full sm:w-[440px] h-[85vh] sm:h-[650px] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-4 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold border border-white/30">
                  ✨
                </div>
                <div>
                  <h3 className="font-semibold text-base leading-tight">DocBook AI Assistant</h3>
                  <p className="text-xs text-indigo-100 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Online General Health Guide
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={handleClearChat}
                    className="text-xs text-indigo-100 hover:text-white px-2 py-1 rounded hover:bg-white/10 transition"
                    title="Clear Chat History"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-xl font-bold transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Medical Emergency Warning Banner */}
            <div className="bg-amber-50 border-b border-amber-200 px-3 py-2 text-[11px] text-amber-800 flex items-start gap-2">
              <span className="text-amber-500 font-bold">⚠️</span>
              <p>
                <strong>Not a Doctor:</strong> Informational guidance only. For medical emergencies, call emergency services immediately.
              </p>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.length === 0 && !loading && (
                <div className="text-center py-8 px-4 text-gray-500">
                  <div className="w-14 h-14 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl mx-auto mb-3">
                    💬
                  </div>
                  <h4 className="font-semibold text-gray-800 text-sm mb-1">How can I help your health today?</h4>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto mb-4">
                    Ask about symptoms, general health tips, understanding prescriptions, or medicine guidance.
                  </p>

                  {/* Sample prompt pills */}
                  <div className="flex flex-col gap-2">
                    {[
                      "What should I do for a mild fever?",
                      "How do I take medicine marked 'After food'?",
                      "Tips for managing headaches",
                      "When should I consult a doctor?"
                    ].map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setInputText(prompt);
                        }}
                        className="text-left text-xs bg-white border border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50/50 text-indigo-950 p-2.5 rounded-lg transition shadow-xs"
                      >
                        💡 {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, index) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={index}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}
                  >
                    <div className={`flex gap-2 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
                          isUser ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {isUser ? '👤' : '✨'}
                      </div>
                      <div>
                        <div
                          className={`p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line shadow-xs ${
                            isUser
                              ? 'bg-indigo-600 text-white rounded-tr-none'
                              : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1 block px-1">
                          {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex gap-2 items-center bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-none">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-150"></div>
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-300"></div>
                    <span className="text-xs text-gray-400 ml-1">AI Assistant is thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-200 flex gap-2 items-center">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask about symptoms, health advice..."
                className="flex-1 bg-gray-100 text-xs sm:text-sm px-4 py-2.5 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || loading}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-2.5 rounded-full shadow-md transition-all flex items-center justify-center cursor-pointer"
              >
                <svg className="w-4 h-4 rotate-90" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;
