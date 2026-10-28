import React, { useState } from 'react';
import {
  TrendingUp,
  Target,
  Clock,
  Sparkles,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Zap,
  FileText,
  Compass
} from 'lucide-react';

/**
 * SkillGapRoadmapCard - Interactive Explainable Match Breakdown & Actionable Bridge Roadmap
 */
export default function SkillGapRoadmapCard({
  scoreBreakdown,
  evaluationSource = 'ai',
  skillGapRoadmap = [],
  resumeImprovements = [],
  matchScore = 0,
  compact = false,
}) {
  const [activeTab, setActiveTab] = useState('roadmap'); // 'roadmap' | 'breakdown' | 'resume'
  const [expandedIndex, setExpandedIndex] = useState(0);

  const isFallback = evaluationSource === 'fallback' || (!scoreBreakdown?.experienceScore && !scoreBreakdown?.domainScore && !scoreBreakdown?.educationScore);
  const skillsScore = scoreBreakdown?.skillsScore ?? scoreBreakdown?.skills ?? matchScore ?? 0;
  const experienceScore = scoreBreakdown?.experienceScore ?? 0;
  const domainScore = scoreBreakdown?.domainScore ?? scoreBreakdown?.relevanceScore ?? 0;
  const educationScore = scoreBreakdown?.educationScore ?? 0;

  const roadmapItems = Array.isArray(skillGapRoadmap) && skillGapRoadmap.length > 0
    ? skillGapRoadmap
    : [
        {
          skill: 'System Architecture & Testing',
          priority: 'High',
          impact: '+12% Match Potential',
          timeToBridge: '2-3 Days',
          actionPlan: 'Deep dive into modular architecture, unit test coverage (Jest), and clean separation of concerns.',
          resource: 'Official testing best practices and patterns.',
        },
      ];

  const improvements = Array.isArray(resumeImprovements) && resumeImprovements.length > 0
    ? resumeImprovements
    : [
        'Quantify achievements with metrics (e.g. "Reduced API response times by 35% across 50k users").',
        'Lead bullet points with active engineering verbs: "Architected", "Deployed", "Engineered".',
      ];

  const getPriorityStyle = (priority) => {
    switch (String(priority).toLowerCase()) {
      case 'high':
        return {
          bg: 'rgba(185, 28, 28, 0.08)',
          border: '1px solid rgba(185, 28, 28, 0.25)',
          color: 'var(--semantic-red)',
          dot: 'var(--semantic-red)',
        };
      case 'medium':
        return {
          bg: 'rgba(180, 83, 9, 0.08)',
          border: '1px solid rgba(180, 83, 9, 0.25)',
          color: 'var(--semantic-amber)',
          dot: 'var(--semantic-amber)',
        };
      default:
        return {
          bg: 'var(--accent-teal-light)',
          border: '1px solid rgba(15, 107, 92, 0.25)',
          color: 'var(--accent-teal)',
          dot: 'var(--accent-teal)',
        };
    }
  };

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        borderRadius: '8px',
        border: '1px solid var(--border-default)',
        padding: compact ? '1rem' : '1.25rem',
        marginTop: '1rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
      }}
    >
      {/* Header with Title and Mode Switcher */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          paddingBottom: '0.85rem',
          borderBottom: '1px solid var(--border-default)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: 'var(--accent-teal-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-teal)',
            }}
          >
            <Compass size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              Skill Gap & Actionable Roadmap
              <span
                style={{
                  fontSize: '0.68rem',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '12px',
                  background: 'var(--accent-teal)',
                  color: '#fff',
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                }}
              >
                AI GENERATED
              </span>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Personalized action steps to elevate your ATS match score
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div
          style={{
            display: 'flex',
            background: 'var(--bg-secondary)',
            borderRadius: '6px',
            padding: '2px',
            border: '1px solid var(--border-default)',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('roadmap')}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: '4px',
              fontSize: '0.74rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'roadmap' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'roadmap' ? 'var(--accent-teal)' : 'var(--text-secondary)',
              boxShadow: activeTab === 'roadmap' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <Target size={13} />
            Bridge Roadmap ({roadmapItems.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('breakdown')}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: '4px',
              fontSize: '0.74rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'breakdown' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'breakdown' ? 'var(--accent-teal)' : 'var(--text-secondary)',
              boxShadow: activeTab === 'breakdown' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <TrendingUp size={13} />
            Score Factors
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('resume')}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: '4px',
              fontSize: '0.74rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'resume' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'resume' ? 'var(--accent-teal)' : 'var(--text-secondary)',
              boxShadow: activeTab === 'resume' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <Sparkles size={13} />
            ATS Roast
          </button>
        </div>
      </div>

      {/* Tab 1: Roadmap Steps */}
      {activeTab === 'roadmap' && (
        <div style={{ marginTop: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {roadmapItems.map((item, idx) => {
            const pStyle = getPriorityStyle(item.priority);
            const isExpanded = expandedIndex === idx;

            return (
              <div
                key={idx}
                style={{
                  border: '1px solid var(--border-default)',
                  borderRadius: '6px',
                  background: isExpanded ? 'var(--bg-primary)' : 'var(--bg-card)',
                  overflow: 'hidden',
                  transition: 'all 0.15s ease',
                }}
              >
                {/* Accordion Row Header */}
                <div
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.7rem 0.85rem',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: pStyle.dot,
                      }}
                    />
                    <div>
                      <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {item.skill}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        padding: '0.12rem 0.45rem',
                        borderRadius: '3px',
                        background: pStyle.bg,
                        color: pStyle.color,
                        border: pStyle.border,
                      }}
                    >
                      {item.priority || 'Medium'} Priority
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: 'var(--accent-teal)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                      }}
                    >
                      <Zap size={12} />
                      {item.impact || '+10% Boost'}
                    </span>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                      }}
                    >
                      <Clock size={12} />
                      {item.timeToBridge || '2-3 Days'}
                    </span>
                    {isExpanded ? <ChevronUp size={15} color="var(--text-muted)" /> : <ChevronDown size={15} color="var(--text-muted)" />}
                  </div>
                </div>

                {/* Expanded Action Plan Details */}
                {isExpanded && (
                  <div
                    style={{
                      padding: '0 0.85rem 0.85rem 0.85rem',
                      borderTop: '1px dashed var(--border-default)',
                      paddingTop: '0.65rem',
                    }}
                  >
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Recommended Action: </strong>
                      {item.actionPlan}
                    </div>
                    {item.resource && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          fontSize: '0.72rem',
                          color: 'var(--accent-teal)',
                          fontWeight: 500,
                          background: 'var(--accent-teal-light)',
                          padding: '0.35rem 0.6rem',
                          borderRadius: '4px',
                        }}
                      >
                        <BookOpen size={13} />
                        <span>Recommended Guide: {item.resource}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Score Factors Breakdown */}
      {activeTab === 'breakdown' && (
        <div style={{ marginTop: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {isFallback ? (
            <>
              <div
                style={{
                  padding: '0.55rem 0.75rem',
                  borderRadius: '6px',
                  background: 'rgba(0,0,0,0.03)',
                  border: '1px solid var(--border-default)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.76rem',
                  color: 'var(--text-secondary)',
                }}
              >
                <span
                  style={{
                    padding: '0.12rem 0.45rem',
                    borderRadius: '3px',
                    background: 'var(--accent-teal-light)',
                    color: 'var(--accent-teal)',
                    fontWeight: 700,
                    fontSize: '0.7rem',
                  }}
                >
                  Keyword result
                </span>
                <span>Keyword-based result (AI was unavailable)</span>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Technical Skills Coverage (100% of Match)</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent-teal)' }}>{skillsScore}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${skillsScore}%`,
                      height: '100%',
                      background: 'var(--accent-teal)',
                      borderRadius: '3px',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>

              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0, fontStyle: 'italic' }}>
                Experience, domain relevance, and education sub-scores require full AI analysis and are not estimated when the fallback matcher is active.
              </p>
            </>
          ) : (
            <>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Technical Skills Coverage (40%)</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent-teal)' }}>{skillsScore}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${skillsScore}%`,
                      height: '100%',
                      background: 'var(--accent-teal)',
                      borderRadius: '3px',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Seniority & Experience Match (30%)</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent-teal)' }}>{experienceScore}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${experienceScore}%`,
                      height: '100%',
                      background: 'var(--accent-teal-mid)',
                      borderRadius: '3px',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Domain & Tech Stack Relevance (20%)</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent-teal)' }}>{domainScore}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${domainScore}%`,
                      height: '100%',
                      background: 'var(--semantic-green)',
                      borderRadius: '3px',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Education & Credentials (10%)</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent-teal)' }}>{educationScore}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${educationScore}%`,
                      height: '100%',
                      background: 'var(--accent-teal)',
                      borderRadius: '3px',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab 3: Resume Roast / ATS Improvements */}
      {activeTab === 'resume' && (
        <div style={{ marginTop: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {improvements.map((tip, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.6rem',
                padding: '0.65rem 0.75rem',
                borderRadius: '6px',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-default)',
              }}
            >
              <div style={{ marginTop: '2px', color: 'var(--semantic-amber)' }}>
                <CheckCircle2 size={15} />
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                {tip}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
