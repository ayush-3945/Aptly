import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  Zap,
  CheckCircle2,
  Minimize2,
  ChevronDown,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const INITIAL_MESSAGES = [
  {
    id: 'welcome-1',
    sender: 'bot',
    text: "Hello! I'm **Aptly AI**, your semantic talent and ATS assistant.\n\nI can help you understand **ATS match scoring**, explain **skill gaps**, optimize your **job descriptions**, or navigate the **recruiter pipeline**.\n\nHow can I help you today?",
    source: 'system',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    suggestions: [
      'How does Aptly calculate match score?',
      'How does JD Quality & Bias scoring work?',
      'What is the recruiter ATS pipeline?',
      'How to eliminate blind ATS keyword rejection?',
    ],
  },
];

const CLIENT_EMERGENCY_FALLBACKS = {
  score:
    'Aptly evaluates candidates across **3 core vectors**:\n1. **Core Competency Overlap:** Skills extracted from your resume vs JD.\n2. **Adjacent Framework Equivalencies:** Understands related stacks (e.g. PostgreSQL ➔ SQL).\n3. **Experience & Project Depth:** Benchmarks production engineering tenure instead of keyword counts.',
  jd:
    'The **JD Quality Panel** checks your job post across 5 dimensions: Clarity, Specificity, Inclusivity, Competitiveness, and Structure. It flags restrictive words (e.g. "rockstar", "ninja") to ensure inclusive hiring.',
  pipeline:
    'The recruiter pipeline uses an **interactive Kanban board** (Applied ➔ Shortlisted ➔ Technical Interview ➔ Offer). Candidates are pre-ranked by AI match percentage.',
  default:
    '**Aptly.AI** replaces blind ATS keyword filters with semantic evaluation, transparent candidate skill-gap scorecards, and a recruiter JD quality & ATS Kanban pipeline.',
};

export default function ChatBot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeEngine, setActiveEngine] = useState('Hybrid Gateway');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom of message thread
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [messages, isOpen, isMinimized]);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputText).trim();
    if (!query || loading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const response = await api.post('/chat', {
        message: query,
        sessionId: `session-${user?._id || 'guest'}`,
        userRole: user?.role || 'candidate',
        history: messages.slice(-6).map((m) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text,
        })),
      });

      const data = response.data;
      const botReply = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.message || 'I processed your request.',
        source: data.source || 'n8n-rag-agent',
        isFallback: Boolean(data.isFallback),
        suggestions: data.suggestions || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      if (data.source?.includes('n8n')) {
        setActiveEngine('n8n RAG Agent');
      } else {
        setActiveEngine('Local Domain Engine');
      }

      setMessages((prev) => [...prev, botReply]);
    } catch (err) {
      console.warn('[ChatBot] API call failed, using client emergency engine:', err?.message || err);

      // Local emergency heuristic fallback if backend or network is completely down
      const q = query.toLowerCase();
      let fallbackText = CLIENT_EMERGENCY_FALLBACKS.default;
      if (q.includes('score') || q.includes('fit') || q.includes('match')) {
        fallbackText = CLIENT_EMERGENCY_FALLBACKS.score;
      } else if (q.includes('jd') || q.includes('post') || q.includes('bias')) {
        fallbackText = CLIENT_EMERGENCY_FALLBACKS.jd;
      } else if (q.includes('pipeline') || q.includes('recruiter') || q.includes('kanban')) {
        fallbackText = CLIENT_EMERGENCY_FALLBACKS.pipeline;
      }

      setActiveEngine('Local Knowledge Engine');
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-fallback-${Date.now()}`,
          sender: 'bot',
          text: fallbackText,
          source: 'local-emergency-engine',
          isFallback: true,
          suggestions: [
            'How is match score calculated?',
            'What is the recruiter pipeline?',
            'How does JD quality scoring work?',
          ],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    setMessages(INITIAL_MESSAGES);
    setActiveEngine('Hybrid Gateway');
  };

  // Helper function to render simple markdown formatting (**bold**, bullet lists, and paragraphs)
  const renderFormattedText = (text) => {
    if (!text) return null;
    const lines = text.split('\n');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} style={{ height: '4px' }} />;

          // Process bold spans (**text**)
          const parts = line.split(/(\*\*.*?\*\*)/g);
          const renderedLine = parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} style={{ fontWeight: 700, color: 'inherit' }}>
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          });

          // Bullet list styling
          if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
            return (
              <div key={idx} style={{ display: 'flex', gap: '0.45rem', paddingLeft: '0.25rem' }}>
                <span style={{ color: 'var(--accent-teal)', fontWeight: 'bold' }}>•</span>
                <span>{renderedLine.slice(1)}</span>
              </div>
            );
          }

          // Numbered list styling
          const numMatch = line.trim().match(/^(\d+)\.\s*(.*)$/);
          if (numMatch) {
            return (
              <div key={idx} style={{ display: 'flex', gap: '0.45rem', paddingLeft: '0.25rem' }}>
                <span style={{ color: 'var(--accent-teal)', fontWeight: 700, fontSize: '0.82rem' }}>
                  {numMatch[1]}.
                </span>
                <span>{numMatch[2]}</span>
              </div>
            );
          }

          return <div key={idx}>{renderedLine}</div>;
        })}
      </div>
    );
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        fontFamily: 'var(--font-main)',
      }}
    >
      {/* 1. Floating Launch Button (When Closed) */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          aria-label="Open Aptly AI Assistant"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.75rem 1.15rem',
            borderRadius: '9999px',
            background: 'var(--accent-teal)',
            color: '#FFFFFF',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 24px -4px rgba(15, 107, 92, 0.4), 0 2px 6px rgba(0, 0, 0, 0.12)',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            fontWeight: 600,
            fontSize: '0.9rem',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
            e.currentTarget.style.background = 'var(--accent-teal-mid)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.background = 'var(--accent-teal)';
          }}
        >
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={14} color="#FFFFFF" />
          </div>
          <span>Aptly AI Assistant</span>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#34D399',
              boxShadow: '0 0 6px #34D399',
            }}
          />
        </button>
      )}

      {/* 2. Expanded Chatbot Window */}
      {isOpen && (
        <div
          style={{
            width: 'clamp(320px, 92vw, 400px)',
            height: isMinimized ? '56px' : 'clamp(480px, 78vh, 600px)',
            background: 'var(--bg-card)',
            borderRadius: '12px',
            border: '1px solid var(--border-default)',
            boxShadow: '0 16px 40px -8px rgba(0, 0, 0, 0.18), 0 4px 12px rgba(0, 0, 0, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'height 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Header Bar */}
          <div
            style={{
              padding: '0.85rem 1rem',
              background: 'var(--accent-teal)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
              cursor: isMinimized ? 'pointer' : 'default',
            }}
            onClick={() => isMinimized && setIsMinimized(false)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.16)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bot size={18} color="#FFFFFF" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#FFFFFF' }}>
                    Aptly AI Assistant
                  </h4>
                  <span
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: '#34D399',
                      display: 'inline-block',
                    }}
                  />
                </div>
                <div
                  style={{
                    fontSize: '0.72rem',
                    color: 'rgba(255, 255, 255, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <Zap size={11} color="#A7F3D0" />
                  <span>{activeEngine}</span>
                </div>
              </div>
            </div>

            {/* Header Control Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleResetChat();
                }}
                title="Reset conversation"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.8)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                }}
              >
                <RotateCcw size={14} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMinimized(!isMinimized);
                }}
                title={isMinimized ? 'Expand' : 'Minimize'}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.8)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                }}
              >
                {isMinimized ? <ChevronDown size={16} /> : <Minimize2 size={14} />}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                title="Close chat"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.8)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Main Messages Scroll Area (Hidden when minimized) */}
          {!isMinimized && (
            <>
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '1rem',
                  background: 'var(--bg-primary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.9rem',
                }}
              >
                {messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isUser ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          gap: '0.45rem',
                          alignItems: 'flex-start',
                          maxWidth: '88%',
                          flexDirection: isUser ? 'row-reverse' : 'row',
                        }}
                      >
                        {/* Avatar */}
                        <div
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: isUser ? 'var(--text-primary)' : 'var(--accent-teal)',
                            color: '#FFFFFF',
                            marginTop: '2px',
                          }}
                        >
                          {isUser ? <User size={13} /> : <Bot size={13} />}
                        </div>

                        {/* Speech Bubble */}
                        <div
                          style={{
                            padding: '0.75rem 0.95rem',
                            borderRadius: isUser ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                            background: isUser ? 'var(--accent-teal)' : 'var(--bg-card)',
                            color: isUser ? '#FFFFFF' : 'var(--text-primary)',
                            border: isUser ? 'none' : '1px solid var(--border-default)',
                            fontSize: '0.85rem',
                            lineHeight: 1.5,
                            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                            wordBreak: 'break-word',
                          }}
                        >
                          {renderFormattedText(msg.text)}

                          {/* Source tag if fallback or n8n */}
                          {msg.isFallback && (
                            <div
                              style={{
                                marginTop: '0.45rem',
                                paddingTop: '0.35rem',
                                borderTop: '1px dashed var(--border-default)',
                                fontSize: '0.7rem',
                                color: 'var(--text-muted)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                              }}
                            >
                              <CheckCircle2 size={11} color="var(--accent-teal)" />
                              <span>Answered via Local Knowledge Engine</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Timestamp */}
                      <span
                        style={{
                          fontSize: '0.68rem',
                          color: 'var(--text-muted)',
                          marginTop: '0.2rem',
                          marginRight: isUser ? '28px' : '0',
                          marginLeft: !isUser ? '28px' : '0',
                        }}
                      >
                        {msg.timestamp}
                      </span>

                      {/* Suggestions list for bot messages */}
                      {!isUser && msg.suggestions && msg.suggestions.length > 0 && (
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.35rem',
                            marginTop: '0.5rem',
                            marginLeft: '28px',
                          }}
                        >
                          {msg.suggestions.map((suggestion, sIdx) => (
                            <button
                              key={sIdx}
                              type="button"
                              onClick={() => handleSendMessage(suggestion)}
                              disabled={loading}
                              style={{
                                fontSize: '0.74rem',
                                padding: '0.3rem 0.65rem',
                                background: 'var(--accent-teal-light)',
                                border: '1px solid rgba(15, 107, 92, 0.22)',
                                borderRadius: '9999px',
                                color: 'var(--accent-teal)',
                                cursor: 'pointer',
                                fontWeight: 500,
                                textAlign: 'left',
                                transition: 'all 0.15s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--accent-teal)';
                                e.currentTarget.style.color = '#FFFFFF';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'var(--accent-teal-light)';
                                e.currentTarget.style.color = 'var(--accent-teal)';
                              }}
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Loading typing indicator */}
                {loading && (
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginLeft: '4px' }}>
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: 'var(--accent-teal)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Bot size={13} color="#FFFFFF" />
                    </div>
                    <div
                      style={{
                        padding: '0.55rem 0.85rem',
                        borderRadius: '12px 12px 12px 2px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-default)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: 'var(--accent-teal)',
                          animation: 'pulse 1s infinite alternate',
                        }}
                      />
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: 'var(--accent-teal)',
                          animation: 'pulse 1s infinite alternate 0.2s',
                        }}
                      />
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: 'var(--accent-teal)',
                          animation: 'pulse 1s infinite alternate 0.4s',
                        }}
                      />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Area */}
              <div
                style={{
                  padding: '0.75rem',
                  background: 'var(--bg-card)',
                  borderTop: '1px solid var(--border-default)',
                }}
              >
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'var(--bg-primary)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-default)',
                    padding: '0.35rem 0.5rem',
                  }}
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask Aptly AI about jobs, scoring, JDs..."
                    disabled={loading}
                    style={{
                      flex: 1,
                      border: 'none',
                      background: 'transparent',
                      padding: '0.4rem 0.35rem',
                      fontSize: '0.85rem',
                      outline: 'none',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-main)',
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || loading}
                    aria-label="Send message"
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      background: inputText.trim() && !loading ? 'var(--accent-teal)' : 'var(--border-default)',
                      color: '#FFFFFF',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: inputText.trim() && !loading ? 'pointer' : 'default',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Send size={14} />
                  </button>
                </form>

                <div
                  style={{
                    textAlign: 'center',
                    fontSize: '0.68rem',
                    color: 'var(--text-muted)',
                    marginTop: '0.4rem',
                    letterSpacing: '0.01em',
                  }}
                >
                  Hybrid Gateway • n8n RAG Webhook + Local Domain Engine
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
