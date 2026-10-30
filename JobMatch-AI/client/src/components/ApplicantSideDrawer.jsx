import React, { useEffect, useRef } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Building2,
  Calendar,
  Mail,
  Briefcase,
  FileText,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  Target,
  Sliders,
} from 'lucide-react';

const STAGE_CONFIG = {
  applied: { label: 'Applied', color: 'var(--accent-teal)', bg: 'var(--accent-teal-light)', border: 'rgba(15, 107, 92, 0.25)' },
  shortlisted: { label: 'Shortlisted', color: 'var(--accent-teal-mid)', bg: 'var(--accent-teal-light)', border: 'rgba(29, 158, 117, 0.25)' },
  interview: { label: 'Interview', color: 'var(--semantic-amber)', bg: 'rgba(180, 83, 9, 0.1)', border: 'rgba(180, 83, 9, 0.25)' },
  offer: { label: 'Offer', color: 'var(--semantic-green)', bg: 'rgba(45, 122, 58, 0.1)', border: 'rgba(45, 122, 58, 0.25)' },
  hired: { label: 'Hired', color: 'var(--semantic-green)', bg: 'rgba(45, 122, 58, 0.15)', border: 'rgba(45, 122, 58, 0.3)' },
  rejected: { label: 'Rejected', color: 'var(--semantic-red)', bg: 'rgba(185, 28, 28, 0.08)', border: 'rgba(185, 28, 28, 0.25)' },
};

export default function ApplicantSideDrawer({
  application,
  applicants = [],
  onClose,
  onSelectCandidate,
  onTransition,
  onScheduleInterview,
  onGenerateKit,
}) {
  const currentIndex = applicants.findIndex((a) => a._id === application?._id);
  const totalCount = applicants.length;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < totalCount - 1;

  const handlePrev = () => {
    if (hasPrev) onSelectCandidate(applicants[currentIndex - 1]);
  };

  const handleNext = () => {
    if (hasNext) onSelectCandidate(applicants[currentIndex + 1]);
  };

  const drawerRef = useRef(null);
  const previouslyFocusedElement = useRef(null);

  // Capture previously focused element on mount and restore on unmount/close
  useEffect(() => {
    previouslyFocusedElement.current = document.activeElement;

    // Auto-focus first focusable element inside drawer
    const timer = setTimeout(() => {
      const focusables = drawerRef.current?.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusables && focusables.length > 0) {
        focusables[0].focus();
      }
    }, 50);

    return () => {
      clearTimeout(timer);
      if (previouslyFocusedElement.current && typeof previouslyFocusedElement.current.focus === 'function') {
        previouslyFocusedElement.current.focus();
      }
    };
  }, []);

  // Keyboard listener: Esc, Tab focus trap, Left/Right navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowLeft' && hasPrev) {
        handlePrev();
      } else if (e.key === 'ArrowRight' && hasNext) {
        handleNext();
      } else if (e.key === 'Tab' && drawerRef.current) {
        const focusables = drawerRef.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length > 0) {
          const first = focusables[0];
          const last = focusables[focusables.length - 1];

          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, hasPrev, hasNext, onClose]);

  if (!application) return null;

  const candidate = application.candidate || {};
  const fullName =
    application.candidateName ||
    candidate.fullName ||
    candidate.name ||
    'Anonymous Candidate';

  const score = application.aiMatchScore ?? 0;
  const isFallback = application.evaluationSource === 'fallback';
  const stage = application.status || 'applied';
  const stageCfg = STAGE_CONFIG[stage] || STAGE_CONFIG.applied;

  const scoreBreakdown = application.scoreBreakdown || {};
  const skillsScore = scoreBreakdown.skillsScore ?? scoreBreakdown.skills ?? score;
  const experienceScore = scoreBreakdown.experienceScore;
  const domainScore = scoreBreakdown.domainScore;
  const educationScore = scoreBreakdown.educationScore;

  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'CA';

  const appliedDate = application.appliedAt
    ? new Date(application.appliedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent submission';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-candidate-name"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        display: 'flex',
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(20, 20, 20, 0.45)',
        backdropFilter: 'blur(3px)',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        ref={drawerRef}
        style={{
          width: 'min(560px, 92vw)',
          height: '100%',
          backgroundColor: 'var(--bg-card)',
          boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.18)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          borderLeft: '1px solid var(--border-default)',
          animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar: Pagination & Close */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.85rem 1.35rem',
            borderBottom: '1px solid var(--border-default)',
            background: 'var(--bg-secondary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button
              type="button"
              onClick={handlePrev}
              disabled={!hasPrev}
              aria-label="Previous Candidate"
              className="btn btn-ghost"
              style={{
                padding: '0.3rem 0.55rem',
                fontSize: '0.78rem',
                opacity: hasPrev ? 1 : 0.4,
                cursor: hasPrev ? 'pointer' : 'not-allowed',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.2rem',
              }}
            >
              <ChevronLeft size={15} />
              <span>Prev</span>
            </button>

            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontFamily: 'monospace', padding: '0 0.3rem' }}>
              {totalCount > 0 ? `${currentIndex + 1} of ${totalCount}` : ''}
            </span>

            <button
              type="button"
              onClick={handleNext}
              disabled={!hasNext}
              aria-label="Next Candidate"
              className="btn btn-ghost"
              style={{
                padding: '0.3rem 0.55rem',
                fontSize: '0.78rem',
                opacity: hasNext ? 1 : 0.4,
                cursor: hasNext ? 'pointer' : 'not-allowed',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.2rem',
              }}
            >
              <span>Next</span>
              <ChevronRight size={15} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              Esc to close
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close drawer"
              className="btn btn-ghost"
              style={{
                padding: '0.3rem',
                borderRadius: '4px',
                color: 'var(--text-secondary)',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Drawer Content */}
        <div style={{ padding: '1.5rem', flex: 1 }}>
          {/* Candidate Profile Header */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '6px',
                background: 'var(--accent-teal-light)',
                color: 'var(--accent-teal)',
                fontWeight: 800,
                fontSize: '1.05rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(15, 107, 92, 0.25)',
                flexShrink: 0,
              }}
            >
              {initials}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                <h2
                  id="drawer-candidate-name"
                  style={{
                    margin: 0,
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    fontFamily: "'Newsreader', Georgia, serif",
                    color: 'var(--text-primary)',
                  }}
                >
                  {fullName}
                </h2>
                <span
                  style={{
                    padding: '0.15rem 0.55rem',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: stageCfg.color,
                    background: stageCfg.bg,
                    border: `1px solid ${stageCfg.border}`,
                  }}
                >
                  {stageCfg.label}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {candidate.email && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Mail size={12} />
                    {candidate.email}
                  </span>
                )}
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Calendar size={12} />
                  Applied {appliedDate}
                </span>
              </div>
            </div>
          </div>

          {/* Match Scorecard Banner */}
          <div
            style={{
              padding: '1rem 1.15rem',
              background: 'var(--bg-primary)',
              borderRadius: '6px',
              border: '1px solid var(--border-default)',
              marginBottom: '1.35rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                  Candidate ATS Alignment
                </span>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.1rem' }}>
                  {application.recommendation || (score >= 75 ? 'Strong Match' : 'Moderate Match')}
                </div>
              </div>

              <div
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: '4px',
                  background: isFallback ? 'rgba(180, 83, 9, 0.1)' : 'var(--accent-teal-light)',
                  border: isFallback ? '1px solid rgba(180, 83, 9, 0.25)' : '1px solid rgba(15, 107, 92, 0.25)',
                  color: isFallback ? 'var(--semantic-amber)' : 'var(--accent-teal)',
                  fontWeight: 800,
                  fontSize: '0.98rem',
                  fontFamily: 'monospace',
                }}
              >
                {score}% {isFallback ? 'Skills Fit' : 'Overall Fit'}
              </div>
            </div>

            {/* Fallback Notice vs AI Dimension Breakdown */}
            {isFallback ? (
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    fontSize: '0.76rem',
                    color: 'var(--semantic-amber)',
                    background: 'rgba(180, 83, 9, 0.08)',
                    padding: '0.45rem 0.75rem',
                    borderRadius: '4px',
                    border: '1px solid rgba(180, 83, 9, 0.2)',
                    marginBottom: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                  <span>Keyword-based result (AI was unavailable)</span>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Technical Skills Coverage</span>
                    <span style={{ fontWeight: 700, color: 'var(--accent-teal)' }}>{skillsScore}%</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--border-default)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${skillsScore}%`,
                        height: '100%',
                        background: 'var(--accent-teal)',
                        borderRadius: '3px',
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    Experience depth, domain alignment, and credentials are only evaluated in AI mode.
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: 'var(--accent-teal)', fontWeight: 600, marginBottom: '0.65rem' }}>
                  <Sparkles size={12} />
                  <span>4-Dimension AI Calibrated Scorecard (40/30/20/10)</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                  {/* Skills (40%) */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.73rem', marginBottom: '0.2rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Skills (40%)</span>
                      <span style={{ fontWeight: 700 }}>{skillsScore}%</span>
                    </div>
                    <div style={{ height: '5px', background: 'var(--border-default)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${skillsScore}%`, height: '100%', background: 'var(--accent-teal)' }} />
                    </div>
                  </div>

                  {/* Experience (30%) */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.73rem', marginBottom: '0.2rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Experience (30%)</span>
                      <span style={{ fontWeight: 700 }}>{experienceScore ?? score}%</span>
                    </div>
                    <div style={{ height: '5px', background: 'var(--border-default)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${experienceScore ?? score}%`, height: '100%', background: 'var(--accent-teal)' }} />
                    </div>
                  </div>

                  {/* Domain (20%) */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.73rem', marginBottom: '0.2rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Domain (20%)</span>
                      <span style={{ fontWeight: 700 }}>{domainScore ?? score}%</span>
                    </div>
                    <div style={{ height: '5px', background: 'var(--border-default)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${domainScore ?? score}%`, height: '100%', background: 'var(--accent-teal)' }} />
                    </div>
                  </div>

                  {/* Education (10%) */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.73rem', marginBottom: '0.2rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Education (10%)</span>
                      <span style={{ fontWeight: 700 }}>{educationScore ?? 75}%</span>
                    </div>
                    <div style={{ height: '5px', background: 'var(--border-default)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${educationScore ?? 75}%`, height: '100%', background: 'var(--accent-teal)' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Matched Skills */}
          <div style={{ marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.45rem' }}>
              Matched Skills ({application.matchedSkills?.length || 0})
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {application.matchedSkills && application.matchedSkills.length > 0 ? (
                application.matchedSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '0.2rem 0.6rem',
                      borderRadius: '4px',
                      background: 'var(--accent-teal-light)',
                      border: '1px solid rgba(15, 107, 92, 0.25)',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      color: 'var(--accent-teal)',
                    }}
                  >
                    ✓ {skill}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>No explicit skill matches detected</span>
              )}
            </div>
          </div>

          {/* Missing Skills */}
          <div style={{ marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.45rem' }}>
              Missing Skills / Skill Gaps ({application.missingSkills?.length || 0})
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {application.missingSkills && application.missingSkills.length > 0 ? (
                application.missingSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '0.2rem 0.6rem',
                      borderRadius: '4px',
                      background: 'rgba(185, 28, 28, 0.08)',
                      border: '1px solid rgba(185, 28, 28, 0.22)',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      color: 'var(--semantic-red)',
                    }}
                  >
                    ✕ {skill}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: '0.78rem', color: 'var(--semantic-green)', fontWeight: 600 }}>
                  ✓ All core job requirements satisfied
                </span>
              )}
            </div>
          </div>

          {/* AI / Heuristic Summary */}
          <div
            style={{
              padding: '0.95rem 1.15rem',
              background: 'var(--bg-primary)',
              borderRadius: '6px',
              borderLeft: '3px solid var(--accent-teal)',
              fontSize: '0.86rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.55,
              marginBottom: '1.5rem',
            }}
          >
            <strong style={{ color: 'var(--accent-teal)', display: 'block', fontSize: '0.76rem', marginBottom: '0.25rem' }}>
              {isFallback ? 'Evaluation summary:' : 'AI summary:'}
            </strong>
            {application.fitSummary || application.experienceFit || 'Evaluation completed.'}
          </div>

          {/* Resume Link */}
          {application.resumeUrl && (
            <div style={{ marginBottom: '1.5rem' }}>
              <a
                href={application.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary"
                style={{
                  fontSize: '0.82rem',
                  padding: '0.45rem 0.85rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <FileText size={14} />
                <span>View Uploaded Resume</span>
                <ExternalLink size={12} />
              </a>
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div
          style={{
            padding: '1rem 1.35rem',
            borderTop: '1px solid var(--border-default)',
            background: 'var(--bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {onScheduleInterview && (
              <button
                type="button"
                onClick={() => onScheduleInterview(application)}
                className="btn btn-primary"
                style={{ fontSize: '0.8rem', padding: '0.45rem 0.95rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Calendar size={13} />
                <span>Schedule</span>
              </button>
            )}

            {onGenerateKit && (
              <button
                type="button"
                onClick={() => onGenerateKit(application)}
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.45rem 0.95rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <MessageSquare size={13} />
                <span>Interview Kit</span>
              </button>
            )}
          </div>

          {/* Quick Stage Change Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Stage:</span>
            <select
              value={stage}
              onChange={(e) => onTransition && onTransition(application._id, e.target.value, fullName)}
              className="form-input"
              style={{
                fontSize: '0.78rem',
                padding: '0.3rem 0.6rem',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              <option value="applied">Applied</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="hired">Hired</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
