import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  RefreshCw,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  ArrowRight,
  Filter,
  BarChart2,
  Award,
} from 'lucide-react';
import api from '../services/api';

const RecruiterAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hoveredWeek, setHoveredWeek] = useState(null);

  // Fetch Pipeline Analytics from Single Source of Truth (/api/analytics/overview)
  const fetchAnalytics = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await api.get('/analytics/overview');
      if (res.data && res.data.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.warn('[RecruiterAnalytics] Failed to fetch live analytics, using verified sample:', err.message);
      // Consistent sample data fallback if server is offline
      setData({
        isSampleData: true,
        totalApplicants: 24,
        totalJobs: 3,
        stageCounts: { applied: 8, shortlisted: 6, interview: 6, offer: 2, hired: 2, rejected: 0 },
        stageDistribution: [
          { stage: 'applied', label: 'Applied', count: 8, pct: 33.3, color: '#0F766E' },
          { stage: 'shortlisted', label: 'Shortlisted', count: 6, pct: 25.0, color: '#0D9488' },
          { stage: 'interview', label: 'Interview', count: 6, pct: 25.0, color: '#B45309' },
          { stage: 'offer', label: 'Offer', count: 2, pct: 8.3, color: '#2D7A3A' },
          { stage: 'hired', label: 'Hired', count: 2, pct: 8.3, color: '#15803D' },
          { stage: 'rejected', label: 'Rejected', count: 0, pct: 0.0, color: '#B91C1C' },
        ],
        funnelSteps: [
          { stage: 'Applied', count: 24, pct: 100, dropOff: 0 },
          { stage: 'Shortlisted', count: 16, pct: 66.7, dropOff: 33.3 },
          { stage: 'Interview', count: 10, pct: 41.7, dropOff: 37.5 },
          { stage: 'Offer', count: 4, pct: 16.7, dropOff: 60.0 },
          { stage: 'Hired', count: 2, pct: 8.3, dropOff: 50.0 },
        ],
        qualityTiers: [
          {
            tier: 'strong',
            label: 'Strong Match (≥ 75%)',
            count: 12,
            percentage: 50.0,
            color: '#2D7A3A',
            desc: 'High technical alignment with core required skills and experience.',
          },
          {
            tier: 'moderate',
            label: 'Moderate Match (50% – 74%)',
            count: 9,
            percentage: 37.5,
            color: '#B45309',
            desc: 'Solid foundations with minor gaps in specific platform tools.',
          },
          {
            tier: 'low',
            label: 'Low Match (< 50%)',
            count: 3,
            percentage: 12.5,
            color: '#B91C1C',
            desc: 'Significant divergence from required technical stack.',
          },
        ],
        scoreMetrics: {
          averageMatchScore: 82.5,
          aiEvaluationCount: 20,
          fallbackEvaluationCount: 4,
          totalScored: 24,
        },
        topRequiredSkills: [
          { skill: 'React', jobCount: 3, candidateMatches: 21, percentOfJobs: 100 },
          { skill: 'Node.js', jobCount: 3, candidateMatches: 19, percentOfJobs: 100 },
          { skill: 'MongoDB', jobCount: 2, candidateMatches: 15, percentOfJobs: 67 },
          { skill: 'TypeScript', jobCount: 2, candidateMatches: 13, percentOfJobs: 67 },
          { skill: 'Docker', jobCount: 2, candidateMatches: 11, percentOfJobs: 67 },
          { skill: 'REST API', jobCount: 1, candidateMatches: 18, percentOfJobs: 33 },
        ],
        applicationsPerWeek: [
          { week: 'W1', count: 1, label: '7 wks ago' },
          { week: 'W2', count: 2, label: '6 wks ago' },
          { week: 'W3', count: 2, label: '5 wks ago' },
          { week: 'W4', count: 3, label: '4 wks ago' },
          { week: 'W5', count: 4, label: '3 wks ago' },
          { week: 'W6', count: 3, label: '2 wks ago' },
          { week: 'W7', count: 4, label: 'Last wk' },
          { week: 'W8', count: 5, label: 'Current' },
        ],
        avgDaysToHire: 14,
        conversionRate: 8.3,
        pipelineHealth: {
          status: 'Good',
          rule: 'Derived from AI Match Score (82.5%) and conversion rate (8.3%). Rule: Excellent if score >= 80% & conversion >= 15%, Good if score >= 70%, Fair if score >= 55%, Needs Attention if score < 55%.',
        },
        bottleneck: {
          stage: 'Interview → Offer',
          dropOffRate: 60.0,
          previousStage: 'Interview',
          currentStage: 'Offer',
          previousCount: 10,
          currentCount: 4,
        },
        strategicRecommendations: [
          {
            priority: 'high',
            title: 'Funnel Friction: Interview → Offer (60.0% drop)',
            description: 'Candidate count drops from 10 at Interview to 4 at Offer (60.0% drop-off). Evaluate interview scorecard criteria and turnaround time.',
            label: 'Rule-based tip',
          },
          {
            priority: 'medium',
            title: 'Evaluation Integrity: 4 Fallback Evaluations',
            description: '4 of 24 applications were evaluated using keyword matching fallback while AI was unreachable. Consider re-evaluating when Gemini AI is active.',
            label: 'Rule-based tip',
          },
          {
            priority: 'low',
            title: 'Core Stack Alignment: React & Node.js in 100% of Roles',
            description: 'React and Node.js are required across all 3 open requisitions. Maintain high screening weight on modern component lifecycle and backend patterns.',
            label: 'Rule-based tip',
          },
        ],
        lastUpdated: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Format updated timestamp
  const formatTime = (isoString) => {
    if (!isoString) return 'Just now';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Just now';
    }
  };

  // Pipeline Health badge colors
  const getHealthBadge = (healthStatus) => {
    const h = (typeof healthStatus === 'string' ? healthStatus : healthStatus?.status || 'Good').toLowerCase();
    if (h === 'excellent') {
      return { label: 'Excellent', color: '#2D7A3A', bg: 'rgba(45, 122, 58, 0.1)', border: 'rgba(45, 122, 58, 0.25)' };
    }
    if (h === 'good') {
      return { label: 'Good', color: '#0F766E', bg: 'rgba(15, 118, 110, 0.1)', border: 'rgba(15, 118, 110, 0.25)' };
    }
    if (h === 'fair') {
      return { label: 'Fair', color: '#B45309', bg: 'rgba(180, 83, 9, 0.1)', border: 'rgba(180, 83, 9, 0.25)' };
    }
    return { label: 'Needs Attention', color: '#B91C1C', bg: 'rgba(185, 28, 28, 0.1)', border: 'rgba(185, 28, 28, 0.25)' };
  };

  // Priority badge formatting for recommendations
  const getPriorityBadge = (priority) => {
    const p = (priority || 'medium').toLowerCase();
    if (p === 'high') {
      return { dot: '#B91C1C', label: 'High Priority', color: '#B91C1C', bg: 'rgba(185, 28, 28, 0.08)' };
    }
    if (p === 'low') {
      return { dot: '#0F766E', label: 'Low Priority', color: '#0F766E', bg: 'rgba(15, 118, 110, 0.08)' };
    }
    return { dot: '#B45309', label: 'Medium Priority', color: '#B45309', bg: 'rgba(180, 83, 9, 0.08)' };
  };

  // ----------------------------------------------------
  // SKELETON LOADER STATE
  // ----------------------------------------------------
  if (loading && !data) {
    return (
      <div className="recruiter-analytics-widget" style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <div className="skeleton-shimmer" style={{ width: '220px', height: '18px', marginBottom: '0.5rem' }} />
            <div className="skeleton-shimmer" style={{ width: '360px', height: '32px' }} />
          </div>
          <div className="skeleton-shimmer" style={{ width: '180px', height: '38px' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton-shimmer" style={{ height: '140px', borderRadius: '8px' }} />
          ))}
        </div>

        <div className="skeleton-shimmer" style={{ height: '240px', borderRadius: '8px', marginBottom: '2.5rem' }} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-shimmer" style={{ height: '300px', borderRadius: '8px' }} />
          ))}
        </div>
      </div>
    );
  }

  const overview = data;
  const healthBadge = getHealthBadge(overview.pipelineHealth);
  const funnel = overview.funnelSteps || [];

  // Conversion rate display
  const displayConversionRate =
    overview.conversionRate > 0
      ? `${overview.conversionRate % 1 === 0 ? overview.conversionRate.toFixed(0) : overview.conversionRate.toFixed(1)}%`
      : '—';

  // Weekly timeline max calculation for SVG line chart
  const weeklyTimeline = overview.applicationsPerWeek || [];
  const maxWeeklyCount = Math.max(...weeklyTimeline.map((w) => w.count), 1);
  const chartWidth = 600;
  const chartHeight = 160;
  const paddingX = 40;
  const paddingY = 25;

  const points = weeklyTimeline.map((item, index) => {
    const x = paddingX + (index / Math.max(1, weeklyTimeline.length - 1)) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - (item.count / maxWeeklyCount) * (chartHeight - paddingY * 2);
    return { x, y, count: item.count, week: item.week, label: item.label };
  });

  const pathD = points.reduce((acc, p, idx) => {
    if (idx === 0) return `M ${p.x} ${p.y}`;
    const prev = points[idx - 1];
    const cpX1 = prev.x + (p.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (p.x - prev.x) / 2;
    const cpY2 = p.y;
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p.x} ${p.y}`;
  }, '');

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`
    : '';

  const aiScore = overview.scoreMetrics?.averageMatchScore;
  const aiCount = overview.scoreMetrics?.aiEvaluationCount ?? 0;
  const fallbackCount = overview.scoreMetrics?.fallbackEvaluationCount ?? 0;

  return (
    <div className="recruiter-analytics-widget">
      {/* =========================================================================
          SECTION 1 — PIPELINE HEALTH HEADER
         ========================================================================= */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1.25rem',
          marginBottom: '2rem',
          paddingBottom: '1.5rem',
          borderBottom: '1px solid var(--border-default)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.01em',
                padding: '0.2rem 0.6rem',
                borderRadius: '4px',
                background: 'var(--accent-teal-light)',
                color: 'var(--accent-teal)',
                border: '1px solid rgba(15, 107, 92, 0.25)',
              }}
            >
              Pipeline Intelligence
            </span>

            {/* Requirement 8: Sample data badge */}
            {overview.isSampleData && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '4px',
                  background: 'rgba(180, 83, 9, 0.1)',
                  color: '#B45309',
                  border: '1px solid rgba(180, 83, 9, 0.3)',
                }}
                title="Telemetry rendered from seeded sample portfolio"
              >
                Sample data
              </span>
            )}

            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Updated {formatTime(overview.lastUpdated)}
            </span>
          </div>

          <h2
            style={{
              fontSize: '1.85rem',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              margin: 0,
              color: 'var(--text-primary)',
              fontFamily: "'Newsreader', Georgia, serif",
            }}
          >
            Talent Pipeline Intelligence
          </h2>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
            Single source of truth metrics aggregated from active candidate applications.
          </p>
        </div>

        {/* Right Action: Health Status Badge + Refresh Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Pipeline Health Badge with Documented Rule Tooltip */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.45rem 0.9rem',
              borderRadius: '6px',
              background: healthBadge.bg,
              border: `1px solid ${healthBadge.border}`,
              color: healthBadge.color,
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'help',
            }}
            title={typeof overview.pipelineHealth === 'object' ? overview.pipelineHealth.rule : 'Documented rule: Excellent (Score ≥ 80% & Conversion ≥ 15%), Good (Score ≥ 70%), Fair (Score ≥ 55%), Needs Attention (< 55%)'}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: healthBadge.color,
                boxShadow: `0 0 6px ${healthBadge.color}`,
              }}
            />
            <span>Pipeline Health: {healthBadge.label}</span>
          </div>

          {/* Refresh Insights Button */}
          <button
            type="button"
            onClick={() => fetchAnalytics(true)}
            disabled={refreshing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.45rem 0.95rem',
              borderRadius: '6px',
              background: '#FFFFFF',
              border: '1px solid var(--accent-teal)',
              color: 'var(--accent-teal)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: refreshing ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}
            title="Re-aggregate pipeline metrics directly from database"
          >
            <RefreshCw size={13} className={refreshing ? 'spin' : ''} />
            <span>{refreshing ? 'Aggregating...' : 'Refresh Metrics'}</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          SECTION 2 — KEY METRICS ROW (4 Cards with Serif Numbers & Accents)
         ========================================================================= */}
      <div
        className="analytics-metrics-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
        }}
      >
        {/* Metric 1: Pipeline Conversion Rate */}
        <div
          className="paper-card"
          style={{
            padding: '1.5rem',
            borderRadius: '8px',
            background: '#FFFFFF',
            border: '1px solid var(--border-default)',
            borderLeft: '4px solid var(--accent-teal)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.02em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Pipeline Conversion Rate
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
              <div style={{ fontSize: '2.4rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: "'Newsreader', Georgia, serif" }}>
                {displayConversionRate}
              </div>
            </div>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.75rem', margin: 0 }}>
            {overview.stageCounts?.hired ?? overview.funnelSteps?.[overview.funnelSteps.length - 1]?.count ?? 0} hired out of {overview.totalApplicants} total applicants
          </p>
        </div>

        {/* Metric 2: AI Match Score Health (Only AI source records) */}
        <div
          className="paper-card"
          style={{
            padding: '1.5rem',
            borderRadius: '8px',
            background: '#FFFFFF',
            border: '1px solid var(--border-default)',
            borderLeft: '4px solid var(--accent-teal)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.02em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Average AI Match Score
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
              <div style={{ fontSize: '2.4rem', fontWeight: 700, color: 'var(--accent-teal)', fontFamily: "'Newsreader', Georgia, serif" }}>
                {aiScore !== null && aiScore !== undefined ? `${aiScore}%` : '—'}
              </div>
              <span style={{ fontSize: '0.8rem', color: '#2D7A3A', fontWeight: 600 }}>
                AI Evaluated
              </span>
            </div>

            {/* Distribution Mini-Bar */}
            <div
              style={{
                display: 'flex',
                height: '7px',
                borderRadius: '4px',
                overflow: 'hidden',
                marginTop: '0.65rem',
                background: '#ECEAE4',
              }}
              title={`Strong: ${overview.qualityTiers?.[0]?.percentage || 50}%, Moderate: ${overview.qualityTiers?.[1]?.percentage || 37.5}%, Low: ${overview.qualityTiers?.[2]?.percentage || 12.5}%`}
            >
              <div style={{ width: `${overview.qualityTiers?.[0]?.percentage || 50}%`, background: '#2D7A3A' }} />
              <div style={{ width: `${overview.qualityTiers?.[1]?.percentage || 37.5}%`, background: '#B45309' }} />
              <div style={{ width: `${overview.qualityTiers?.[2]?.percentage || 12.5}%`, background: '#B91C1C' }} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            <span>Strong: {overview.qualityTiers?.[0]?.count || 0}</span>
            <span>Moderate: {overview.qualityTiers?.[1]?.count || 0}</span>
            <span>Low: {overview.qualityTiers?.[2]?.count || 0}</span>
          </div>
        </div>

        {/* Metric 3: Match Engine Mix (Verifiable AI vs Fallback counts) */}
        <div
          className="paper-card"
          style={{
            padding: '1.5rem',
            borderRadius: '8px',
            background: '#FFFFFF',
            border: '1px solid var(--border-default)',
            borderLeft: '4px solid var(--accent-teal)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.02em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Evaluation Source Mix
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
              <div style={{ fontSize: '2.4rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: "'Newsreader', Georgia, serif" }}>
                {aiCount}{' '}
                <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--semantic-green)' }}>AI</span>
                <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', margin: '0 0.35rem' }}>/</span>
                <span style={{ color: 'var(--text-secondary)' }}>{fallbackCount}</span>{' '}
                <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--semantic-amber)' }}>Fallback</span>
              </div>
            </div>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.75rem', margin: 0 }}>
            {fallbackCount > 0 ? `${fallbackCount} evaluation(s) ran via keyword fallback` : 'All candidate resumes evaluated by Gemini AI'}
          </p>
        </div>

        {/* Metric 4: Real Avg Days to Hire (Verifiable or null) */}
        <div
          className="paper-card"
          style={{
            padding: '1.5rem',
            borderRadius: '8px',
            background: '#FFFFFF',
            border: '1px solid var(--border-default)',
            borderLeft: '4px solid var(--accent-teal)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.02em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Avg Days to Hire
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
              <div style={{ fontSize: '2.4rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: "'Newsreader', Georgia, serif" }}>
                {overview.avgDaysToHire !== null && overview.avgDaysToHire !== undefined ? (
                  <>
                    {overview.avgDaysToHire}{' '}
                    <span style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-muted)' }}>days</span>
                  </>
                ) : (
                  <span style={{ fontSize: '1.8rem', color: 'var(--text-muted)' }}>—</span>
                )}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
            <Clock size={13} />
            <span>
              {overview.avgDaysToHire !== null && overview.avgDaysToHire !== undefined
                ? 'Computed from application to hire timestamps'
                : 'No hire history recorded in portfolio yet'}
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 3 — BOTTLENECK ALERT (Strictly correct consecutive stages)
         ========================================================================= */}
      {overview.bottleneck && (
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderRadius: '8px',
            background: 'rgba(180, 83, 9, 0.04)',
            border: '1px solid rgba(180, 83, 9, 0.25)',
            borderLeft: '5px solid #B45309',
            marginBottom: '2.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <div style={{ color: '#B45309', marginTop: '0.15rem' }}>
              <AlertTriangle size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#92400E' }}>
                  Pipeline Bottleneck Alert: {overview.bottleneck.stage} Stage
                </span>
                <span
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '4px',
                    background: 'rgba(180, 83, 9, 0.12)',
                    color: '#B45309',
                  }}
                >
                  {overview.bottleneck.dropOffRate}% Candidate Drop-Off
                </span>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 0.5rem 0' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Why it happens:</strong> Candidate attrition is highest transitioning between{' '}
                <strong>{overview.bottleneck.previousStage || 'previous stage'}</strong> ({overview.bottleneck.previousCount ?? '—'} candidates) and{' '}
                <strong>{overview.bottleneck.currentStage || 'current stage'}</strong> ({overview.bottleneck.currentCount ?? '—'} candidates).
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--accent-teal)', fontWeight: 600 }}>
                <ArrowRight size={14} />
                <span>Strategic Fix: Audit evaluation rubrics and reduce interview turnaround latency between consecutive stages.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 4 — CHARTS ROW (Funnel, Quality Tiers, Skill Heatmap)
         ========================================================================= */}
      <div
        className="analytics-charts-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2.5rem',
        }}
      >
        {/* Chart 1: True Inverted Funnel Visualization */}
        <div
          className="paper-card"
          style={{
            padding: '1.75rem',
            borderRadius: '8px',
            background: '#FFFFFF',
            border: '1px solid var(--border-default)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <Filter size={18} color="var(--accent-teal)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', fontFamily: "'Newsreader', Georgia, serif" }}>
                Hiring Funnel Conversion
              </h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 1.5rem 0' }}>
              Consecutive stage-by-stage attrition across active requisitions.
            </p>

            {/* Funnel bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', alignItems: 'center' }}>
              {funnel.map((step, idx) => {
                const widths = ['100%', '86%', '72%', '58%', '46%'];
                const bgColors = ['#0F766E', '#115E59', '#14B8A6', '#0D9488', '#2D7A3A'];
                const width = widths[idx] || '50%';

                return (
                  <div
                    key={step.stage}
                    style={{
                      width,
                      transition: 'all 0.2s ease',
                      borderRadius: '6px',
                      background: bgColors[idx] || '#0F766E',
                      color: '#FFFFFF',
                      padding: '0.6rem 0.85rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                    }}
                    title={`${step.stage}: ${step.count} candidates (${step.pct}% through, -${step.dropOff}% drop-off from previous)`}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>{idx + 1}.</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{step.stage}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ fontSize: '0.74rem', opacity: 0.9 }}>
                        {idx > 0 && `-${step.dropOff}% drop`}
                      </span>
                      <span style={{ fontSize: '0.86rem', fontWeight: 800, background: 'rgba(255,255,255,0.2)', padding: '0.1rem 0.45rem', borderRadius: '4px' }}>
                        {step.count}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-default)', fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
            <span>Top of funnel: {funnel[0]?.count || overview.totalApplicants} entries</span>
            <span style={{ color: '#2D7A3A', fontWeight: 600 }}>
              Hired: {funnel[funnel.length - 1]?.count || 0} ({displayConversionRate})
            </span>
          </div>
        </div>

        {/* Chart 2: AI Match Quality Tiers */}
        <div
          className="paper-card"
          style={{
            padding: '1.75rem',
            borderRadius: '8px',
            background: '#FFFFFF',
            border: '1px solid var(--border-default)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <Award size={18} color="var(--accent-teal)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', fontFamily: "'Newsreader', Georgia, serif" }}>
                Match Quality Tiers
              </h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 1.5rem 0' }}>
              Scored distribution across evaluated applications.
            </p>

            {/* Quality Tier Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              {overview.qualityTiers?.map((tier) => (
                <div key={tier.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {tier.label}
                    </span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: tier.color }}>
                      {tier.count} candidates ({tier.percentage}%)
                    </span>
                  </div>

                  <div
                    style={{
                      height: '9px',
                      borderRadius: '5px',
                      background: '#ECEAE4',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${tier.percentage}%`,
                        background: tier.color,
                        borderRadius: '5px',
                        transition: 'width 0.6s ease',
                      }}
                    />
                  </div>

                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                    {tier.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-default)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Average AI compatibility: <strong style={{ color: 'var(--text-primary)' }}>{aiScore ?? '—'}%</strong>{' '}
            <span style={{ color: 'var(--text-muted)' }}>({aiCount} AI reviews, {fallbackCount} fallback)</span>
          </div>
        </div>

        {/* Chart 3: Skill Demand Breakdown */}
        <div
          className="paper-card"
          style={{
            padding: '1.75rem',
            borderRadius: '8px',
            background: '#FFFFFF',
            border: '1px solid var(--border-default)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <BarChart2 size={18} color="var(--accent-teal)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', fontFamily: "'Newsreader', Georgia, serif" }}>
                Top Required Skills
              </h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 1.25rem 0' }}>
              Required across active job requisitions & matched candidates.
            </p>

            {/* Horizontal Bar Chart for Skills */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {overview.topRequiredSkills?.slice(0, 6).map((s) => {
                const pct = s.percentOfJobs || 50;

                return (
                  <div key={s.skill}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {s.skill}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {s.jobCount} role(s) • {s.candidateMatches} matched
                      </span>
                    </div>
                    <div
                      style={{
                        height: '7px',
                        borderRadius: '3.5px',
                        background: '#ECEAE4',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          background: 'var(--accent-teal)',
                          borderRadius: '3.5px',
                          transition: 'width 0.5s ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-default)', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            Aggregated directly from open role specs and applicant profiles
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 5 — STRATEGIC RECOMMENDATIONS & TIMELINE (Rule-based Tips)
         ========================================================================= */}
      <div
        className="paper-card"
        style={{
          padding: '2rem',
          borderRadius: '8px',
          background: '#FFFFFF',
          border: '1px solid var(--border-default)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.5rem' }}>
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
            <Lightbulb size={17} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', fontFamily: "'Newsreader', Georgia, serif" }}>
              Strategic Recommendations
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Deterministic insights synthesized from pipeline metrics
            </span>
          </div>
        </div>

        {/* 3 Prioritized Recommendation Cards */}
        <div
          className="analytics-recommendations-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2.5rem',
          }}
        >
          {overview.strategicRecommendations?.map((rec, index) => {
            const priorityBadge = getPriorityBadge(rec.priority);
            return (
              <div
                key={index}
                style={{
                  padding: '1.35rem',
                  borderRadius: '6px',
                  background: '#FAF9F5',
                  border: '1px solid var(--border-default)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.85rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: priorityBadge.dot,
                        }}
                      />
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          background: priorityBadge.bg,
                          color: priorityBadge.color,
                        }}
                      >
                        {priorityBadge.label}
                      </span>
                    </div>

                    {/* Rule-based tip badge */}
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        padding: '0.12rem 0.45rem',
                        borderRadius: '3px',
                        background: 'rgba(15, 107, 92, 0.08)',
                        color: 'var(--accent-teal)',
                        border: '1px solid rgba(15, 107, 92, 0.2)',
                      }}
                    >
                      Rule-based tip
                    </span>
                  </div>

                  <h4 style={{ fontSize: '0.94rem', fontWeight: 700, margin: '0 0 0.4rem 0', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    {rec.title}
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    {rec.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Hiring Inflow Velocity (SVG Line & Area Chart) */}
        <div style={{ paddingTop: '1.75rem', borderTop: '1px solid var(--border-default)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', fontFamily: "'Newsreader', Georgia, serif" }}>
                Application Inflow Velocity (Last 8 Weeks)
              </h4>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Weekly submission volume recorded from candidate application timestamps
              </span>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#2D7A3A', fontWeight: 600 }}>
              Peak Volume: {Math.max(...weeklyTimeline.map((w) => w.count), 0)} resumes/wk
            </div>
          </div>

          {/* SVG Line / Area Graph */}
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              style={{ width: '100%', maxHeight: '200px', overflow: 'visible' }}
            >
              <defs>
                <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0F766E" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#0F766E" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              {[0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = chartHeight - paddingY - ratio * (chartHeight - paddingY * 2);
                return (
                  <line
                    key={ratio}
                    x1={paddingX}
                    y1={y}
                    x2={chartWidth - paddingX}
                    y2={y}
                    stroke="var(--border-default)"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Area fill under the line */}
              {areaD && <path d={areaD} fill="url(#velocityGradient)" />}

              {/* Line path */}
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="var(--accent-teal)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Data points */}
              {points.map((p, idx) => (
                <g key={idx}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={hoveredWeek === idx ? 6 : 4}
                    fill="#FFFFFF"
                    stroke="var(--accent-teal)"
                    strokeWidth="2.5"
                    style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                    onMouseEnter={() => setHoveredWeek(idx)}
                    onMouseLeave={() => setHoveredWeek(null)}
                  />

                  {/* Tooltip on hover */}
                  {hoveredWeek === idx && (
                    <g>
                      <rect
                        x={p.x - 30}
                        y={p.y - 32}
                        width="60"
                        height="22"
                        rx="4"
                        fill="var(--text-primary)"
                      />
                      <text
                        x={p.x}
                        y={p.y - 18}
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="10"
                        fontWeight="bold"
                      >
                        {p.count} apps
                      </text>
                    </g>
                  )}

                  {/* X-axis week label */}
                  <text
                    x={p.x}
                    y={chartHeight - 6}
                    textAnchor="middle"
                    fill="var(--text-muted)"
                    fontSize="10"
                  >
                    {p.week}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterAnalytics;
