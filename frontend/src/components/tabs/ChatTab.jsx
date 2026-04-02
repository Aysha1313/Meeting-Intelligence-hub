import React, { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../../services/api';
import { Send, MessageSquare, ChevronDown, ChevronUp, FileText, Loader2 } from 'lucide-react';

const ChatTab = ({ meetingId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const data = await chatAPI.sendMessage(input, meetingId);
      const aiMessage = { 
        role: 'ai', 
        content: data.answer, 
        sources: data.sources || [] 
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const Message = ({ msg }) => {
    const [showSources, setShowSources] = useState(false);

    return (
      <div className={`message-wrapper ${msg.role} animate-fade-up`}>
        {msg.role === 'ai' && <div className="ai-avatar"><div className="logo-box-xs" /></div>}
        <div className="message-bubble">
           <p>{msg.content}</p>
           {msg.sources && msg.sources.length > 0 && (
             <div className="sources-wrapper">
               <button className="sources-toggle" onClick={() => setShowSources(!showSources)}>
                 {msg.sources.length} sources {showSources ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
               </button>
               {showSources && (
                 <div className="sources-list animate-fade-in">
                   {msg.sources.map((source, i) => (
                     <div key={i} className="source-card">
                       <div className="source-header">
                         <FileText size={12} />
                         <span>{source.filename}</span>
                       </div>
                       <p className="excerpt">{source.excerpt}</p>
                     </div>
                   ))}
                 </div>
               )}
             </div>
           )}
        </div>
      </div>
    );
  };

  return (
    <div className="chat-tab animate-fade-in">
      {messages.length === 0 ? (
        <div className="chat-welcome">
          <MessageSquare size={48} className="text-tertiary" />
          <h2>Ask anything about this meeting</h2>
          <div className="suggestion-pills">
            {['What action items were assigned?', 'What did we decide about X?', 'Show me areas of conflict'].map(q => (
              <button key={q} className="suggestion-pill" onClick={() => { setInput(q); }}>{q}</button>
            ))}
          </div>
        </div>
      ) : (
        <div className="message-list" ref={scrollRef}>
          {messages.map((msg, i) => <Message key={i} msg={msg} />)}
          {isTyping && (
            <div className="message-wrapper ai animate-fade-up">
              <div className="ai-avatar"><div className="logo-box-xs" /></div>
              <div className="message-bubble typing">
                 <div className="typing-dot" />
                 <div className="typing-dot" />
                 <div className="typing-dot" />
              </div>
            </div>
          )}
        </div>
      )}

      <form className="chat-input-bar" onSubmit={handleSend}>
        <textarea 
          placeholder="Ask about decisions, action items, or anything in this meeting..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          rows={1}
        />
        <button type="submit" className={`btn-send ${!input.trim() || isTyping ? 'disabled' : ''}`}>
          <Send size={18} />
        </button>
      </form>

      <style>{`
        .chat-tab {
          display: flex;
          flex-direction: column;
          height: calc(100vh - 350px);
          background: var(--bg-surface);
          border-radius: var(--radius-xl);
          border: 1px solid var(--border);
          position: relative;
          overflow: hidden;
        }
        
        .chat-welcome {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
          text-align: center;
        }
        
        .chat-welcome h2 {
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          color: var(--text-secondary);
          font-size: 1.25rem;
        }
        
        .suggestion-pills {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.75rem;
          max-width: 500px;
        }
        
        .suggestion-pill {
          background: var(--bg-card);
          border: 1px solid var(--border);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 13px;
          color: var(--text-secondary);
        }
        
        .suggestion-pill:hover {
          background: var(--bg-card-hover);
          color: var(--text-primary);
          border-color: var(--border-hover);
        }
        
        .message-list {
          flex: 1;
          overflow-y: auto;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .message-wrapper {
          display: flex;
          gap: 1rem;
          max-width: 80%;
        }
        
        .message-wrapper.user {
          margin-left: auto;
          flex-direction: row-reverse;
        }
        
        .ai-avatar {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 4px;
        }
        
        .logo-box-xs {
          width: 100%;
          height: 100%;
          background: var(--accent);
          border-radius: 4px;
        }
        
        .message-bubble {
          padding: 1rem 1.25rem;
          border-radius: var(--radius-xl);
          font-size: 0.9rem;
          line-height: 1.6;
        }
        
        .ai .message-bubble {
          background: var(--bg-card);
          border: 1px solid var(--border);
          color: var(--text-primary);
          border-bottom-left-radius: 4px;
        }
        
        .user .message-bubble {
          background: var(--accent);
          color: white;
          border-bottom-right-radius: 4px;
        }
        
        .sources-wrapper {
          margin-top: 1rem;
          border-top: 1px solid var(--border);
          padding-top: 0.5rem;
        }
        
        .sources-toggle {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 11px;
          color: var(--text-tertiary);
          text-transform: uppercase;
          font-weight: 600;
        }
        
        .sources-list {
          margin-top: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .source-card {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 0.75rem;
        }
        
        .source-header {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 11px;
          color: var(--text-secondary);
          margin-bottom: 0.4rem;
        }
        
        .source-card .excerpt {
          font-size: 12px;
          color: var(--text-tertiary);
          line-height: 1.4;
        }
        
        .chat-input-bar {
          padding: 1rem 1.5rem;
          background: var(--bg-surface);
          border-top: 1px solid var(--border);
          display: flex;
          align-items: flex-end;
          gap: 1rem;
        }
        
        .chat-input-bar textarea {
          flex: 1;
          background: var(--bg-card);
          border: 1px solid var(--border);
          resize: none;
          max-height: 120px;
          padding: 0.8rem 1rem;
        }
        
        .btn-send {
          background: var(--accent);
          color: white;
          width: 40px;
          height: 40px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-bottom: 4px;
        }
        
        .btn-send:hover {
          transform: scale(1.05);
          background: var(--accent-hover);
        }
        
        .btn-send.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .typing {
          display: flex;
          gap: 4px;
          padding: 1rem 1.75rem;
        }
        
        .typing-dot {
          width: 6px;
          height: 6px;
          background: var(--text-tertiary);
          border-radius: 50%;
          animation: bounce 0.6s infinite ease-in-out;
        }
        
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
};

export default ChatTab;
