import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  CheckCircle2,
  Award,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  Loader2,
  TrendingUp,
  FileText
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function VoiceInterviewModal({ isOpen, onClose, jobTitle = 'Software Engineer', candidateName = 'Candidate', initialQuestions = [] }) {
  const { showToast } = useToast();

  const defaultQuestions = [
    {
      id: 1,
      category: 'Warmup',
      question: `Welcome ${candidateName}. Walk me through your most challenging web development project and the core architecture decisions you made.`,
      expectedKeywords: ['architecture', 'scalability', 'performance', 'database', 'trade-offs'],
    },
    {
      id: 2,
      category: 'Technical Deep-Dive',
      question: 'How do you handle state management, asynchronous operations, and error handling in a high-traffic production application?',
      expectedKeywords: ['async/await', 'error boundary', 'caching', 'optimistic updates', 'resilience'],
    },
    {
      id: 3,
      category: 'System Design & Trade-offs',
      question: 'Suppose an API endpoint starts experiencing high latency under sudden traffic spikes. Walk me through your step-by-step debugging and optimization strategy.',
      expectedKeywords: ['profiling', 'indexing', 'redis caching', 'connection pooling', 'rate limiting'],
    },
    {
      id: 4,
      category: 'Behavioral & Leadership',
      question: 'Describe a situation where you had a strong technical disagreement with a team member. How did you resolve it and what was the outcome?',
      expectedKeywords: ['communication', 'data-driven', 'compromise', 'user first', 'alignment'],
    },
  ];

  const questions = initialQuestions.length > 0 ? initialQuestions : defaultQuestions;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [responses, setResponses] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const recognitionRef = useRef(null);

  const currentQ = questions[currentIndex] || questions[0];

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript + ' ';
        }
        setTranscript(currentTranscript.trim());
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_e) {}
      }
    };
  }, []);

  // Text-to-Speech: AI speaks the question
  const speakQuestion = (text) => {
    if (!('speechSynthesis' in window)) {
      showToast('Text-to-speech not supported in this browser.', 'warning');
      return;
    }

    window.speechSynthesis.cancel();

    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Toggle Microphone
  const toggleListening = () => {
    if (!recognitionRef.current) {
      showToast('Microphone speech recognition is not supported in this browser. You can type your answer below!', 'info');
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (_e) {}
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Could not start recognition:', err);
      }
    }
  };

  // Evaluate candidate answer locally/heuristically
  const handleSaveAndNext = () => {
    if (!transcript.trim()) {
      showToast('Please speak or type your answer before proceeding.', 'warning');
      return;
    }

    setEvaluating(true);

    setTimeout(() => {
      // Analyze answer
      const words = transcript.trim().split(/\s+/).length;
      const keywords = currentQ.expectedKeywords || ['architecture', 'performance', 'scalability'];
      const matched = keywords.filter((k) => transcript.toLowerCase().includes(k.toLowerCase()));
      
      let score = 6;
      if (words > 25) score += 2;
      if (matched.length > 0) score += Math.min(2, matched.length);
      score = Math.min(10, score);

      const feedback = score >= 8
        ? 'Excellent articulation! Demonstrates clear technical depth, real-world context, and structured delivery.'
        : score >= 6
        ? 'Good foundational answer. Try including more quantifiable metrics or architectural trade-offs to stand out.'
        : 'Brief response. Elaborate more on specific technologies, challenges faced, and lessons learned.';

      setResponses((prev) => ({
        ...prev,
        [currentIndex]: {
          question: currentQ.question,
          answer: transcript,
          score,
          feedback,
          matchedKeywords: matched,
        },
      }));

      setEvaluating(false);
      setTranscript('');

      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setIsCompleted(true);
      }
    }, 400);
  };

  if (!isOpen) return null;

  // Calculate overall performance summary
  const totalScore = Object.values(responses).reduce((acc, r) => acc + (r.score || 7), 0);
  const avgScore = Object.keys(responses).length > 0
    ? (totalScore / Object.keys(responses).length).toFixed(1)
    : '8.5';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(20, 20, 20, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
      }}
    >
      <div
        style={{
          background: 'var(--bg-card)',
          borderRadius: '12px',
          border: '1px solid var(--border-default)',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-primary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'var(--accent-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <Mic size={18} />
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                AI Voice Mock Interview
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Role: {jobTitle} ? Candidate: {candidateName}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '4px',
              borderRadius: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {!isCompleted ? (
            <div>
              {/* Progress Indicator */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <span
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: 'var(--accent-teal)',
                    background: 'var(--accent-teal-light)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '4px',
                  }}
                >
                  {currentQ.category || 'Interview Round'}
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Question {currentIndex + 1} of {questions.length}
                </span>
              </div>

              {/* Question Card */}
              <div
                style={{
                  background: 'var(--bg-primary)',
                  borderRadius: '8px',
                  padding: '1.25rem',
                  border: '1px solid var(--border-default)',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                  {currentQ.question}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => speakQuestion(currentQ.question)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '6px',
                      background: isSpeaking ? 'var(--semantic-amber)' : 'var(--accent-teal)',
                      color: '#fff',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                    {isSpeaking ? 'Stop Speaking' : 'Listen Question'}
                  </button>
                </div>
              </div>

              {/* Answer Box & Voice Input */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Your Spoken Response
                  </label>
                  <button
                    type="button"
                    onClick={toggleListening}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '20px',
                      background: isListening ? 'rgba(185, 28, 28, 0.12)' : 'var(--bg-secondary)',
                      color: isListening ? 'var(--semantic-red)' : 'var(--text-secondary)',
                      border: isListening ? '1px solid var(--semantic-red)' : '1px solid var(--border-default)',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                    {isListening ? 'Recording... (Click to Stop)' : 'Start Speaking'}
                  </button>
                </div>

                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Speak through your microphone or type your response here..."
                  rows={5}
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    borderRadius: '8px',
                    border: isListening ? '1px solid var(--semantic-red)' : '1px solid var(--border-default)',
                    background: 'var(--bg-card)',
                    fontSize: '0.88rem',
                    color: 'var(--text-primary)',
                    lineHeight: 1.5,
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {/* Bottom Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    background: 'transparent',
                    border: '1px solid var(--border-default)',
                    padding: '0.5rem 0.9rem',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary)',
                    cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                    opacity: currentIndex === 0 ? 0.4 : 1,
                  }}
                >
                  <ArrowLeft size={14} />
                  Previous
                </button>

                <button
                  type="button"
                  onClick={handleSaveAndNext}
                  disabled={evaluating}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'var(--accent-teal)',
                    border: 'none',
                    color: '#fff',
                    padding: '0.55rem 1.25rem',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {evaluating ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Analyzing...
                    </>
                  ) : currentIndex < questions.length - 1 ? (
                    <>
                      Next Question
                      <ChevronRight size={15} />
                    </>
                  ) : (
                    <>
                      Finish & View Scorecard
                      <Award size={15} />
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Final Scorecard */
            <div>
              <div
                style={{
                  textAlign: 'center',
                  padding: '1.5rem',
                  background: 'var(--accent-teal-light)',
                  borderRadius: '10px',
                  marginBottom: '1.5rem',
                  border: '1px solid rgba(15, 107, 92, 0.2)',
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'var(--accent-teal)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 0.75rem auto',
                  }}
                >
                  <Award size={28} />
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Overall Interview Score: {avgScore} / 10
                </div>
                <div style={{ fontSize: '0.84rem', color: 'var(--accent-teal)', fontWeight: 600, marginTop: '0.25rem' }}>
                  {Number(avgScore) >= 8 ? 'Strong Technical Performance' : 'Promising Candidate Readiness'}
                </div>
              </div>

              {/* Individual Question Feedback */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {Object.values(responses).map((res, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'var(--bg-primary)',
                      padding: '1rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-default)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Q{i + 1}: {res.question}
                      </span>
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          background: 'var(--accent-teal)',
                          color: '#fff',
                        }}
                      >
                        {res.score}/10
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontStyle: 'italic' }}>
                      "{res.answer.slice(0, 140)}..."
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                      <strong style={{ color: 'var(--accent-teal)' }}>AI Feedback: </strong>
                      {res.feedback}
                    </div>
                  </div>
                ))}
              </div>

              {/* Close Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    background: 'var(--accent-teal)',
                    border: 'none',
                    color: '#fff',
                    padding: '0.6rem 1.5rem',
                    borderRadius: '6px',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
