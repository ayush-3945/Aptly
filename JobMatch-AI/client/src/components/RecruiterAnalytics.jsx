import React, { useState } from 'react';
import {
  TrendingUp,
  Sparkles,
  Users,
  Award,
  BarChart3,
  PieChart,
  Zap,
  Target,
  Layers,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

const RecruiterAnalytics = () => {
  const [selectedMetric, setSelectedMetric] = useState('all');

  // Stage Distribution Data
  const stageData = [
    { label: 'Applied', count: 18, color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.15)', pct: 37.5 },
    { label: 'Shortlisted', count: 14, color: '#818CF8', bg: 'rgba(99, 102, 241, 0.15)', pct: 29.2 },
    { label: 'Interview', count: 10, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', pct: 20.8 },
    { label: 'Hired', count: 4, color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)', pct: 8.3 },
    { label: 'Archived', count: 2, color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)', pct: 4.2 },
  ];

  // Quality Tier Breakdown
  const qualityTiers = [
    {
      label: 'Strong Match (≥ 75%)',
      count: 30,
      percentage: 62.5,
      color: '#10B981',
      desc: 'High technical alignment with core required skills and experience.',
    },
    {
      label: 'Moderate Match (50% – 74%)',
      count: 14,
      percentage: 29.2,
      color: '#F59E0B',
      desc: 'Solid foundations with 1–2 minor gaps in specific SDK or platform tools.',
    },
    {
      label: 'Low Match (< 50%)',
      count: 4,
      percentage: 8.3,
      color: '#EF4444',
      desc: 'Significant divergence from required technical stack.',
    },
  ];

  // Applicant Skill Frequency Cloud
  const skillFrequency = [
    { name: 'React', frequency: 88, inDemand: true },
    { name: 'Node.js', frequency: 78, inDemand: true },
    { name: 'REST APIs', frequency: 84, inDemand: true },
    { name: 'Express', frequency: 72, inDemand: false },
    { name: 'MongoDB', frequency: 68, inDemand: true },
    { name: 'Gemini AI', frequency: 62, inDemand: true },
    { name: 'TypeScript', frequency: 56, inDemand: false },
    { name: 'Docker', frequency: 46, inDemand: true },
    { name: 'Python', frequency: 38, inDemand: false },
    { name: 'AWS Cloud', frequency: 34, inDemand: false },
  ];

  return (
    <div className="recruiter-analytics-widget" style={{ marginTop: '3rem' }}>
      {/* Widget Section Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                padding: '0.25rem 0.65rem',
                borderRadius: '9999px',
                background: 'rgba(6, 182, 212, 0.15)',
                color: '#22D3EE',
                border: '1px solid rgba(6, 182, 212, 0.3)',
              }}
            >
              📊 Telemetry & Insights
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Real-time Hiring Intelligence
            </span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
            Talent Pipeline Analytics & Conversion
          </h2>
        </div>

        {/* Live Funnel Badge */}
        <div
          style={{
            padding: '0.45rem 0.95rem',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
          }}
        >
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
          <span>Calculated across 48 Candidate Resumes</span>
        </div>
      </div>

      {/* KPI Highlight Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        {/* Pipeline Conversion Rate */}
        <div className="card-glass" style={{ padding: '1.6rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Pipeline Conversion Rate
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#818CF8',
              }}
            >
              <TrendingUp size={17} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>58.3%</div>
            <span style={{ fontSize: '0.84rem', color: '#10B981', fontWeight: 600 }}>+8.2% vs industry</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.4rem', margin: 0 }}>
            Applicants reaching Shortlist or Interview stages via ATS filtering
          </p>
        </div>

        {/* AI Match Score Health */}
        <div className="card-glass" style={{ padding: '1.6rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              AI Match Score Health
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#F59E0B',
              }}
            >
              <Sparkles size={17} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#F59E0B' }}>81.4%</div>
            <span style={{ fontSize: '0.84rem', color: '#10B981', fontWeight: 600 }}>Optimal Range</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.4rem', margin: 0 }}>
            Average semantic compatibility calculated by Gemini 2.5 Flash
          </p>
        </div>

        {/* Time-to-Shortlist Velocity */}
        <div className="card-glass" style={{ padding: '1.6rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              ATS Screening Velocity
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10B981',
              }}
            >
              <Zap size={17} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#10B981' }}>&lt; 2.5s</div>
            <span style={{ fontSize: '0.84rem', color: '#10B981', fontWeight: 600 }}>Real-Time</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.4rem', margin: 0 }}>
            Instant PDF parsing & structured AI evaluation per candidate
          </p>
        </div>
      </div>

      {/* Main Analytics Grid: Stage Distribution & Quality Breakdown */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {/* Stage Distribution Visualizer */}
        <div className="card-glass" style={{ padding: '2rem', borderRadius: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <BarChart3 size={20} color="var(--accent-indigo)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
              Candidate Stage Distribution Bar
            </h3>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            Visual proportion of active candidate volume across each stage of your ATS pipeline.
          </p>

          {/* Segmented Color-Coded Progress Bar */}
          <div
            style={{
              height: '24px',
              borderRadius: '8px',
              overflow: 'hidden',
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.04)',
              boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.4)',
              marginBottom: '1.5rem',
            }}
          >
            {stageData.map((stage, idx) => (
              <div
                key={idx}
                style={{
                  width: `${stage.pct}%`,
                  backgroundColor: stage.color,
                  transition: 'width 0.4s ease',
                  position: 'relative',
                }}
                title={`${stage.label}: ${stage.count} candidates (${stage.pct}%)`}
              />
            ))}
          </div>

          {/* Legend Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '0.75rem',
            }}
          >
            {stageData.map((stage, idx) => (
              <div
                key={idx}
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '3px',
                    backgroundColor: stage.color,
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{stage.label}</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {stage.count}{' '}
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                      ({stage.pct}%)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quality Tier Breakdown */}
        <div className="card-glass" style={{ padding: '2rem', borderRadius: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <Award size={20} color="#10B981" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
              AI Match Quality Tiers
            </h3>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            Percentage of candidates evaluated into ATS recommendation categories.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            {qualityTiers.map((tier, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {tier.label}
                  </span>
                  <span style={{ fontSize: '0.86rem', fontWeight: 800, color: tier.color }}>
                    {tier.count} ({tier.percentage}%)
                  </span>
                </div>

                {/* Progress bar */}
                <div
                  style={{
                    height: '8px',
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${tier.percentage}%`,
                      backgroundColor: tier.color,
                      borderRadius: '9999px',
                      transition: 'width 0.5s ease',
                    }}
                  />
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                  {tier.desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Applicant Skill Frequency Cloud */}
      <div className="card-glass" style={{ padding: '2rem', borderRadius: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Layers size={20} color="var(--accent-cyan)" />
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                Candidate Skill Frequency Cloud
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Most recurring technologies detected in candidate resumes across active requisitions
              </span>
            </div>
          </div>

          <span
            style={{
              padding: '0.25rem 0.65rem',
              borderRadius: '9999px',
              background: 'rgba(99, 102, 241, 0.15)',
              color: '#818CF8',
              fontSize: '0.76rem',
              fontWeight: 600,
            }}
          >
            Top 10 Stack Keywords
          </span>
        </div>

        {/* Skill Badges Cloud */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          {skillFrequency.map((skill, idx) => {
            const isHigh = skill.frequency >= 70;
            return (
              <div
                key={idx}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.55rem 0.95rem',
                  borderRadius: '12px',
                  background: isHigh ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                  border: isHigh ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid rgba(255, 255, 255, 0.07)',
                  transition: 'var(--transition)',
                }}
              >
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {skill.name}
                </span>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: 'rgba(0, 0, 0, 0.3)',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '6px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      color: isHigh ? 'var(--accent-cyan)' : 'var(--text-muted)',
                    }}
                  >
                    {skill.frequency}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RecruiterAnalytics;
