import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  TrendingUp,
  RefreshCw,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  ShieldAlert,
  ArrowRight,
  Filter,
  BarChart2,
  Award,
  ChevronRight,
} from 'lucide-react';
import api from '../services/api';

const RecruiterAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hoveredWeek, setHoveredWeek] = useState(null);

  // Fetch Pipeline Analytics & AI Insights from API
  const fetchAnalytics = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await api.get('/analytics/insights');
      if (res.data && res.data.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.warn('[RecruiterAnalytics] Failed to fetch live analytics, using fallback:', err.message);
      // Fallback data is automatically returned by backend controller, but in case of network offline:
      setData({
        aggregatedData: {
          totalApplicants: 48,
          totalJobs: 4,
          conversionRate: 58.3,
          conversionTrend: '+8.2% vs last week',
          avgAiMatchScore: 81.4,
          screeningVelocity: '< 2.5s',
          avgDaysToHire: 18,
          industryAvgDays: 23,
          stageDistribution: [
            { stage: 'applied', label: 'Applied', count: 18, pct: 37.5, color: '#0F766E' },
            { stage: 'shortlisted', label: 'Shortlisted', count: 14, pct: 29.2, color: '#0D9488' },
            { stage: 'interview', label: 'Interview', count: 10, pct: 20.8, color: '#B45309' },
            { stage: 'offer', label: 'Offer', count: 4, pct: 8.3, color: '#2D7A3A' },
            { stage: 'hired', label: 'Hired', count: 4, pct: 8.3, color: '#15803D' },
            { stage: 'rejected', label: 'Rejected', count: 2, pct: 4.2, color: '#B91C1C' },
          ],
          funnelSteps: [
            { stage: 'Applied', count: 48, pct: 100, dropOff: 0 },
            { stage: 'Shortlisted', count: 32, pct: 66.7, dropOff: 33.3 },
            { stage: 'Interview', count: 18, pct: 37.5, dropOff: 43.8 },
            { stage: 'Offer', count: 6, pct: 12.5, dropOff: 66.7 },
            { stage: 'Hired', count: 4, pct: 8.3, dropOff: 33.3 },
          ],
          qualityTiers: [
            {
              tier: 'strong',
              label: 'Strong Match (≥ 75%)',
              count: 30,
              percentage: 62.5,
              color: '#2D7A3A',
              desc: 'High technical alignment with core required skills and experience.',
            },
            {
              tier: 'moderate',
              label: 'Moderate Match (50% – 74%)',
              count: 14,
              percentage: 29.2,
              color: '#B45309',
              desc: 'Solid foundations with 1–2 minor gaps in specific platform tools.',
            },
            {
              tier: 'low',
              label: 'Low Match (< 50%)',
              count: 4,
              percentage: 8.3,
              color: '#B91C1C',
              desc: 'Significant divergence from required technical stack.',
            },
          ],
          topSkills: [
            { skill: 'React', count: 42, frequency: 88, demandScore: 94, trend: 'rising' },
            { skill: 'Node.js', count: 37, frequency: 78, demandScore: 88, trend: 'stable' },
            { skill: 'REST API', count: 40, frequency: 84, demandScore: 86, trend: 'stable' },
            { skill: 'Gemini AI / LLMs', count: 30, frequency: 62, demandScore: 92, trend: 'rising' },
            { skill: 'MongoDB', count: 33, frequency: 68, demandScore: 78, trend: 'stable' },
            { skill: 'TypeScript', count: 27, frequency: 56, demandScore: 84, trend: 'rising' },
            { skill: 'Docker', count: 22, frequency: 46, demandScore: 72, trend: 'stable' },
            { skill: 'Python', count: 18, frequency: 38, demandScore: 68, trend: 'declining' },
          ],
          weeklyTimeline: [
            { week: 'W1', count: 3, label: '7 wks ago' },
            { week: 'W2', count: 5, label: '6 wks ago' },
            { week: 'W3', count: 4, label: '5 wks ago' },
            { week: 'W4', count: 7, label: '4 wks ago' },
            { week: 'W5', count: 6, label: '3 wks ago' },
            { week: 'W6', count: 9, label: '2 wks ago' },
            { week: 'W7', count: 11, label: 'Last wk' },
            { week: 'W8', count: 13, label: 'Current' },
          ],
        },
        aiInsights: {
          pipelineHealth: 'Good',
          keyInsights: [
            {
              type: 'success',
              title: 'High Semantic Match Quality',
              description: '62.5% of applicants align closely with core technical stack requirements.',
              metric: '30 Strong Matches',
              action: 'Fast-track strong matches directly to technical screens within 48h to secure acceptance.',
            },
            {
              type: 'opportunity',
              title: 'Surging Demand for Gemini AI & LLM Skills',
              description: 'Candidate requisitions specifying LLM integration and structured outputs convert 35% faster.',
              metric: '92% Demand Index',
              action: 'Incorporate AI architectural questions in the technical interview scorecard.',
            },
            {
              type: 'warning',
              title: 'Interview-to-Offer Funnel Friction',
              description: 'Candidate drop-off peaks between technical interview and final offer stage (43.8% drop-off).',
              metric: '43.8% Drop-Off',
              action: 'Standardize interview rubric and consolidate take-home assessments into live pairing.',
            },
            {
              type: 'risk',
              title: 'Declining Legacy Stack Alignment',
              description: 'Fewer candidates possess legacy Python and standalone REST competencies without TypeScript.',
              metric: '18% Lower Volume',
              action: 'Offer onboarding micro-trainings or adjust senior criteria to evaluate polyglot fundamentals.',
            },
          ],
          bottleneck: {
            stage: 'Interview → Offer Stage',
            dropOffRate: 43.8,
            reason: 'Multi-round technical interview processes without clear turnaround expectations increase candidate drop-off.',
            suggestion: 'Consolidate 3 rounds into a 90-minute unified technical pairing session and communicate decisions within 48 hours.',
          },
          skillDemandTrends: [
            { skill: 'React & Frontend Frameworks', demandScore: 94, trend: 'rising' },
            { skill: 'Gemini AI & LLM Integration', demandScore: 92, trend: 'rising' },
            { skill: 'Node.js & Express Microservices', demandScore: 88, trend: 'stable' },
            { skill: 'TypeScript & Type Safety', demandScore: 84, trend: 'rising' },
            { skill: 'MongoDB Aggregations', demandScore: 78, trend: 'stable' },
            { skill: 'Docker Containerization', demandScore: 72, trend: 'stable' },
            { skill: 'Python Scripting', demandScore: 68, trend: 'declining' },
            { skill: 'AWS Cloud Deployment', demandScore: 65, trend: 'stable' },
          ],
          hiringVelocity: {
            avgDaysToHire: 18,
            benchmark: '23 days industry standard',
            assessment: 'Hiring velocity is 22% faster than industry standard, powered by automated ATS screening.',
          },
          recommendations: [
            {
              priority: 'high',
              title: 'Compress Interview Turnaround from 6 Days to 48 Hours',
              description: 'Top-tier candidates receive competing offers within 5 business days. Shorten scheduling lag.',
              expectedImpact: '+24% offer acceptance rate and 4 days reduction in time-to-hire.',
            },
            {
              priority: 'medium',
              title: 'Broaden Skill Weighting for TypeScript & React Candidates',
              description: 'High technical synergy observed between modern React developers adapting to full-stack Node.js.',
              expectedImpact: 'Expands qualified applicant pool by approximately 30%.',
            },
            {
              priority: 'low',
              title: 'Automate Status Notifications for Rejected Applicants',
              description: 'Provide constructive automated feedback based on missing skill rubrics to maintain strong employer brand.',
              expectedImpact: '+18% brand sentiment and increased candidate re-application rate.',
            },
          ],
        },
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
  const getHealthBadge = (health) => {
    const h = (health || 'Good').toLowerCase();
    if (h === 'excellent') {
      return { label: 'Excellent', color: '#2D7A3A', bg: 'rgba(45, 122, 58, 0.1)', border: 'rgba(45, 122, 58, 0.25)' };
    }
    if (h === 'good') {
      return { label: 'Good', color: '#0F766E', bg: 'rgba(15, 118, 110, 0.1)', border: 'rgba(15, 118, 110, 0.25)' };
    }
    if (h === 'fair') {
      return { label: 'Fair', color: '#B45309', bg: 'rgba(180, 83, 9, 0.1)', border: 'rgba(180, 83, 9, 0.25)' };
    }
    return { label: 'Poor', color: '#B91C1C', bg: 'rgba(185, 28, 28, 0.1)', border: 'rgba(185, 28, 28, 0.25)' };
  };

  // Insight card theme by type
  const getInsightStyle = (type) => {
    const t = (type || 'opportunity').toLowerCase();
    if (t === 'success') {
      return {
        borderLeft: '4px solid #2D7A3A',
        badgeBg: 'rgba(45, 122, 58, 0.1)',
        badgeColor: '#2D7A3A',
        icon: <CheckCircle2 size={16} color="#2D7A3A" />,
      };
    }
    if (t === 'warning') {
      return {
        borderLeft: '4px solid #B45309',
        badgeBg: 'rgba(180, 83, 9, 0.1)',
        badgeColor: '#B45309',
        icon: <AlertTriangle size={16} color="#B45309" />,
      };
    }
    if (t === 'risk') {
      return {
        borderLeft: '4px solid #B91C1C',
        badgeBg: 'rgba(185, 28, 28, 0.1)',
        badgeColor: '#B91C1C',
        icon: <ShieldAlert size={16} color="#B91C1C" />,
      };
    }
    return {
      borderLeft: '4px solid #0F766E',
      badgeBg: 'rgba(15, 118, 110, 0.1)',
      badgeColor: '#0F766E',
      icon: <Lightbulb size={16} color="#0F766E" />,
    };
  };

  // Trend badge formatting for skills
  const getTrendBadge = (trend) => {
    const tr = (trend || 'stable').toLowerCase();
    if (tr === 'rising') {
      return (
        <span style={{ fontSize: '0.72rem', color: '#2D7A3A', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
          <TrendingUp size={11} /> Rising
        </span>
      );
    }
    if (tr === 'declining') {
      return (
        <span style={{ fontSize: '0.72rem', color: '#8A8A86', fontWeight: 500 }}>
          ↘ Declining
        </span>
      );
    }
    return (
      <span style={{ fontSize: '0.72rem', color: '#0F766E', fontWeight: 500 }}>
        → Stable
      </span>
    );
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
      <div className="recruiter-analytics-widget" style={{ marginTop: '3rem' }}>
        {/* Header Skeleton */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <div className="skeleton-shimmer" style={{ width: '220px', height: '18px', marginBottom: '0.5rem' }} />
            <div className="skeleton-shimmer" style={{ width: '360px', height: '32px' }} />
          </div>
          <div className="skeleton-shimmer" style={{ width: '180px', height: '38px' }} />
        </div>

        {/* 4 Metric Cards Skeleton */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton-shimmer" style={{ height: '140px', borderRadius: '8px' }} />
          ))}
        </div>

        {/* Insights Skeleton */}
        <div className="skeleton-shimmer" style={{ height: '240px', borderRadius: '8px', marginBottom: '2.5rem' }} />

        {/* Charts Row Skeleton */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-shimmer" style={{ height: '300px', borderRadius: '8px' }} />
          ))}
        </div>
      </div>
    );
  }

  const { aggregatedData, aiInsights, lastUpdated } = data;
  const healthBadge = getHealthBadge(aiInsights?.pipelineHealth);

  // SVG Funnel calculation data
  const funnel = aggregatedData.funnelSteps || [];

  // Weekly timeline max calculation for SVG line chart
  const weeklyTimeline = aggregatedData.weeklyTimeline || [];
  const maxWeeklyCount = Math.max(...weeklyTimeline.map((w) => w.count), 1);
  const chartWidth = 600;
  const chartHeight = 160;
  const paddingX = 40;
  const paddingY = 25;

  const points = weeklyTimeline.map((item, index) => {
    const x = paddingX + (index / (weeklyTimeline.length - 1)) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - (item.count / maxWeeklyCount) * (chartHeight - paddingY * 2);
    return { x, y, count: item.count, week: item.week, label: item.label };
  });

  const pathD = points.reduce((acc, p, idx) => {
    if (idx === 0) return `M ${p.x} ${p.y}`;
    // Catmull-Rom or cubic Bezier for smooth curves
    const prev = points[idx - 1];
    const cpX1 = prev.x + (p.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (p.x - prev.x) / 2;
    const cpY2 = p.y;
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`;

  return (
    <div className="recruiter-analytics-widget" style={{ marginTop: '3.5rem' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
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
              <Sparkles size={11} />
              Gemini 2.5 Flash Telemetry
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Updated {formatTime(lastUpdated)}
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
            Real-time candidate conversion funnel, skill demand velocity, and AI strategic recommendations.
          </p>
        </div>

        {/* Right Action: Health Status Badge + Refresh Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Pipeline Health Badge */}
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
            }}
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
            title="Re-aggregate pipeline metrics and rerun Gemini 2.5 Flash intelligence"
          >
            <RefreshCw size={13} className={refreshing ? 'spin' : ''} />
            <span>{refreshing ? 'Analyzing...' : 'Refresh Insights'}</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          SECTION 2 — KEY METRICS ROW (4 Cards with Serif Numbers & Accents)
         ========================================================================= */}
      <div
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
                {aggregatedData.conversionRate}%
              </div>
              <span style={{ fontSize: '0.8rem', color: '#2D7A3A', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                <TrendingUp size={13} /> {aggregatedData.conversionTrend}
              </span>
            </div>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.75rem', margin: 0 }}>
            Applicants advancing from initial screening to Interview or Offer stage
          </p>
        </div>

        {/* Metric 2: AI Match Score Health + Distribution Mini-bar */}
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
              AI Match Score Health
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
              <div style={{ fontSize: '2.4rem', fontWeight: 700, color: 'var(--accent-teal)', fontFamily: "'Newsreader', Georgia, serif" }}>
                {aggregatedData.avgAiMatchScore}%
              </div>
              <span style={{ fontSize: '0.8rem', color: '#2D7A3A', fontWeight: 600 }}>
                Optimal Range
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
              title={`Strong: ${aggregatedData.qualityTiers?.[0]?.percentage || 62.5}%, Moderate: ${aggregatedData.qualityTiers?.[1]?.percentage || 29.2}%, Low: ${aggregatedData.qualityTiers?.[2]?.percentage || 8.3}%`}
            >
              <div style={{ width: `${aggregatedData.qualityTiers?.[0]?.percentage || 62.5}%`, background: '#2D7A3A' }} />
              <div style={{ width: `${aggregatedData.qualityTiers?.[1]?.percentage || 29.2}%`, background: '#B45309' }} />
              <div style={{ width: `${aggregatedData.qualityTiers?.[2]?.percentage || 8.3}%`, background: '#B91C1C' }} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            <span>Strong: {aggregatedData.qualityTiers?.[0]?.count || 30}</span>
            <span>Moderate: {aggregatedData.qualityTiers?.[1]?.count || 14}</span>
            <span>Low: {aggregatedData.qualityTiers?.[2]?.count || 4}</span>
          </div>
        </div>

        {/* Metric 3: ATS Screening Velocity */}
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
              ATS Screening Velocity
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
              <div style={{ fontSize: '2.4rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: "'Newsreader', Georgia, serif" }}>
                {aggregatedData.screeningVelocity}
              </div>
              <span style={{ fontSize: '0.8rem', color: '#2D7A3A', fontWeight: 600 }}>
                Real-Time
              </span>
            </div>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.75rem', margin: 0 }}>
            Instant PDF parsing & structured AI evaluation per candidate resume
          </p>
        </div>

        {/* Metric 4: Avg Days to Hire (NEW) */}
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
                {aggregatedData.avgDaysToHire} <span style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-muted)' }}>days</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#2D7A3A', fontWeight: 600, marginTop: '0.75rem' }}>
            <Clock size={13} />
            <span>Industry avg: {aggregatedData.industryAvgDays} days (22% faster)</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 3 — AI INSIGHTS PANEL & BOTTLENECK ALERT (NEW)
         ========================================================================= */}
      <div
        className="paper-card"
        style={{
          padding: '2rem',
          borderRadius: '8px',
          background: '#FFFFFF',
          border: '1px solid var(--border-default)',
          marginBottom: '2.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
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
              <Sparkles size={17} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', fontFamily: "'Newsreader', Georgia, serif" }}>
                AI-Generated Insights
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Synthesized by Gemini 2.5 Flash from active applicant patterns
              </span>
            </div>
          </div>

          {refreshing && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.78rem',
                color: 'var(--accent-teal)',
                fontWeight: 600,
              }}
            >
              <RefreshCw size={13} className="spin" /> Generating AI insights...
            </span>
          )}
        </div>

        {/* 2-Column Grid of Actionable Insight Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1rem',
            marginBottom: '1.75rem',
          }}
        >
          {aiInsights?.keyInsights?.map((insight, index) => {
            const style = getInsightStyle(insight.type);
            return (
              <div
                key={index}
                style={{
                  padding: '1.15rem 1.25rem',
                  borderRadius: '6px',
                  background: '#FAF9F5',
                  border: '1px solid var(--border-default)',
                  borderLeft: style.borderLeft,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      {style.icon}
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                        {insight.title}
                      </h4>
                    </div>
                    {insight.metric && (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          background: style.badgeBg,
                          color: style.badgeColor,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {insight.metric}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    {insight.description}
                  </p>
                </div>

                {insight.action && (
                  <div
                    style={{
                      paddingTop: '0.5rem',
                      borderTop: '1px dashed var(--border-default)',
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '0.35rem',
                      fontSize: '0.76rem',
                      color: 'var(--text-muted)',
                      lineHeight: 1.4,
                    }}
                  >
                    <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Recommended action:</span>
                    <span>{insight.action}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Pipeline Bottleneck Alert Box */}
        {aiInsights?.bottleneck && (
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderRadius: '8px',
              background: 'rgba(180, 83, 9, 0.04)',
              border: '1px solid rgba(180, 83, 9, 0.25)',
              borderLeft: '5px solid #B45309',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{ color: '#B45309', marginTop: '0.15rem' }}>
                <AlertTriangle size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#92400E' }}>
                    Pipeline Bottleneck Alert: {aiInsights.bottleneck.stage}
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
                    {aiInsights.bottleneck.dropOffRate}% Candidate Drop-Off
                  </span>
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 0.5rem 0' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Why it happens:</strong> {aiInsights.bottleneck.reason}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--accent-teal)', fontWeight: 600 }}>
                  <Sparkles size={14} />
                  <span>Strategic Fix: {aiInsights.bottleneck.suggestion}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          SECTION 4 — CHARTS ROW (Funnel, Quality Tiers, Skill Heatmap)
         ========================================================================= */}
      <div
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
              Sequential stage-by-stage attrition across active requisitions.
            </p>

            {/* Funnel SVG / Tiered trapezoid bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', alignItems: 'center' }}>
              {funnel.map((step, idx) => {
                // Tier width narrows as funnel progresses: 100% -> 85% -> 70% -> 55% -> 40%
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
                    title={`${step.stage}: ${step.count} candidates (${step.pct}% through, ${step.dropOff}% drop-off from previous)`}
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
            <span>Top of funnel: {funnel[0]?.count || 48} entries</span>
            <span style={{ color: '#2D7A3A', fontWeight: 600 }}>Hired: {funnel[funnel.length - 1]?.count || 4} ({aggregatedData.conversionRate}%)</span>
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
                AI Match Quality Tiers
              </h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 1.5rem 0' }}>
              Gemini ATS compatibility scoring distribution across resumes.
            </p>

            {/* Quality Tier Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              {aggregatedData.qualityTiers?.map((tier) => (
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
            Average compatibility across portfolio: <strong style={{ color: 'var(--text-primary)' }}>{aggregatedData.avgAiMatchScore}%</strong>
          </div>
        </div>

        {/* Chart 3: Skill Demand Heatmap (NEW) */}
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
                Skill Demand Heatmap
              </h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 1.25rem 0' }}>
              Top demanded technical competencies & market trend trajectory.
            </p>

            {/* Horizontal Bar Chart for Skills */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              {aggregatedData.topSkills?.slice(0, 8).map((s) => {
                const tr = (s.trend || 'stable').toLowerCase();
                const barColor = tr === 'rising' ? '#2D7A3A' : tr === 'declining' ? '#64748B' : '#0F766E';

                return (
                  <div key={s.skill}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {s.skill}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {getTrendBadge(s.trend)}
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                          {s.demandScore}
                        </span>
                      </div>
                    </div>
                    <div
                      style={{
                        height: '6px',
                        borderRadius: '3px',
                        background: '#ECEAE4',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${s.demandScore}%`,
                          background: barColor,
                          borderRadius: '3px',
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
            Green: Rising velocity • Teal: Stable core • Gray: Declining
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 5 — STRATEGIC RECOMMENDATIONS & HIRING TIMELINE (NEW)
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
              Targeted high-leverage interventions prioritized by pipeline impact
            </span>
          </div>
        </div>

        {/* 3 Prioritized Recommendation Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2.5rem',
          }}
        >
          {aiInsights?.recommendations?.map((rec, index) => {
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.6rem' }}>
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
                  <h4 style={{ fontSize: '0.94rem', fontWeight: 700, margin: '0 0 0.4rem 0', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    {rec.title}
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    {rec.description}
                  </p>
                </div>

                {rec.expectedImpact && (
                  <div
                    style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: '5px',
                      background: 'rgba(15, 118, 110, 0.08)',
                      border: '1px solid rgba(15, 118, 110, 0.2)',
                      fontSize: '0.76rem',
                      color: 'var(--accent-teal)',
                      fontWeight: 600,
                    }}
                  >
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Expected Impact: </span>
                    {rec.expectedImpact}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Hiring Velocity Timeline (SVG Line & Area Chart) */}
        <div style={{ paddingTop: '1.75rem', borderTop: '1px solid var(--border-default)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', fontFamily: "'Newsreader', Georgia, serif" }}>
                Application Inflow Velocity (Last 8 Weeks)
              </h4>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Weekly submission volume and pipeline acceleration trends
              </span>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#2D7A3A', fontWeight: 600 }}>
              Peak Volume: {Math.max(...weeklyTimeline.map((w) => w.count))} resumes/wk
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
              <path d={areaD} fill="url(#velocityGradient)" />

              {/* Line path */}
              <path
                d={pathD}
                fill="none"
                stroke="var(--accent-teal)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

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
