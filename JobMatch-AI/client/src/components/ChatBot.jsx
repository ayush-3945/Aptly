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
  Key,
  Check,
  Minimize2,
  ChevronDown,
  Settings,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Built-in intelligent conversational responses for zero-setup instant chat
const CONVERSATIONAL_KNOWLEDGE = [
  {
    patterns: ['hi', 'hello', 'hey', 'namaste', 'yo', 'sup', 'hola', 'hlo'],
    response:
      'Hey there! 👋 Main badhiya hoon. Aptly AI me aapka swagat hai!\n\nAaj kis cheez me help chahiye — coding doubts, resume review, tech interview prep, ya Aptly ke features?',
    suggestions: ['Tell me about Aptly', 'React vs Next.js', 'How to improve ATS score?', 'How to prepare for tech interviews?'],
  },
  {
    patterns: ['kaise ho', 'kya haal', 'how are you', 'how r u', 'sab badhiya'],
    response:
      'Main ekdum first-class hoon! 🚀 System running smooth hai. Aap batao, aaj kya build kar rahe ho ya interview prep chal rahi hai?',
    suggestions: ['Help me with React hooks', 'What is Aptly.AI?', 'Top JavaScript interview questions'],
  },
  {
    patterns: ['who made you', 'who created you', 'kisne banaya', 'creator', 'founder', 'author'],
    response:
      'Mujhe **Ayush Pandey** ne develop kiya hai as part of **Aptly.AI** — ek next-generation semantic ATS and AI job-matching ecosystem.',
    suggestions: ['What is Aptly.AI?', 'How does Aptly calculate match score?'],
  },
  {
    patterns: ['kya kar sakte ho', 'what can you do', 'features', 'help me', 'madad'],
    response:
      "Main aapka personal AI Developer & Career Copilot hoon! Main ye sab kar sakta hoon:\n\n1. **Coding Doubts Solve:** React, Node.js, JavaScript, Python, MongoDB, SQL samjhana.\n2. **Aptly Platform Guide:** Semantic Match Score, Resume Parser, aur Recruiter ATS Pipeline explain karna.\n3. **Interview Preparation:** Technical questions aur system design concepts clear karna.\n4. **Resume Advice:** Traditional ATS keyword traps se bachne ke tips dena.",
    suggestions: ['How does match score work?', 'Explain React hooks', 'JavaScript Event Loop', 'ATS Resume Tips'],
  },
  {
    patterns: ['score', 'match score', 'calculate', 'percentage', 'fit score', 'ranking'],
    response:
      'Aptly candidate match score **3 Multi-Vectors** par calculate karta hai:\n\n1. **Core Competency Overlap:** Resume ke exact skills vs Job description.\n2. **Adjacent Frameworks:** Transferable knowledge ko credit deta hai (e.g. knowing PostgreSQL translates to SQL depth; React translates to Next.js).\n3. **Production Depth & Tenure:** Superficial keyword count ke badle actual engineering experience aur project complexity score karta hai.',
    suggestions: ['How does the resume parser work?', 'What is the recruiter pipeline?'],
  },
  {
    patterns: ['jd quality', 'bias', 'jd panel', 'post job', 'job description'],
    response:
      'Aptly ka **JD Quality & Bias Analyzer** (`JDQualityPanel`) job post karne se pehle 5 criteria check karta hai:\n- **Clarity & Specificity**\n- **Inclusivity & Tone** (Flags biased words like "ninja", "rockstar", "young energetic")\n- **Market Competitiveness**\n- **Structure & Formatting**\n\nIsse job post zyada inclusive aur top-tier engineers ke liye attractive banti hai.',
    suggestions: ['What words are considered biased?', 'How to post a job on Aptly?'],
  },
  {
    patterns: ['pipeline', 'ats pipeline', 'kanban', 'stages', 'recruiter'],
    response:
      'Recruiter ke liye Aptly ek **Automated ATS Kanban Pipeline** provide karta hai:\n\n- **Applied ➔ Shortlisted ➔ Technical Interview ➔ Offer / Hired**\n- Candidates unke AI fit score ke hisaab se **automatically pre-ranked** hote hain, aur recruiter single score-threshold slider se top talent filter kar sakta hai.',
    suggestions: ['How does interview scheduling work?', 'How to benchmark a candidate?'],
  },
  {
    patterns: ['react', 'hooks', 'usestate', 'useeffect', 'usememo'],
    response:
      '**React Hooks Quick Reference:**\n- `useState`: Component local state maintain karne ke liye.\n- `useEffect`: Side-effects (API calls, event listeners, timers) handle karne ke liye.\n- `useMemo`: Expensive calculations ko memoize (cache) karne ke liye.\n- `useCallback`: Function references ko re-renders ke beech memoize karne ke liye taaki unnecessary child renders na hon.',
    suggestions: ['What is virtual DOM?', 'React vs Next.js', 'Explain useEffect cleanup'],
  },
  {
    patterns: ['event loop', 'node', 'asynchronous', 'promises', 'async await'],
    response:
      '**Node.js / JS Event Loop in 30 Seconds:**\nJavaScript single-threaded hai. Asynchronous operations (like `fetch`, timers, DB queries) ko **libuv** handle karta hai.\n\n1. **Call Stack:** Synchronous code run hota hai.\n2. **Web APIs / Worker Pool:** Background I/O execute hoti hai.\n3. **Microtask Queue:** Promises (`.then`, `async/await`) pehle execute hote hain.\n4. **Macrotask Queue:** `setTimeout`, `setInterval` baad me run hote hain.',
    suggestions: ['Difference between SQL and NoSQL', 'How does indexing work in MongoDB?'],
  },
];

export default function ChatBot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Gemini API Key from localStorage or environment
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('aptly_gemini_key') || import.meta.env.VITE_GEMINI_API_KEY || '';
  });
  const [tempKeyInput, setTempKeyInput] = useState(apiKey);
  const [keySavedToast, setKeySavedToast] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Hey! 👋 Main **Aptly AI** hoon. Main aapke coding questions, interview prep, resume optimization, aur platform queries sab me help kar sakta hoon.\n\nKuch bhi pucho!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        'How does Aptly calculate match score?',
        'Top React interview questions',
        'How does JD Quality & Bias check work?',
        'Explain Node.js Event Loop',
      ],
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && !isMinimized && !showSettings) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [messages, isOpen, isMinimized, showSettings]);

  const handleSaveKey = (e) => {
    e.preventDefault();
    const cleanKey = tempKeyInput.trim();
    setApiKey(cleanKey);
    if (cleanKey) {
      localStorage.setItem('aptly_gemini_key', cleanKey);
    } else {
      localStorage.removeItem('aptly_gemini_key');
    }
    setKeySavedToast(true);
    setTimeout(() => {
      setKeySavedToast(false);
      setShowSettings(false);
    }, 1200);
  };

  // Direct Google Gemini API Caller in browser
  const callGeminiDirect = async (query, history) => {
    if (!apiKey) return null;

    const systemInstruction = `You are Aptly AI, an ultra-smart, friendly, and versatile developer & career assistant.
- Talk naturally, concisely, and conversationally like ChatGPT.
- Support both English and Hinglish seamlessly. If user speaks Hinglish, reply in friendly Hinglish!
- Answer ANY technical, coding, or career question with clear markdown, bullet points, and code snippets.
- If asked about Aptly, explain that it's a semantic AI talent screening platform replacing blind ATS filters.
- Keep answers direct and punchy without fluff.`;

    const contents = [];
    history.slice(-4).forEach((m) => {
      contents.push({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      });
    });
    contents.push({
      role: 'user',
      parts: [{ text: query }],
    });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
        },
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Gemini API returned status ${res.status}`);
    }

    const data = await res.json();
    const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return replyText || null;
  };

  // Natural Offline / Zero-Key Engine matching
  const matchConversationalResponse = (query) => {
    const q = query.toLowerCase().trim();

    for (const item of CONVERSATIONAL_KNOWLEDGE) {
      if (item.patterns.some((pat) => q.includes(pat))) {
        return {
          text: item.response,
          suggestions: item.suggestions || [],
        };
      }
    }

    // Smart default response with helpful tips
    return {
      text: `Aapne pucha: "${query}"\n\nMain is par help kar sakta hoon! Agar aap chahein toh direct **Google Gemini 2.5 Flash** se live answer lene ke liye upar ⚙️ icon par click karke apni free **Gemini API Key** connect kar sakte hain.\n\nYa fir aap niche diye gaye topics me se choose kar sakte hain:`,
      suggestions: [
        'How does Aptly calculate match score?',
        'How does JD Quality & Bias check work?',
        'React vs Next.js comparison',
        'Top JavaScript interview questions',
      ],
    };
  };

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
      let botReplyText = null;
      let source = 'Conversational Engine';
      let suggestions = [];

      // 1. Try Gemini Generative API if key is connected
      if (apiKey) {
        try {
          botReplyText = await callGeminiDirect(query, messages);
          source = 'Gemini 2.5 Flash';
          suggestions = ['Ask a coding question', 'Explain more', 'Interview practice tips'];
        } catch (geminiErr) {
          console.warn('[ChatBot] Gemini call failed, falling back:', geminiErr?.message || geminiErr);
        }
      }

      // 2. Fallback to built-in conversational intelligence
      if (!botReplyText) {
        const localMatch = matchConversationalResponse(query);
        botReplyText = localMatch.text;
        suggestions = localMatch.suggestions;
        source = apiKey ? 'Aptly Engine (Offline Fallback)' : 'Aptly AI Engine';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: botReplyText,
          source,
          suggestions,
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

  // Simple Markdown Renderer
  const renderFormattedText = (text) => {
    if (!text) return null;
    const lines = text.split('\n');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} style={{ height: '4px' }} />;

          // Bold processing
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
      {/* 1. Floating Launch Button */}
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
          <span>Aptly AI</span>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: apiKey ? '#34D399' : '#60A5FA',
              boxShadow: `0 0 6px ${apiKey ? '#34D399' : '#60A5FA'}`,
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
                      background: apiKey ? '#34D399' : '#60A5FA',
                      display: 'inline-block',
                    }}
                  />
                </div>
                <div
                  style={{
                    fontSize: '0.72rem',
                    color: 'rgba(255, 255, 255, 0.85)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <Zap size={11} color={apiKey ? '#A7F3D0' : '#BFDBFE'} />
                  <span>{apiKey ? 'Powered by Gemini 2.5 Flash' : 'Aptly Conversational Engine'}</span>
                </div>
              </div>
            </div>

            {/* Header Control Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSettings(!showSettings);
                }}
                title="Connect Gemini API Key"
                style={{
                  background: showSettings ? 'rgba(255, 255, 255, 0.25)' : 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.9)',
                  cursor: 'pointer',
                  padding: '5px',
                  borderRadius: '4px',
                  display: 'flex',
                }}
              >
                <Settings size={15} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMessages([
                    {
                      id: 'welcome',
                      sender: 'bot',
                      text: "Chat cleared! Main aapki kya help kar sakta hoon?",
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      suggestions: ['Tell me about Aptly', 'React interview questions'],
                    },
                  ]);
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

          {/* 3. Settings View (Connect Gemini Key) */}
          {showSettings && !isMinimized && (
            <div
              style={{
                padding: '1.25rem',
                background: 'var(--bg-primary)',
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Key size={18} color="var(--accent-teal)" />
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Connect Gemini 2.5 Flash AI
                </h4>
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                Apni free **Google Gemini API Key** daalein taaki chatbot ChatGPT jaisa live reasoning se kisi bhi sawaal ka instant jawab de sake!
              </p>

              <form onSubmit={handleSaveKey} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    Gemini API Key
                  </label>
                  <input
                    type="password"
                    value={tempKeyInput}
                    onChange={(e) => setTempKeyInput(e.target.value)}
                    placeholder="AIzaSy..."
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-default)',
                      background: 'var(--bg-card)',
                      fontSize: '0.85rem',
                      fontFamily: 'monospace',
                      color: 'var(--text-primary)',
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{
                      flex: 1,
                      padding: '0.55rem',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    {keySavedToast ? <Check size={15} /> : <Zap size={15} />}
                    <span>{keySavedToast ? 'Saved!' : 'Save & Activate'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSettings(false)}
                    className="btn btn-secondary"
                    style={{ padding: '0.55rem 0.85rem', fontSize: '0.85rem' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>

              <div
                style={{
                  marginTop: 'auto',
                  padding: '0.75rem',
                  background: 'var(--bg-card)',
                  borderRadius: '6px',
                  border: '1px solid var(--border-default)',
                  fontSize: '0.76rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.45,
                }}
              >
                <strong>Need a free API key?</strong>
                <br />
                Google AI Studio se 10 second me free key mil jaati hai:
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: 'var(--accent-teal)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                    fontWeight: 600,
                    marginLeft: '0.3rem',
                  }}
                >
                  Get Key <ExternalLink size={12} />
                </a>
              </div>
            </div>
          )}

          {/* 4. Main Messages Scroll Area */}
          {!isMinimized && !showSettings && (
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

                          {msg.source && !isUser && (
                            <div
                              style={{
                                marginTop: '0.45rem',
                                paddingTop: '0.35rem',
                                borderTop: '1px dashed var(--border-default)',
                                fontSize: '0.68rem',
                                color: 'var(--text-muted)',
                              }}
                            >
                              via {msg.source}
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
                    placeholder="Pucho kuch bhi — coding, job prep, Aptly..."
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
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.68rem',
                    color: 'var(--text-muted)',
                    marginTop: '0.4rem',
                    padding: '0 2px',
                  }}
                >
                  <span>{apiKey ? '⚡ Gemini 2.5 Flash active' : '⚡ Conversational AI mode'}</span>
                  <button
                    type="button"
                    onClick={() => setShowSettings(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-teal)',
                      cursor: 'pointer',
                      fontSize: '0.68rem',
                      padding: 0,
                      fontWeight: 600,
                    }}
                  >
                    {apiKey ? 'Key Connected ✓' : 'Connect Key ⚙️'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
