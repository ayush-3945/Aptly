import React from 'react';
import {
  TrendingUp,
  Sparkles,
  Award,
  BarChart3,
  Zap,
  Layers,
} from 'lucide-react';

const RecruiterAnalytics = () => {
  // Stage Distribution Data
  const stageData = [
    { label: 'Applied', count: 18, color: 'var(--accent-teal)', pct: 37.5 },
    { label: 'Shortlisted', count: 14, color: 'var(--accent-teal-mid)', pct: 29.2 },
    { label: 'Interview', count: 10, color: 'var(--semantic-amber)', pct: 20.8 },
    { label: 'Hired', count: 4, color: 'var(--semantic-green)', pct: 8.3 },
    { label: 'Archived', count: 2, color: 'var(--semantic-red)', pct: 4.2 },
  ];

  // Quality Tier Breakdown
  const qualityTiers = [
    {
      label: 'Strong Match (≥ 75%)',
      count: 30,
      percentage: 62.5,
      color: 'var(--semantic-green)',
      desc: 'High technical alignment with core required skills and experience.',
    },
    {
      label: 'Moderate Match (50% – 74%)',
      count: 14,
      percentage: 29.2,
      color: 'var(--semantic-amber)',
      desc: 'Solid foundations with 1–2 minor gaps in specific SDK or platform tools.',
    },
    {
      label: 'Low Match (< 50%)',
      count: 4,
      percentage: 8.3,
      color: 'var(--semantic-red)',
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
                letterSpacing: '0.04em',
                padding: '0.25rem 0.65rem',
                borderRadius: '4px',
                background: 'var(--accent-teal-light)',
                color: 'var(--accent-teal)',
                border: '1px solid rgba(15, 107, 92, 0.25)',
              }}
            >
              Telemetry & Insights
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Real-time Hiring Intelligence
            </span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0, color: 'var(--text-primary)', fontFamily: "'Newsreader', Georgia, serif" }}>
            Talent Pipeline Analytics & Conversion
          </h2>
        </div>

        {/* Live Funnel Badge */}
        <div
          style={{
            padding: '0.45rem 0.95rem',
            borderRadius: '4px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
          }}
        >
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--semantic-green)' }} />
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
        <div className="paper-card" style={{ padding: '1.6rem', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Pipeline Conversion Rate
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '4px',
                background: 'var(--accent-teal-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-teal)',
              }}
            >
              <TrendingUp size={17} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>58.3%</div>
            <span style={{ fontSize: '0.84rem', color: 'var(--semantic-green)', fontWeight: 600 }}>+8.2% vs industry</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.4rem', margin: 0 }}>
            Applicants reaching Shortlist or Interview stages via ATS filtering
          </p>
        </div>

        {/* AI Match Score Health */}
        <div className="paper-card" style={{ padding: '1.6rem', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              AI Match Score Health
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '4px',
                background: 'var(--accent-teal-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-teal)',
              }}
            >
              <Sparkles size={17} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent-teal)' }}>81.4%</div>
            <span style={{ fontSize: '0.84rem', color: 'var(--semantic-green)', fontWeight: 600 }}>Optimal Range</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.4rem', margin: 0 }}>
            Average semantic compatibility calculated by Gemini 2.5 Flash
          </p>
        </div>

        {/* Time-to-Shortlist Velocity */}
        <div className="paper-card" style={{ padding: '1.6rem', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              ATS Screening Velocity
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '4px',
                background: 'var(--accent-teal-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-teal)',
              }}
            >
              <Zap size={17} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>&lt; 2.5s</div>
            <span style={{ fontSize: '0.84rem', color: 'var(--semantic-green)', fontWeight: 600 }}>Real-Time</span>
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
        <div className="paper-card" style={{ padding: '2rem', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <BarChart3 size={20} color="var(--accent-teal)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', fontFamily: "'Newsreader', Georgia, serif" }}>
              Candidate Stage Distribution
            </h3>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            Visual proportion of active candidate volume across each stage of your ATS pipeline.
          </p>

          {/* Segmented Color-Coded Progress Bar */}
          <div
            style={{
              height: '18px',
              borderRadius: '4px',
              overflow: 'hidden',
              display: 'flex',
              background: 'var(--bg-secondary)',
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
                  borderRadius: '4px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-default)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '2px',
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
        <div className="paper-card" style={{ padding: '2rem', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <Award size={20} color="var(--semantic-green)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', fontFamily: "'Newsreader', Georgia, serif" }}>
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
                    height: '6px',
                    borderRadius: '3px',
                    backgroundColor: 'var(--bg-secondary)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${tier.percentage}%`,
                      backgroundColor: tier.color,
                      borderRadius: '3px',
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
      <div className="paper-card" style={{ padding: '2rem', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Layers size={20} color="var(--accent-teal)" />
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', fontFamily: "'Newsreader', Georgia, serif" }}>
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
              borderRadius: '4px',
              background: 'var(--accent-teal-light)',
              color: 'var(--accent-teal)',
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
                  padding: '0.45rem 0.85rem',
                  borderRadius: '4px',
                  background: isHigh ? 'var(--accent-teal-light)' : 'var(--bg-secondary)',
                  border: isHigh ? '1px solid rgba(15, 107, 92, 0.25)' : '1px solid var(--border-default)',
                  transition: 'var(--transition)',
                }}
              >
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: isHigh ? 'var(--accent-teal)' : 'var(--text-primary)' }}>
                  {skill.name}
                </span>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: isHigh ? 'var(--bg-card)' : 'var(--bg-card)',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '3px',
                    border: '1px solid var(--border-default)',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: isHigh ? 'var(--accent-teal)' : 'var(--text-muted)',
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
