import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, AlertCircle } from 'lucide-react';
import { chatAPI } from '../api';
import './Chatbot.css';

const Chatbot = ({ meetingId }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'ve analyzed this meeting. What would you like to know?',
      sources: []
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestedQuestions = [
    "What were the main decisions made?",
    "Are there any blockers mentioned?",
    "Summarize the next steps."
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text) => {
    if (!text.trim()) return;

    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await chatAPI.ask(text, meetingId);

      const assistantMessage = {
        role: 'assistant',
        content: response.data.answer,
        sources: response.data.sources || []
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg = error.response?.data?.detail || 'I encountered an error connecting to the AI. Please check your internet connection or DNS settings and try again.';

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errorMsg,
        isError: true
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  return (
    <div className="chatbot-container animate-fade-in">
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message-wrapper ${msg.role}`}>
            <div className="message-avatar">
              {msg.role === 'assistant' ? <Bot size={18} /> : <User size={18} />}
            </div>
            <div className="message-content-wrapper">
              <div className={`message-bubble ${msg.isError ? 'error' : ''}`}>
                {msg.isError && <AlertCircle size={16} className="error-icon" />}
                <p>{msg.content}</p>
              </div>

              {msg.sources && msg.sources.length > 0 && (
                <div className="message-sources">
                  <span className="source-label">Sources:</span>
                  {msg.sources.map((source, idx) => (
                    <span key={idx} className="source-chip" title={source.text || source.excerpt}>
                      {source.timestamp || source.filename}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="message-wrapper assistant">
            <div className="message-avatar"><Bot size={18} /></div>
            <div className="message-content-wrapper">
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {messages.length === 1 && (
        <div className="suggested-questions">
          {suggestedQuestions.map((q, i) => (
            <button
              key={i}
              className="suggestion-btn animate-fade-up"
              style={{ animationDelay: `${i * 100}ms` }}
              onClick={() => handleSend(q)}
            >
              "{q}"
            </button>
          ))}
        </div>
      )}

      <div className="chat-input-area">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask a question about the meeting..."
          rows="1"
          disabled={isTyping}
        />
        <button
          className="send-btn"
          onClick={() => handleSend(input)}
          disabled={!input.trim() || isTyping}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
