import React, { useState } from 'react';
import {
  Sparkles,
  Users,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  FileText,
  Loader2,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

const CATEGORY_NAMES = {
  clarity: 'Clarity & Overview',
  specificity: 'Specificity & Qualifications',
  inclusivity: 'Inclusivity & Tone',
  competitiveness: 'Market Competitiveness',
  structure: 'Structure & Formatting',
};

const getScoreColor = (score) => {
  if (score >= 80) return { color: '#2D7A3A', bg: 'rgba(45, 122, 58, 0.1)', border: 'rgba(45, 122, 58, 0.25)' };
  if (score >= 60) return { color: '#B45309', bg: 'rgba(180, 83, 9, 0.1)', border: 'rgba(180, 83, 9, 0.25)' };
  return { color: '#B91C1C', bg: 'rgba(185, 28, 28, 0.1)', border: 'rgba(185, 28, 28, 0.25)' };
};

const JDQualityPanel = ({ scoreData, loading, onAnalyzeNow }) => {
  const [issuesOpen, setIssuesOpen] = useState(true);
  const [improvementsOpen, setImprovementsOpen] = useState(true);
  const [strengthsOpen, setStrengthsOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const overallScore = scoreData ? scoreData.overallScore : 0;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;
  const scoreTheme = getScoreColor(overallScore);

  return (
    <aside
      className="paper-card jd-quality-panel"
      style={{
        position: 'sticky',
        top: '86px',
        maxHeight: 'calc(100vh - 105px)',
        overflowY: 'auto',
        padding: '1.5rem',
        borderRadius: '8px',
        background: 'var(--bg-card, #FFFFFF)',
        border: '1px solid var(--border-default)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* Panel Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.25rem',
          paddingBottom: '0.85rem',
          borderBottom: '1px solid var(--border-default)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <Sparkles size={16} color="var(--accent-teal)" />
          <h3
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              margin: 0,
              color: 'var(--text-primary)',
              fontFamily: "'Newsreader', Georgia, serif",
            }}
          >
            JD Quality Scorer
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {loading ? (
            <span
              style={{
                fontSize: '0.72rem',
                color: 'var(--accent-teal)',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <Loader2 className="spin" size={12} />
              Analyzing...
            </span>
          ) : (
            <span
              style={{
                fontSize: '0.68rem',
                padding: '0.15rem 0.45rem',
                borderRadius: '3px',
                background: 'var(--accent-teal-light)',
                color: 'var(--accent-teal)',
                fontWeight: 700,
              }}
            >
              Real-time AI
            </span>
          )}
        </div>
      </div>

      {/* Initial Empty State */}
      {!scoreData && !loading && (
        <div
          style={{
            padding: '3rem 1rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.85rem',
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'var(--accent-teal-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-teal)',
            }}
          >
            <FileText size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>
              Start writing your job description
            </p>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4, display: 'block' }}>
              Gemini AI will score your clarity, technical specificity, and scan for exclusionary bias terms as you type.
            </span>
          </div>
          {onAnalyzeNow && (
            <button
              type="button"
              onClick={onAnalyzeNow}
              className="btn btn-secondary"
              style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem', marginTop: '0.5rem' }}
            >
              <Sparkles size={13} />
              Analyze Current Text
            </button>
          )}
        </div>
      )}

      {/* Scored Panel Content */}
      {scoreData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Top Alert Banners */}
          {overallScore < 60 && (
            <div
              style={{
                padding: '0.65rem 0.85rem',
                borderRadius: '6px',
                background: 'rgba(185, 28, 28, 0.08)',
                border: '1px solid rgba(185, 28, 28, 0.25)',
                color: '#B91C1C',
                fontSize: '0.78rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                lineHeight: 1.4,
              }}
            >
              <AlertTriangle size={15} style={{ flexShrink: 0 }} />
              <span>This JD may limit your candidate pool. Improve before posting.</span>
            </div>
          )}

          {scoreData.biasFlags && scoreData.biasFlags.length > 0 && (
            <div
              style={{
                padding: '0.65rem 0.85rem',
                borderRadius: '6px',
                background: 'rgba(180, 83, 9, 0.08)',
                border: '1px solid rgba(180, 83, 9, 0.25)',
                color: '#B45309',
                fontSize: '0.78rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                lineHeight: 1.4,
              }}
            >
              <ShieldAlert size={15} style={{ flexShrink: 0 }} />
              <span>Biased language detected — review before posting</span>
            </div>
          )}

          {/* Large Score Ring + Grade & Candidate Pool */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem 0.5rem',
              borderRadius: '8px',
              background: 'var(--bg-primary, #F8FAFC)',
              border: '1px solid var(--border-default)',
            }}
          >
            <div style={{ position: 'relative', width: '116px', height: '116px', marginBottom: '0.75rem' }}>
              <svg width="116" height="116" viewBox="0 0 116 116" style={{ transform: 'rotate(-90deg)' }}>
                {/* Background Ring */}
                <circle
                  cx="58"
                  cy="58"
                  r={radius}
                  fill="transparent"
                  stroke="var(--border-default, #E2E8F0)"
                  strokeWidth="8"
                />
                {/* Animated Progress Ring */}
                <circle
                  cx="58"
                  cy="58"
                  r={radius}
                  fill="transparent"
                  stroke={scoreTheme.color}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{
                    transition: 'stroke-dashoffset 0.8s ease-in-out, stroke 0.4s ease',
                  }}
                />
              </svg>

              {/* Centered Score & Grade */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: '1.75rem',
                    fontWeight: 800,
                    lineHeight: 1,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.03em',
                  }}
                >
                  {overallScore}
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.1rem 0.4rem',
                    borderRadius: '3px',
                    background: scoreTheme.bg,
                    color: scoreTheme.color,
                    marginTop: '0.2rem',
                    border: `1px solid ${scoreTheme.border}`,
                  }}
                >
                  Grade {scoreData.grade || 'B'}
                </span>
              </div>
            </div>

            {/* Candidate Pool Indicator */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                fontWeight: 500,
              }}
            >
              <Users size={14} color="var(--accent-teal)" />
              <span>
                Predicted candidate pool:{' '}
                <strong style={{ color: 'var(--text-primary)' }}>
                  {scoreData.predictedCandidatePool || 'Medium'}
                </strong>
              </span>
            </div>
          </div>

          {/* 5 Category Scores with Progress Bars */}
          {scoreData.categories && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Evaluation Dimensions
              </div>

              {Object.entries(scoreData.categories).map(([key, cat]) => {
                const catScore = cat.score || 0;
                const catTheme = getScoreColor(catScore);
                const isHovered = hoveredCategory === key;

                return (
                  <div
                    key={key}
                    onMouseEnter={() => setHoveredCategory(key)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    style={{
                      padding: '0.45rem 0.6rem',
                      borderRadius: '5px',
                      background: isHovered ? 'var(--bg-secondary)' : 'transparent',
                      transition: 'background 0.15s ease',
                      cursor: 'default',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.76rem',
                        marginBottom: '0.25rem',
                      }}
                    >
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                        {CATEGORY_NAMES[key] || key}
                      </span>
                      <strong style={{ color: catTheme.color }}>{catScore}/100</strong>
                    </div>

                    {/* Thin Progress Bar */}
                    <div
                      style={{
                        width: '100%',
                        height: '6px',
                        borderRadius: '3px',
                        background: 'var(--border-default, #E2E8F0)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${catScore}%`,
                          height: '100%',
                          borderRadius: '3px',
                          background: catTheme.color,
                          transition: 'width 0.6s ease-in-out',
                        }}
                      />
                    </div>

                    {/* Feedback on hover or active */}
                    {(isHovered || isHovered === null) && cat.feedback && (
                      <div
                        style={{
                          fontSize: '0.72rem',
                          color: 'var(--text-muted)',
                          lineHeight: 1.35,
                          marginTop: '0.25rem',
                        }}
                      >
                        {cat.feedback}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Bias Flags Section (Only when present) */}
          {scoreData.biasFlags && scoreData.biasFlags.length > 0 && (
            <div
              style={{
                borderRadius: '6px',
                border: '1px solid rgba(185, 28, 28, 0.25)',
                background: 'rgba(185, 28, 28, 0.03)',
                padding: '0.85rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#B91C1C',
                  marginBottom: '0.6rem',
                }}
              >
                <span>⚠️</span>
                <span>Biased language detected ({scoreData.biasFlags.length})</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {scoreData.biasFlags.map((flag, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '0.6rem 0.75rem',
                      borderRadius: '4px',
                      background: '#FFFFFF',
                      border: '1px solid rgba(185, 28, 28, 0.2)',
                      fontSize: '0.76rem',
                      lineHeight: 1.45,
                    }}
                  >
                    <div style={{ marginBottom: '0.25rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Flagged word: </span>
                      <mark
                        style={{
                          background: 'rgba(185, 28, 28, 0.12)',
                          color: '#B91C1C',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '3px',
                          fontWeight: 700,
                        }}
                      >
                        "{flag.term}"
                      </mark>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      {flag.reason}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        color: 'var(--accent-teal)',
                        fontWeight: 600,
                      }}
                    >
                      <ArrowRight size={12} />
                      <span>Suggested: {flag.suggestion}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Issues Section (Collapsible) */}
          {scoreData.issues && scoreData.issues.length > 0 && (
            <div
              style={{
                borderRadius: '6px',
                border: '1px solid var(--border-default)',
                overflow: 'hidden',
              }}
            >
              <button
                type="button"
                onClick={() => setIssuesOpen(!issuesOpen)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  background: 'var(--bg-secondary)',
                  border: 'none',
                  borderBottom: issuesOpen ? '1px solid var(--border-default)' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                }}
              >
                <span>Identified Issues ({scoreData.issues.length})</span>
                {issuesOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {issuesOpen && (
                <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {scoreData.issues.map((issue, idx) => {
                    const isCritical = issue.severity === 'critical';
                    const isWarning = issue.severity === 'warning';
                    const borderColor = isCritical ? '#B91C1C' : isWarning ? '#B45309' : 'var(--accent-teal)';
                    const icon = isCritical ? '🔴' : isWarning ? '🟡' : '💡';

                    return (
                      <div
                        key={idx}
                        style={{
                          padding: '0.55rem 0.75rem',
                          borderRadius: '4px',
                          background: 'var(--bg-primary, #F8FAFC)',
                          border: '1px solid var(--border-default)',
                          borderLeft: `3px solid ${borderColor}`,
                          fontSize: '0.76rem',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.45,
                          display: 'flex',
                          gap: '0.4rem',
                          alignItems: 'flex-start',
                        }}
                      >
                        <span style={{ fontSize: '0.8rem' }}>{icon}</span>
                        <span>{issue.text}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Actionable Improvements Section */}
          {scoreData.improvements && scoreData.improvements.length > 0 && (
            <div
              style={{
                borderRadius: '6px',
                border: '1px solid var(--border-default)',
                overflow: 'hidden',
              }}
            >
              <button
                type="button"
                onClick={() => setImprovementsOpen(!improvementsOpen)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  background: 'var(--bg-secondary)',
                  border: 'none',
                  borderBottom: improvementsOpen ? '1px solid var(--border-default)' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                }}
              >
                <span>Recommended Improvements ({scoreData.improvements.length})</span>
                {improvementsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {improvementsOpen && (
                <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {scoreData.improvements.map((imp, idx) => {
                    const dot = imp.priority === 'high' ? '🔴' : imp.priority === 'medium' ? '🟡' : '🟢';

                    return (
                      <div
                        key={idx}
                        style={{
                          padding: '0.65rem 0.8rem',
                          borderRadius: '4px',
                          background: '#FFFFFF',
                          border: '1px solid var(--border-default)',
                          fontSize: '0.76rem',
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            marginBottom: '0.35rem',
                          }}
                        >
                          <span>{dot}</span>
                          <span>{imp.action}</span>
                        </div>

                        {imp.example && (
                          <pre
                            style={{
                              margin: 0,
                              padding: '0.5rem 0.7rem',
                              borderRadius: '4px',
                              background: 'var(--bg-secondary)',
                              border: '1px solid var(--border-default)',
                              fontSize: '0.72rem',
                              color: 'var(--text-secondary)',
                              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word',
                              lineHeight: 1.4,
                            }}
                          >
                            {imp.example}
                          </pre>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Strengths Section (Collapsible) */}
          {scoreData.strengths && scoreData.strengths.length > 0 && (
            <div
              style={{
                borderRadius: '6px',
                border: '1px solid var(--border-default)',
                overflow: 'hidden',
              }}
            >
              <button
                type="button"
                onClick={() => setStrengthsOpen(!strengthsOpen)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  background: 'rgba(45, 122, 58, 0.05)',
                  border: 'none',
                  borderBottom: strengthsOpen ? '1px solid var(--border-default)' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#2D7A3A',
                }}
              >
                <span>Posting Strengths ({scoreData.strengths.length})</span>
                {strengthsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {strengthsOpen && (
                <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {scoreData.strengths.map((str, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontSize: '0.76rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.4,
                      }}
                    >
                      <CheckCircle2 size={13} color="#2D7A3A" style={{ flexShrink: 0 }} />
                      <span>{str}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </aside>
  );
};

export default JDQualityPanel;
