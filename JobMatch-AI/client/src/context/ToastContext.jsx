import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = 'info', duration = 3500) => {
      const id = Date.now().toString() + Math.random().toString(36).substring(2, 7);
      const newToast = { id, message, type, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
      return id;
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, removeToast, toasts }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const ToastContainer = ({ toasts, onDismiss }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        maxWidth: '420px',
        width: 'calc(100% - 48px)',
        pointerEvents: 'none',
      }}
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem = ({ toast, onDismiss }) => {
  const { message, type } = toast;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle2 size={19} color="#10B981" style={{ flexShrink: 0 }} />,
          bg: 'rgba(12, 28, 21, 0.94)',
          border: 'rgba(16, 185, 129, 0.4)',
          accentGlow: '0 8px 25px -4px rgba(16, 185, 129, 0.3)',
          textColor: '#ECFDF5',
        };
      case 'error':
        return {
          icon: <AlertCircle size={19} color="#EF4444" style={{ flexShrink: 0 }} />,
          bg: 'rgba(32, 13, 17, 0.94)',
          border: 'rgba(239, 68, 68, 0.4)',
          accentGlow: '0 8px 25px -4px rgba(239, 68, 68, 0.3)',
          textColor: '#FEF2F2',
        };
      case 'warning':
        return {
          icon: <AlertTriangle size={19} color="#F59E0B" style={{ flexShrink: 0 }} />,
          bg: 'rgba(32, 23, 11, 0.94)',
          border: 'rgba(245, 158, 11, 0.4)',
          accentGlow: '0 8px 25px -4px rgba(245, 158, 11, 0.3)',
          textColor: '#FFFBEB',
        };
      case 'info':
      default:
        return {
          icon: <Info size={19} color="#38BDF8" style={{ flexShrink: 0 }} />,
          bg: 'rgba(15, 23, 42, 0.94)',
          border: 'rgba(56, 189, 248, 0.4)',
          accentGlow: '0 8px 25px -4px rgba(56, 189, 248, 0.3)',
          textColor: '#F8FAFC',
        };
    }
  };

  const currentTheme = getTypeStyles();

  return (
    <div
      style={{
        pointerEvents: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.85rem',
        padding: '0.95rem 1.25rem',
        borderRadius: '14px',
        background: currentTheme.bg,
        border: `1px solid ${currentTheme.border}`,
        boxShadow: `0 12px 30px rgba(0, 0, 0, 0.6), ${currentTheme.accentGlow}`,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        color: currentTheme.textColor,
        fontSize: '0.88rem',
        fontWeight: 600,
        lineHeight: 1.45,
        animation: 'slideInRight 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
      role="alert"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        {currentTheme.icon}
        <span>{message}</span>
      </div>

      <button
        onClick={onDismiss}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: '0.2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '4px',
          transition: 'color 0.15s ease',
          marginLeft: '0.5rem',
        }}
        aria-label="Dismiss notification"
        onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
      >
        <X size={15} />
      </button>
    </div>
  );
};

export default ToastContext;
