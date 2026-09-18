import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Copy,
  Check,
  Printer,
  ChevronDown,
  ChevronUp,
  Loader2,
  HelpCircle,
  AlertCircle,
  Award,
  RefreshCw,
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const DIFFICULTY_CONFIG = {
  Easy: {
    bg: 'rgba(45, 122, 58, 0.1)',
    color: '#2D7A3A',
    border: 'rgba(45, 122, 58, 0.25)',
  },
  Medium: {
    bg: 'rgba(180, 83, 9, 0.1)',
    color: '#B45309',
    border: 'rgba(180, 83, 9, 0.25)',
  },
  Hard: {
    bg: 'rgba(185, 28, 28, 0.1)',
    color: '#B91C1C',
    border: 'rgba(185, 28, 28, 0.25)',
  },
};

const InterviewKitModal = ({ application, job, onClose }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [questions, setQuestions] = useState(null);
  const [copied, setCopied] = useState(false);

  // Section collapse states (all open by default)
  const [expandedSections, setExpandedSections] = useState({
    warmup: true,
    technical: true,
    gapProbe: true,
    behavioral: true,
    closing: true,
  });

  // Individual question expandable tips (collapsed by default)
  const [expandedAnswers, setExpandedAnswers] = useState({});

  const candidate = application?.candidate || {};
  const candidateName =
    application?.candidateName ||
    candidate.fullName ||
    candidate.name ||
    'Candidate';

  const jobTitle =
    (typeof job === 'object' && job?.title) ||
    (typeof application?.job === 'object' && application?.job?.title) ||
    candidate.profile?.targetRole ||
    'Engineering Role';

  const matchScore = application?.aiMatchScore || 0;
  const scoreColor =
    matchScore >= 75
      ? 'var(--semantic-green)'
      : matchScore >= 50
      ? 'var(--semantic-amber)'
      : 'var(--semantic-red)';
  const scoreBg =
    matchScore >= 75
      ? 'rgba(45, 122, 58, 0.1)'
      : matchScore >= 50
      ? 'rgba(180, 83, 9, 0.1)'
      : 'rgba(185, 28, 28, 0.1)';
  const scoreBorder =
    matchScore >= 75
      ? 'rgba(45, 122, 58, 0.25)'
      : matchScore >= 50
      ? 'rgba(180, 83, 9, 0.25)'
      : 'rgba(185, 28, 28, 0.25)';

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        candidateName,
        jobTitle,
        matchScore,
        matchedSkills: application?.matchedSkills || [],
        missingSkills: application?.missingSkills || [],
        jobRequirements: job?.description || job?.requirements || '',
      };

      const res = await api.post('/interviews/generate-questions', payload);
      if (res.data && res.data.warmup) {
        setQuestions(res.data);
      } else {
        throw new Error('Invalid format received from question generator.');
      }
    } catch (err) {
      console.error('[InterviewKitModal] Fetch error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to generate interview questions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [application?._id]);

  const toggleSection = (sectionKey) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const toggleAnswer = (questionId) => {
    setExpandedAnswers((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const handleCopyAll = () => {
    if (!questions) return;

    let text = `APTLY.AI INTERVIEW QUESTION KIT\n`;
    text += `Candidate: ${candidateName}\n`;
    text += `Role: ${jobTitle}\n`;
    text += `Match Score: ${matchScore}%\n`;
    text += `Generated with Gemini 2.5 Flash\n`;
    text += `=========================================\n\n`;

    // Warmup
    if (questions.warmup?.length) {
      text += `--- 1. WARMUP QUESTIONS ---\n\n`;
      questions.warmup.forEach((q, idx) => {
        text += `Q${idx + 1}: ${q.question}\n`;
        text += `Purpose: ${q.purpose}\n`;
        if (q.expectedAnswer) text += `Expected Answer / Signal: ${q.expectedAnswer}\n`;
        text += `\n`;
      });
    }

    // Technical
    if (questions.technical?.length) {
      text += `--- 2. TECHNICAL QUESTIONS ---\n\n`;
      questions.technical.forEach((q, idx) => {
        text += `Q${idx + 1} [${q.difficulty || 'Medium'}] (Target: ${q.targetSkill || 'Core'}): ${q.question}\n`;
        text += `Purpose: ${q.purpose}\n`;
        if (q.expectedAnswer) text += `Expected Answer / Signal: ${q.expectedAnswer}\n`;
        text += `\n`;
      });
    }

    // Gap Probe
    if (questions.gapProbe?.length) {
      text += `--- 3. SKILL GAP PROBE QUESTIONS ---\n\n`;
      questions.gapProbe.forEach((q, idx) => {
        text += `Q${idx + 1} [Target Gap: ${q.targetGap || 'Gap'}]: ${q.question}\n`;
        text += `Purpose: ${q.purpose}\n`;
        if (q.tip) text += `Interviewer Tip: ${q.tip}\n`;
        text += `\n`;
      });
    }

    // Behavioral
    if (questions.behavioral?.length) {
      text += `--- 4. BEHAVIORAL QUESTIONS ---\n\n`;
      questions.behavioral.forEach((q, idx) => {
        text += `Q${idx + 1}: ${q.question}\n`;
        text += `Purpose: ${q.purpose}\n`;
        text += `\n`;
      });
    }

    // Closing
    if (questions.closing?.length) {
      text += `--- 5. CLOSING QUESTION ---\n\n`;
      questions.closing.forEach((q, idx) => {
        text += `Q${idx + 1}: ${q.question}\n`;
        text += `Purpose: ${q.purpose}\n`;
        text += `\n`;
      });
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Interview question kit copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay interview-kit-modal-overlay" onClick={onClose}>
      <div
        className="paper-card interview-kit-modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '780px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '2.5rem',
          borderRadius: '8px',
          background: '#FFFFFF',
          border: '1px solid var(--border-default)',
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.15)',
          animation: 'fadeIn 0.25s ease-out',
        }}
      >
        {/* Top Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '1.25rem',
            paddingBottom: '1.25rem',
            borderBottom: '1px solid var(--border-default)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
              <h2
                style={{
                  fontSize: '1.45rem',
                  fontWeight: 800,
                  margin: 0,
                  color: 'var(--text-primary)',
                  fontFamily: "'Newsreader', Georgia, serif",
                }}
              >
                Interview Question Kit — {candidateName}
              </h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', fontSize: '0.84rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>
                Role: <strong style={{ color: 'var(--text-primary)' }}>{jobTitle}</strong>
              </span>
              <span
                style={{
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  background: scoreBg,
                  border: `1px solid ${scoreBorder}`,
                  color: scoreColor,
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                }}
              >
                <Sparkles size={11} />
                {matchScore}% Match
              </span>
              <span
                style={{
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  background: 'var(--accent-teal-light)',
                  border: '1px solid rgba(15, 107, 92, 0.25)',
                  color: 'var(--accent-teal)',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <Sparkles size={11} />
                Generated by Gemini 2.5 Flash
              </span>
            </div>
          </div>

          {/* Actions & Close */}
          <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={handleCopyAll}
              disabled={loading || !questions}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '4px',
                border: '1px solid var(--border-default)',
                background: copied ? 'var(--accent-teal-light)' : 'var(--bg-secondary)',
                color: copied ? 'var(--accent-teal)' : 'var(--text-primary)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.15s ease',
              }}
              title="Copy all questions as formatted plain text"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? 'Copied!' : 'Copy All Questions'}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              disabled={loading || !questions}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '4px',
                border: '1px solid var(--border-default)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.15s ease',
              }}
              title="Print questions or save as clean PDF"
            >
              <Printer size={13} />
              Print / Export PDF
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                borderRadius: '4px',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '0.4rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div
            style={{
              padding: '4rem 1.5rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
            }}
          >
            <Loader2 className="spin" size={32} color="var(--accent-teal)" />
            <div>
              <p
                style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  margin: 0,
                }}
              >
                Preparing personalized questions...
              </p>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Analyzing {candidateName}'s verified skills, gaps, and {jobTitle} criteria
              </span>
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div
            style={{
              padding: '2rem',
              borderRadius: '6px',
              background: 'rgba(185, 28, 28, 0.06)',
              border: '1px solid rgba(185, 28, 28, 0.25)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <AlertCircle size={28} color="var(--semantic-red)" />
            <div style={{ color: 'var(--semantic-red)', fontWeight: 600, fontSize: '0.9rem' }}>
              {error}
            </div>
            <button
              type="button"
              onClick={fetchQuestions}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '4px',
                background: 'var(--accent-teal)',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <RefreshCw size={13} />
              Retry Question Generation
            </button>
          </div>
        )}

        {/* 5 Collapsible Sections */}
        {!loading && questions && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Section 1: Warmup */}
            <div
              style={{
                borderRadius: '6px',
                border: '1px solid var(--border-default)',
                overflow: 'hidden',
              }}
            >
              <button
                type="button"
                onClick={() => toggleSection('warmup')}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'rgba(15, 107, 92, 0.08)',
                  border: 'none',
                  borderBottom: expandedSections.warmup ? '1px solid var(--border-default)' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>👋</span>
                  <span
                    style={{
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      color: 'var(--accent-teal)',
                      fontFamily: "'Newsreader', Georgia, serif",
                    }}
                  >
                    Warmup Questions ({questions.warmup?.length || 0})
                  </span>
                </div>
                <div className="no-print">
                  {expandedSections.warmup ? (
                    <ChevronUp size={16} color="var(--accent-teal)" />
                  ) : (
                    <ChevronDown size={16} color="var(--accent-teal)" />
                  )}
                </div>
              </button>

              {expandedSections.warmup && (
                <div
                  className="interview-kit-section-content"
                  style={{ padding: '1rem', background: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
                >
                  {questions.warmup?.map((q, idx) => (
                    <QuestionCard
                      key={`warmup-${idx}`}
                      id={`warmup-${idx}`}
                      question={q.question}
                      purpose={q.purpose}
                      expectedAnswer={q.expectedAnswer}
                      isExpanded={expandedAnswers[`warmup-${idx}`]}
                      onToggle={() => toggleAnswer(`warmup-${idx}`)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Section 2: Technical */}
            <div
              style={{
                borderRadius: '6px',
                border: '1px solid var(--border-default)',
                overflow: 'hidden',
              }}
            >
              <button
                type="button"
                onClick={() => toggleSection('technical')}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'var(--bg-secondary)',
                  border: 'none',
                  borderBottom: expandedSections.technical ? '1px solid var(--border-default)' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>⚙️</span>
                  <span
                    style={{
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      fontFamily: "'Newsreader', Georgia, serif",
                    }}
                  >
                    Technical Questions ({questions.technical?.length || 0})
                  </span>
                </div>
                <div className="no-print">
                  {expandedSections.technical ? (
                    <ChevronUp size={16} color="var(--text-muted)" />
                  ) : (
                    <ChevronDown size={16} color="var(--text-muted)" />
                  )}
                </div>
              </button>

              {expandedSections.technical && (
                <div
                  className="interview-kit-section-content"
                  style={{ padding: '1rem', background: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
                >
                  {questions.technical?.map((q, idx) => (
                    <QuestionCard
                      key={`tech-${idx}`}
                      id={`tech-${idx}`}
                      question={q.question}
                      purpose={q.purpose}
                      expectedAnswer={q.expectedAnswer}
                      difficulty={q.difficulty}
                      targetSkill={q.targetSkill}
                      isExpanded={expandedAnswers[`tech-${idx}`]}
                      onToggle={() => toggleAnswer(`tech-${idx}`)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Section 3: Skill Gap Probe */}
            <div
              style={{
                borderRadius: '6px',
                border: '1px solid var(--border-default)',
                overflow: 'hidden',
              }}
            >
              <button
                type="button"
                onClick={() => toggleSection('gapProbe')}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'rgba(185, 28, 28, 0.05)',
                  border: 'none',
                  borderBottom: expandedSections.gapProbe ? '1px solid var(--border-default)' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>🎯</span>
                  <span
                    style={{
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      color: '#B91C1C',
                      fontFamily: "'Newsreader', Georgia, serif",
                    }}
                  >
                    Skill Gap Probe ({questions.gapProbe?.length || 0})
                  </span>
                </div>
                <div className="no-print">
                  {expandedSections.gapProbe ? (
                    <ChevronUp size={16} color="#B91C1C" />
                  ) : (
                    <ChevronDown size={16} color="#B91C1C" />
                  )}
                </div>
              </button>

              {expandedSections.gapProbe && (
                <div
                  className="interview-kit-section-content"
                  style={{ padding: '1rem', background: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
                >
                  {questions.gapProbe?.map((q, idx) => (
                    <QuestionCard
                      key={`gap-${idx}`}
                      id={`gap-${idx}`}
                      question={q.question}
                      purpose={q.purpose}
                      expectedAnswer={q.tip}
                      targetGap={q.targetGap}
                      isGapProbe
                      isExpanded={expandedAnswers[`gap-${idx}`]}
                      onToggle={() => toggleAnswer(`gap-${idx}`)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Section 4: Behavioral */}
            <div
              style={{
                borderRadius: '6px',
                border: '1px solid var(--border-default)',
                overflow: 'hidden',
              }}
            >
              <button
                type="button"
                onClick={() => toggleSection('behavioral')}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'var(--bg-secondary)',
                  border: 'none',
                  borderBottom: expandedSections.behavioral ? '1px solid var(--border-default)' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>💬</span>
                  <span
                    style={{
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      fontFamily: "'Newsreader', Georgia, serif",
                    }}
                  >
                    Behavioral ({questions.behavioral?.length || 0})
                  </span>
                </div>
                <div className="no-print">
                  {expandedSections.behavioral ? (
                    <ChevronUp size={16} color="var(--text-muted)" />
                  ) : (
                    <ChevronDown size={16} color="var(--text-muted)" />
                  )}
                </div>
              </button>

              {expandedSections.behavioral && (
                <div
                  className="interview-kit-section-content"
                  style={{ padding: '1rem', background: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
                >
                  {questions.behavioral?.map((q, idx) => (
                    <QuestionCard
                      key={`beh-${idx}`}
                      id={`beh-${idx}`}
                      question={q.question}
                      purpose={q.purpose}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Section 5: Closing */}
            <div
              style={{
                borderRadius: '6px',
                border: '1px solid var(--border-default)',
                overflow: 'hidden',
              }}
            >
              <button
                type="button"
                onClick={() => toggleSection('closing')}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'rgba(15, 107, 92, 0.05)',
                  border: 'none',
                  borderBottom: expandedSections.closing ? '1px solid var(--border-default)' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>🏁</span>
                  <span
                    style={{
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      color: 'var(--accent-teal)',
                      fontFamily: "'Newsreader', Georgia, serif",
                    }}
                  >
                    Closing ({questions.closing?.length || 0})
                  </span>
                </div>
                <div className="no-print">
                  {expandedSections.closing ? (
                    <ChevronUp size={16} color="var(--accent-teal)" />
                  ) : (
                    <ChevronDown size={16} color="var(--accent-teal)" />
                  )}
                </div>
              </button>

              {expandedSections.closing && (
                <div
                  className="interview-kit-section-content"
                  style={{ padding: '1rem', background: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
                >
                  {questions.closing?.map((q, idx) => (
                    <QuestionCard
                      key={`closing-${idx}`}
                      id={`closing-${idx}`}
                      question={q.question}
                      purpose={q.purpose}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Reusable Question Card Component
const QuestionCard = ({
  question,
  purpose,
  expectedAnswer,
  difficulty,
  targetSkill,
  targetGap,
  isGapProbe = false,
  isExpanded = false,
  onToggle,
}) => {
  const diffStyle = difficulty ? DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.Medium : null;

  return (
    <div
      className="interview-question-card"
      style={{
        padding: '0.85rem 1rem',
        borderRadius: '6px',
        background: 'var(--bg-primary, #F8FAFC)',
        border: '1px solid var(--border-default)',
        borderLeft: isGapProbe ? '3px solid #B91C1C' : '1px solid var(--border-default)',
      }}
    >
      {/* Badges row if technical or gap */}
      {(difficulty || targetSkill || targetGap) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
          {diffStyle && (
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '0.12rem 0.45rem',
                borderRadius: '3px',
                background: diffStyle.bg,
                color: diffStyle.color,
                border: `1px solid ${diffStyle.border}`,
              }}
            >
              {difficulty}
            </span>
          )}
          {targetSkill && (
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 600,
                padding: '0.12rem 0.45rem',
                borderRadius: '3px',
                background: 'var(--accent-teal-light)',
                color: 'var(--accent-teal)',
                border: '1px solid rgba(15, 107, 92, 0.2)',
              }}
            >
              {targetSkill}
            </span>
          )}
          {targetGap && (
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '0.12rem 0.45rem',
                borderRadius: '3px',
                background: 'rgba(185, 28, 28, 0.08)',
                color: '#B91C1C',
                border: '1px solid rgba(185, 28, 28, 0.25)',
              }}
            >
              Target Gap: {targetGap}
            </span>
          )}
        </div>
      )}

      {/* Question Text */}
      <h4
        style={{
          fontSize: '0.92rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          lineHeight: 1.45,
          margin: '0 0 0.35rem 0',
          fontFamily: "'Newsreader', Georgia, serif",
        }}
      >
        {question}
      </h4>

      {/* Purpose */}
      {purpose && (
        <div
          style={{
            fontSize: '0.76rem',
            color: 'var(--text-muted)',
            lineHeight: 1.4,
            marginBottom: expectedAnswer ? '0.45rem' : 0,
          }}
        >
          <strong style={{ color: 'var(--text-secondary)' }}>Purpose:</strong> {purpose}
        </div>
      )}

      {/* Expandable Expected Answer / Tips */}
      {expectedAnswer && (
        <div style={{ marginTop: '0.4rem' }}>
          <button
            type="button"
            className="no-print"
            onClick={onToggle}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              fontSize: '0.74rem',
              fontWeight: 600,
              color: isGapProbe ? '#B91C1C' : 'var(--accent-teal)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {isGapProbe ? 'Interviewer Probing Tips' : 'Expected Answer / Signals'}
          </button>

          {(isExpanded || false) && (
            <div
              className="interview-kit-tips"
              style={{
                marginTop: '0.45rem',
                padding: '0.65rem 0.85rem',
                borderRadius: '4px',
                background: '#FFFFFF',
                border: isGapProbe ? '1px solid rgba(185, 28, 28, 0.2)' : '1px solid rgba(15, 107, 92, 0.2)',
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
              }}
            >
              <strong style={{ color: isGapProbe ? '#B91C1C' : 'var(--accent-teal)' }}>
                {isGapProbe ? 'Probing Guidance:' : 'Target Answer Signals:'}
              </strong>{' '}
              {expectedAnswer}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InterviewKitModal;
