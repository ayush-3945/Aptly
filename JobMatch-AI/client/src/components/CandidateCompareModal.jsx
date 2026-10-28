import React from 'react';
import {
  X,
  Scale,
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Calendar,
  Zap,
  TrendingUp,
  UserCheck
} from 'lucide-react';

export default function CandidateCompareModal({
  isOpen,
  onClose,
  candidates = [],
  job,
  onScheduleInterview,
}) {
  if (!isOpen || !candidates || candidates.length === 0) return null;

  // Find candidate with highest score
  const highestScorer = [...candidates].sort((a, b) => (b.aiMatchScore || 0) - (a.aiMatchScore || 0))[0];

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
          maxWidth: candidates.length > 2 ? '950px' : '780px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
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
              <Scale size={18} />
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                AI Side-by-Side Candidate Comparison
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Comparing {candidates.length} candidates for: <strong>{job?.title || 'Target Job'}</strong>
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
          {/* AI Verdict Banner */}
          <div
            style={{
              padding: '1rem 1.25rem',
              borderRadius: '8px',
              background: 'var(--accent-teal-light)',
              border: '1px solid rgba(15, 107, 92, 0.25)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ color: 'var(--accent-teal)', marginTop: '2px' }}>
              <Sparkles size={18} />
            </div>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
              <strong style={{ color: 'var(--accent-teal)' }}>AI Hiring Recommendation: </strong>
              {highestScorer ? (
                <>
                  <strong>{highestScorer.candidate?.name || highestScorer.candidateName || 'Candidate'}</strong> exhibits the strongest overall alignment ({highestScorer.aiMatchScore || 75}% match) with deep coverage in key skills. We recommend prioritizing them for the technical interview round.
                </>
              ) : (
                'Review matched skills below to determine candidate fit.'
              )}
            </div>
          </div>

          {/* Comparison Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(' + candidates.length + ', minmax(0, 1fr))',
              gap: '1rem',
            }}
          >
            {candidates.map((app, idx) => {
              const name = app.candidate?.name || app.candidateName || ('Candidate ' + (idx + 1));
              const email = app.candidate?.email || 'N/A';
              const score = app.aiMatchScore || 70;
              const isTop = app === highestScorer;

              return (
                <div
                  key={app._id || idx}
                  style={{
                    background: 'var(--bg-primary)',
                    borderRadius: '10px',
                    border: isTop ? '2px solid var(--accent-teal)' : '1px solid var(--border-default)',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                  }}
                >
                  {isTop && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '-10px',
                        right: '12px',
                        background: 'var(--accent-teal)',
                        color: '#fff',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                      }}
                    >
                      <Award size={11} />
                      TOP MATCH
                    </div>
                  )}

                  {/* Candidate Header */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {name}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      {email}
                    </div>
                  </div>

                  {/* Match Score */}
                  <div
                    style={{
                      background: 'var(--bg-card)',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      border: '1px solid var(--border-default)',
                      marginBottom: '1rem',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: score >= 75 ? 'var(--semantic-green)' : 'var(--semantic-amber)' }}>
                      {score}%
                    </div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      Overall Semantic Match
                    </div>
                  </div>

                  {/* Fit Summary */}
                  <div style={{ marginBottom: '1rem', flex: 1 }}>
                    <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                      Profile Summary
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                      {app.fitSummary || 'Semantic evaluation conducted across technical stack and experience.'}
                    </div>
                  </div>

                  {/* Matched Skills */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--accent-teal)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                      Matched Skills ({app.matchedSkills?.length || 0})
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                      {(app.matchedSkills || []).map((s, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            padding: '0.12rem 0.45rem',
                            borderRadius: '3px',
                            background: 'var(--accent-teal-light)',
                            color: 'var(--accent-teal)',
                          }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Missing Skills */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--semantic-red)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                      Missing Skills ({app.missingSkills?.length || 0})
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                      {(app.missingSkills || []).length > 0 ? (
                        app.missingSkills.map((s, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 600,
                              padding: '0.12rem 0.45rem',
                              borderRadius: '3px',
                              background: 'rgba(185, 28, 28, 0.08)',
                              color: 'var(--semantic-red)',
                            }}
                          >
                            {s}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: 'var(--semantic-green)' }}>None (100% matched)</span>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onScheduleInterview) onScheduleInterview(app);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.55rem',
                      borderRadius: '6px',
                      background: isTop ? 'var(--accent-teal)' : 'var(--bg-secondary)',
                      color: isTop ? '#fff' : 'var(--text-primary)',
                      border: isTop ? 'none' : '1px solid var(--border-default)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <Calendar size={14} />
                    Schedule Interview
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
