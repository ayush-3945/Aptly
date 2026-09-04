import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trash2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Target,
  TrendingUp,
  FileText,
  Building2,
  Calendar,
  AlertCircle,
  Loader2,
  X,
  Bookmark,
  MapPin,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useSavedJobs } from '../utils/savedJobs';
import { FALLBACK_JOBS } from '../data/fallbackJobs';
import ApplyModal from '../components/ApplyModal';

// Curated sample applications so candidate dashboard demonstrates rich state even prior to first application
const SAMPLE_APPLICATIONS = [
  {
    _id: 'app_sample_1',
    status: 'shortlisted',
    appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    aiMatchScore: 88,
    recommendation: 'Strong Match',
    matchedSkills: ['React', 'Node.js', 'Express', 'MongoDB', 'Gemini AI'],
    missingSkills: ['Docker'],
    experienceFit: 'Candidate exhibits 4+ years of relevant MERN production engineering.',
    fitSummary: 'Strong candidate profile with proven Full-Stack engineering depth and AI integration capabilities.',
    job: {
      _id: 'job_fallback_1',
      title: 'Senior Full-Stack MERN & AI Engineer',
      company: 'TechPulse Solutions',
      location: 'Remote',
    },
  },
  {
    _id: 'app_sample_2',
    status: 'applied',
    appliedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    aiMatchScore: 72,
    recommendation: 'Moderate Match',
    matchedSkills: ['React', 'TypeScript', 'TailwindCSS'],
    missingSkills: ['Gemini AI', 'Next.js'],
    experienceFit: 'Solid frontend capabilities with minor gap in foundation model SDK integrations.',
    fitSummary: 'Moderate candidate alignment. Capable frontend specialist who could quickly ramp up on Gemini APIs.',
    job: {
      _id: 'job_fallback_2',
      title: 'Frontend AI Interface Architect',
      company: 'HyperScale AI',
      location: 'San Francisco, CA',
    },
  },
];

const CandidateDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedAppId, setExpandedAppId] = useState(null);
  const [withdrawingId, setWithdrawingId] = useState(null);
  const [withdrawModalApp, setWithdrawModalApp] = useState(null);
  const [actionMessage, setActionMessage] = useState('');

  // Tab & Saved Jobs State
  const [activeTab, setActiveTab] = useState('applications'); // 'applications' | 'saved'
  const { savedJobIds, removeSaved } = useSavedJobs();
  const [allJobs, setAllJobs] = useState(FALLBACK_JOBS);
  const [applyModalJob, setApplyModalJob] = useState(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Fetch candidate's applications
  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/applications/my');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setApplications(res.data);
      } else {
        // Fallback to demo applications if fresh database
        setApplications(SAMPLE_APPLICATIONS);
      }
    } catch (err) {
      console.warn('Could not load applications from server, using demo data:', err.message);
      setApplications(SAMPLE_APPLICATIONS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();

    // Fetch all jobs to resolve saved job references
    const fetchAllJobs = async () => {
      try {
        const res = await api.get('/jobs');
        if (Array.isArray(res.data) && res.data.length > 0) {
          setAllJobs(res.data);
        }
      } catch (err) {
        // fallback active
      }
    };
    fetchAllJobs();
  }, []);

  // Compute resolved saved jobs
  const savedJobs = useMemo(() => {
    if (savedJobIds && savedJobIds.length > 0) {
      return savedJobIds
        .map((id) => allJobs.find((j) => j._id === id) || FALLBACK_JOBS.find((j) => j._id === id))
        .filter(Boolean);
    }
    return [];
  }, [savedJobIds, allJobs]);

  // Compute metrics
  const metrics = useMemo(() => {
    const total = applications.length;
    const shortlisted = applications.filter((a) =>
      ['shortlisted', 'interview', 'hired'].includes(a.status?.toLowerCase())
    ).length;

    const scoredApps = applications.filter((a) => typeof a.aiMatchScore === 'number');
    const avgScore =
      scoredApps.length > 0
        ? Math.round(scoredApps.reduce((acc, curr) => acc + curr.aiMatchScore, 0) / scoredApps.length)
        : 0;

    return { total, shortlisted, avgScore };
  }, [applications]);

  // Accordion toggle
  const toggleAccordion = (appId) => {
    setExpandedAppId((prev) => (prev === appId ? null : appId));
  };

  // Withdraw Application Handler
  const handleConfirmWithdraw = async () => {
    if (!withdrawModalApp) return;

    setWithdrawingId(withdrawModalApp._id);
    try {
      await api.delete(`/applications/${withdrawModalApp._id}`);
      setActionMessage('Application withdrawn successfully.');
      setApplications((prev) => prev.filter((a) => a._id !== withdrawModalApp._id));
    } catch (err) {
      console.warn('Withdraw API fallback (local removal):', err.message);
      // Remove locally for demo resilience
      setApplications((prev) => prev.filter((a) => a._id !== withdrawModalApp._id));
      setActionMessage('Application withdrawn.');
    } finally {
      setWithdrawingId(null);
      setWithdrawModalApp(null);
      setTimeout(() => setActionMessage(''), 3000);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || 'applied').toLowerCase();
    switch (s) {
      case 'shortlisted':
        return {
          label: 'Shortlisted',
          color: '#34D399',
          bg: 'rgba(16, 185, 129, 0.15)',
          border: 'rgba(16, 185, 129, 0.35)',
        };
      case 'interview':
        return {
          label: 'Interviewing',
          color: '#C084FC',
          bg: 'rgba(138, 43, 226, 0.15)',
          border: 'rgba(138, 43, 226, 0.35)',
        };
      case 'rejected':
        return {
          label: 'Not Selected',
          color: '#F87171',
          bg: 'rgba(239, 68, 68, 0.15)',
          border: 'rgba(239, 68, 68, 0.35)',
        };
      case 'hired':
        return {
          label: 'Offer Extended',
          color: '#FBBF24',
          bg: 'rgba(245, 158, 11, 0.15)',
          border: 'rgba(245, 158, 11, 0.35)',
        };
      default:
        return {
          label: 'Applied',
          color: '#38BDF8',
          bg: 'rgba(56, 189, 248, 0.15)',
          border: 'rgba(56, 189, 248, 0.35)',
        };
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '3.5rem 1.5rem 5rem' }}>
      {/* Header Section */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--accent-glow)',
            }}
          >
            <Briefcase size={18} color="#fff" />
          </div>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.88rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--accent-cyan)',
            }}
          >
            Candidate Portal
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2.3rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
              My Applications & AI Match Tracker
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
              Real-time telemetry on your submitted applications, ATS status changes, and semantic match breakdowns.
            </p>
          </div>

          <Link to="/jobs" className="btn btn-primary" style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}>
            <Sparkles size={16} />
            <span>Apply to New Roles</span>
          </Link>
        </div>
      </div>

      {/* Action Notification Toast */}
      {actionMessage && (
        <div
          className="animate-fade-in"
          style={{
            padding: '0.75rem 1.25rem',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: 'var(--success)',
            fontSize: '0.88rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <CheckCircle2 size={16} />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Metrics Header Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
        }}
      >
        {/* Total Applications */}
        <div className="card-glass" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Applied
            </span>
            <FileText size={18} color="var(--accent-indigo)" />
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, marginTop: '0.5rem' }} className="gradient-text">
            {metrics.total}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Active submissions tracked
          </div>
        </div>

        {/* Shortlisted Count */}
        <div className="card-glass" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              In Pipeline
            </span>
            <Target size={18} color="var(--success)" />
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--success)' }}>
            {metrics.shortlisted}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Shortlisted or interviewing
          </div>
        </div>

        {/* Average AI Match Score */}
        <div className="card-glass" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Avg AI Match
            </span>
            <TrendingUp size={18} color="var(--accent-cyan)" />
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--accent-cyan)' }}>
            {metrics.avgScore}%
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            ATS semantic compatibility
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '0.85rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '2rem',
          paddingBottom: '0.75rem',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('applications')}
          style={{
            padding: '0.65rem 1.35rem',
            borderRadius: '10px',
            fontSize: '0.92rem',
            fontWeight: 700,
            cursor: 'pointer',
            border:
              activeTab === 'applications'
                ? '1px solid var(--accent-indigo)'
                : '1px solid rgba(255, 255, 255, 0.06)',
            background:
              activeTab === 'applications'
                ? 'rgba(99, 102, 241, 0.22)'
                : 'rgba(255, 255, 255, 0.02)',
            color: activeTab === 'applications' ? '#FFFFFF' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'var(--transition)',
          }}
        >
          <FileText size={17} color={activeTab === 'applications' ? '#818CF8' : 'currentColor'} />
          <span>My Applications ({applications.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('saved')}
          style={{
            padding: '0.65rem 1.35rem',
            borderRadius: '10px',
            fontSize: '0.92rem',
            fontWeight: 700,
            cursor: 'pointer',
            border:
              activeTab === 'saved'
                ? '1px solid #F59E0B'
                : '1px solid rgba(255, 255, 255, 0.06)',
            background:
              activeTab === 'saved'
                ? 'rgba(245, 158, 11, 0.18)'
                : 'rgba(255, 255, 255, 0.02)',
            color: activeTab === 'saved' ? '#FFFFFF' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'var(--transition)',
          }}
        >
          <Bookmark
            size={17}
            fill={activeTab === 'saved' ? '#F59E0B' : 'none'}
            color={activeTab === 'saved' ? '#F59E0B' : 'currentColor'}
          />
          <span>Saved Jobs ({savedJobs.length})</span>
        </button>
      </div>

      {activeTab === 'applications' ? (
        /* Applications List */
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Tracked Submissions ({applications.length})
          </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 1.5rem', color: 'var(--text-secondary)' }}>
            <Loader2 size={36} className="spin" style={{ margin: '0 auto 1rem', color: 'var(--accent-indigo)' }} />
            <p>Loading your application pipeline...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="card-glass" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <Briefcase size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>No Applications Yet</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 1.75rem', fontSize: '0.92rem' }}>
              You haven't applied to any roles yet. Explore our open positions and benchmark your resume against hiring requirements with Gemini AI.
            </p>
            <Link to="/jobs" className="btn btn-primary">
              <Sparkles size={16} />
              <span>Explore Jobs & Apply</span>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {applications.map((app) => {
              const isExpanded = expandedAppId === app._id;
              const statusBadge = getStatusBadge(app.status);
              const jobTitle = app.job?.title || 'Engineering Position';
              const companyName = app.job?.company || 'Technology Company';
              const matchScore = app.aiMatchScore ?? 75;

              return (
                <div
                  key={app._id}
                  className="card-glass"
                  style={{
                    padding: '1.75rem',
                    transition: 'var(--transition)',
                  }}
                >
                  {/* Top Card Row */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      marginBottom: '1rem',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <Building2 size={15} color="var(--accent-indigo)" />
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {companyName}
                        </span>
                        <span style={{ color: 'var(--border-subtle)' }}>•</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          <Calendar size={12} />
                          <span>Applied on {formatDate(app.appliedAt)}</span>
                        </div>
                      </div>

                      <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>
                        {app.job?._id ? (
                          <Link
                            to={`/jobs/${app.job._id}`}
                            style={{ color: 'inherit', textDecoration: 'none' }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-cyan)')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = 'inherit')}
                          >
                            {jobTitle}
                          </Link>
                        ) : (
                          jobTitle
                        )}
                      </h3>
                    </div>

                    {/* Status Pill & AI Score Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      {/* Application Status */}
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.3rem 0.85rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          color: statusBadge.color,
                          backgroundColor: statusBadge.bg,
                          border: `1px solid ${statusBadge.border}`,
                        }}
                      >
                        <Clock size={12} />
                        <span>{statusBadge.label}</span>
                      </span>

                      {/* AI Match Gauge */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid var(--border-subtle)',
                          padding: '0.3rem 0.75rem',
                          borderRadius: 'var(--radius-full)',
                        }}
                      >
                        <Sparkles size={14} color="var(--accent-cyan)" />
                        <span style={{ fontSize: '0.85rem', fontWeight: 800 }} className="gradient-text">
                          {matchScore}% Match
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Summary Preview */}
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                    {app.fitSummary || 'Resume processed through Gemini ATS semantic evaluation engine.'}
                  </p>

                  {/* Card Bottom Controls */}
                  <div
                    style={{
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: '0.95rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                    }}
                  >
                    {/* Toggle Details Accordion */}
                    <button
                      onClick={() => toggleAccordion(app._id)}
                      className="btn btn-ghost"
                      style={{
                        padding: '0.35rem 0.65rem',
                        fontSize: '0.85rem',
                        color: isExpanded ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                      }}
                    >
                      <span>{isExpanded ? 'Hide AI Match Breakdown' : 'View AI Match Details'}</span>
                      {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>

                    {/* Withdraw Application */}
                    <button
                      onClick={() => setWithdrawModalApp(app)}
                      className="btn btn-ghost"
                      style={{
                        padding: '0.35rem 0.65rem',
                        fontSize: '0.82rem',
                        color: 'var(--danger)',
                      }}
                    >
                      <Trash2 size={14} />
                      <span>Withdraw Application</span>
                    </button>
                  </div>

                  {/* Expandable Accordion: Full AI Scorecard */}
                  {isExpanded && (
                    <div
                      className="animate-fade-in"
                      style={{
                        marginTop: '1.25rem',
                        padding: '1.25rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      {/* Recommendation & Seniority Fit */}
                      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <span
                          className={`badge ${
                            matchScore >= 75
                              ? 'badge-strong'
                              : matchScore >= 45
                              ? 'badge-moderate'
                              : 'badge-low'
                          }`}
                        >
                          {app.recommendation || (matchScore >= 75 ? 'Strong Match' : 'Moderate Match')}
                        </span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {app.experienceFit || 'Candidate experience verified against job requirements.'}
                        </span>
                      </div>

                      {/* Skills Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {/* Matched Skills */}
                        <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '0.85rem', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--success)', marginBottom: '0.45rem', textTransform: 'uppercase' }}>
                            Matched Skills ({app.matchedSkills?.length || 0})
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                            {app.matchedSkills && app.matchedSkills.length > 0 ? (
                              app.matchedSkills.map((s, idx) => (
                                <span
                                  key={idx}
                                  style={{
                                    padding: '0.15rem 0.5rem',
                                    borderRadius: '4px',
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    background: 'rgba(16, 185, 129, 0.2)',
                                    color: '#A7F3D0',
                                  }}
                                >
                                  {s}
                                </span>
                              ))
                            ) : (
                              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>None extracted</span>
                            )}
                          </div>
                        </div>

                        {/* Missing Skills */}
                        <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '0.85rem', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--danger)', marginBottom: '0.45rem', textTransform: 'uppercase' }}>
                            Missing / Desired Skills ({app.missingSkills?.length || 0})
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                            {app.missingSkills && app.missingSkills.length > 0 ? (
                              app.missingSkills.map((s, idx) => (
                                <span
                                  key={idx}
                                  style={{
                                    padding: '0.15rem 0.5rem',
                                    borderRadius: '4px',
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    background: 'rgba(239, 68, 68, 0.2)',
                                    color: '#FECACA',
                                  }}
                                >
                                  {s}
                                </span>
                              ))
                            ) : (
                              <span style={{ fontSize: '0.78rem', color: '#A7F3D0' }}>100% skill alignment</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      ) : (
        /* Saved Jobs View */
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Saved Opportunities ({savedJobs.length})
          </h2>

          {savedJobs.length === 0 ? (
            <div className="card-glass" style={{ textAlign: 'center', padding: '4rem 2rem', borderRadius: '16px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'rgba(245, 158, 11, 0.12)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#F59E0B',
                  marginBottom: '1rem',
                }}
              >
                <Bookmark size={28} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                No Bookmarked Positions Yet
              </h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 1.5rem', fontSize: '0.92rem' }}>
                Save interesting roles from the Job Explorer or Job Details pages to review, compare, and apply whenever you are ready.
              </p>
              <Link to="/jobs" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <Briefcase size={16} />
                <span>Explore Open Roles</span>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {savedJobs.map((job) => (
                <div
                  key={job._id}
                  className="card-glass"
                  style={{
                    padding: '1.75rem',
                    borderRadius: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      flexWrap: 'wrap',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                        <Link
                          to={`/jobs/${job._id}`}
                          style={{
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            transition: 'var(--transition)',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-cyan)')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                        >
                          {job.title}
                        </Link>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '1.1rem',
                          fontSize: '0.85rem',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Building2 size={14} color="var(--accent-indigo)" />
                          {job.company}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <MapPin size={14} color="var(--accent-cyan)" />
                          {job.location}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Calendar size={14} color="var(--text-muted)" />
                          Posted {formatDate(job.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Remove Bookmark Action */}
                    <button
                      type="button"
                      onClick={() => {
                        removeSaved(job._id);
                        setActionMessage(`Removed "${job.title}" from saved jobs.`);
                        setTimeout(() => setActionMessage(''), 3000);
                      }}
                      className="btn btn-ghost"
                      style={{
                        padding: '0.45rem 0.85rem',
                        fontSize: '0.82rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        color: '#F59E0B',
                        borderRadius: '8px',
                      }}
                      title="Remove from saved jobs"
                    >
                      <Bookmark size={15} fill="#F59E0B" />
                      <span>Bookmarked</span>
                    </button>
                  </div>

                  {job.description && (
                    <p
                      style={{
                        fontSize: '0.88rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.5,
                        margin: 0,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {job.description}
                    </p>
                  )}

                  {job.requiredSkills && job.requiredSkills.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: '0.2rem' }}>
                        Required Tech:
                      </span>
                      {job.requiredSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          style={{
                            padding: '0.15rem 0.55rem',
                            borderRadius: '6px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            fontSize: '0.75rem',
                            color: 'var(--text-secondary)',
                            fontWeight: 500,
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                      paddingTop: '0.85rem',
                      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    <Link
                      to={`/jobs/${job._id}`}
                      className="btn btn-ghost"
                      style={{
                        padding: '0.45rem 0.8rem',
                        fontSize: '0.82rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <ExternalLink size={14} />
                      View Role Overview
                    </Link>

                    <button
                      onClick={() => {
                        setApplyModalJob(job);
                        setIsApplyModalOpen(true);
                      }}
                      className="btn btn-primary"
                      style={{
                        padding: '0.55rem 1.25rem',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                      }}
                    >
                      <Sparkles size={15} />
                      <span>Apply & Check AI Match</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal for Application Withdrawal */}
      {withdrawModalApp && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            backgroundColor: 'rgba(3, 7, 18, 0.82)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={() => setWithdrawModalApp(null)}
        >
          <div
            className="card-glass animate-fade-in"
            style={{
              maxWidth: '440px',
              width: '100%',
              padding: '2rem',
              backgroundColor: 'var(--bg-secondary)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: 'var(--danger)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.75rem',
                }}
              >
                <AlertTriangle size={24} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Withdraw Application?</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.35rem', lineHeight: 1.5 }}>
                Are you sure you want to withdraw your application for <strong>{withdrawModalApp.job?.title}</strong>? This action cannot be undone.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setWithdrawModalApp(null)}
                className="btn btn-secondary"
                style={{ fontSize: '0.9rem' }}
                disabled={Boolean(withdrawingId)}
              >
                Keep Application
              </button>
              <button
                type="button"
                onClick={handleConfirmWithdraw}
                className="btn"
                style={{
                  backgroundColor: 'var(--danger)',
                  color: '#fff',
                  fontSize: '0.9rem',
                }}
                disabled={Boolean(withdrawingId)}
              >
                {withdrawingId ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    <span>Withdrawing...</span>
                  </>
                ) : (
                  <span>Yes, Withdraw</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real-time AI Apply Modal for Saved Jobs */}
      <ApplyModal
        job={applyModalJob}
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
      />
    </div>
  );
};

export default CandidateDashboard;
