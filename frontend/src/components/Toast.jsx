import React, { useState, useEffect, createContext, useContext } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type} animate-slide-in`}>
            {toast.message}
          </div>
        ))}
      </div>
      <style>{`
        .toast-container {
          position: fixed;
          top: 2rem;
          right: 2rem;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          pointer-events: none;
        }
        
        .toast {
          padding: 0.75rem 1.25rem;
          border-radius: var(--radius-md);
          background: var(--bg-card);
          border: 1px solid var(--border);
          color: var(--text-primary);
          font-size: 0.9rem;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
          min-width: 200px;
          pointer-events: auto;
          transition: all 0.3s var(--ease-smooth);
        }
        
        .toast.success { border-left: 4px solid var(--sentiment-positive); }
        .toast.error { border-left: 4px solid var(--sentiment-negative); }
        .toast.info { border-left: 4px solid var(--accent); }
        
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        .animate-slide-in {
          animation: slideInRight 0.4s var(--ease-smooth) forwards;
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
