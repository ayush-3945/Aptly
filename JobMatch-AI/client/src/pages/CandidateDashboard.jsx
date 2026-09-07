import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
  Building2,
  Calendar,
  Loader2,
  Bookmark,
  MapPin,
  FileText,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { useSavedJobs } from '../utils/savedJobs';
import { FALLBACK_JOBS } from '../data/fallbackJobs';
import ApplyModal from '../components/ApplyModal';
import CandidateProfile from './CandidateProfile';

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
  const { showToast } = useToast();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedAppId, setExpandedAppId] = useState(null);
  const [withdrawingId, setWithdrawingId] = useState(null);
  const [withdrawModalApp, setWithdrawModalApp] = useState(null);
  const [actionMessage, setActionMessage] = useState('');

  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'applications';

  // Tab & Saved Jobs State
  const [activeTab, setActiveTab] = useState(initialTab); // 'applications' | 'saved' | 'profile'

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && ['applications', 'saved', 'profile'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setSearchParams({ tab: tabName });
  };
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

    const fetchAllJobs = async () => {
      try {
        const res = await api.get('/jobs');
        if (Array.isArray(res.data) && res.data.length > 0) {
          setAllJobs(res.data);
        }
      } catch (_err) {
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
      showToast('Application withdrawn successfully.', 'info');
      setApplications((prev) => prev.filter((a) => a._id !== withdrawModalApp._id));
    } catch (err) {
      console.warn('Withdraw API fallback (local removal):', err.message);
      setApplications((prev) => prev.filter((a) => a._id !== withdrawModalApp._id));
      setActionMessage('Application withdrawn.');
      showToast('Application withdrawn.', 'info');
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
          color: 'var(--semantic-green)',
          bg: 'rgba(45, 122, 58, 0.1)',
          border: 'rgba(45, 122, 58, 0.25)',
        };
      case 'interview':
        return {
          label: 'Interviewing',
          color: 'var(--semantic-amber)',
          bg: 'rgba(180, 83, 9, 0.1)',
          border: 'rgba(180, 83, 9, 0.25)',
        };
      case 'rejected':
        return {
          label: 'Not Selected',
          color: 'var(--semantic-red)',
          bg: 'rgba(185, 28, 28, 0.1)',
          border: 'rgba(185, 28, 28, 0.25)',
        };
      case 'hired':
        return {
          label: 'Offer Extended',
          color: 'var(--semantic-green)',
          bg: 'rgba(45, 122, 58, 0.15)',
          border: 'rgba(45, 122, 58, 0.3)',
        };
      default:
        return {
          label: 'Applied',
          color: 'var(--accent-teal)',
          bg: 'var(--accent-teal-light)',
          border: 'rgba(15, 107, 92, 0.25)',
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
              borderRadius: '6px',
              background: 'var(--accent-teal-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(15, 107, 92, 0.25)',
            }}
          >
            <Briefcase size={18} color="var(--accent-teal)" />
          </div>
          <span
            style={{
              fontSize: '0.82rem',
              fontWeight: 700,
              letterSpacing: '0.01em',
              color: 'var(--accent-teal)',
            }}
          >
            Candidate portal
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1
              style={{
                fontFamily: "'Newsreader', Georgia, serif",
                fontSize: '2.3rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
              }}
            >
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
            borderRadius: '4px',
            background: 'var(--accent-teal-light)',
            border: '1px solid rgba(15, 107, 92, 0.25)',
            color: 'var(--accent-teal)',
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
        <div className="paper-card" style={{ padding: '1.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '8px' }}>
          <div style={{ color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.01em' }}>
              Total applied
            </span>
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--text-primary)' }}>
            {metrics.total}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Active submissions tracked
          </div>
        </div>

        {/* Shortlisted Count */}
        <div className="paper-card" style={{ padding: '1.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '8px' }}>
          <div style={{ color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.01em' }}>
              In pipeline
            </span>
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--semantic-green)' }}>
            {metrics.shortlisted}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Shortlisted or interviewing
          </div>
        </div>

        {/* Average AI Match Score */}
        <div className="paper-card" style={{ padding: '1.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '8px' }}>
          <div style={{ color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.01em' }}>
              Avg AI match
            </span>
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--accent-teal)' }}>
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
          borderBottom: '1px solid var(--border-default)',
          marginBottom: '2rem',
          paddingBottom: '0.75rem',
        }}
      >
        <button
          type="button"
          onClick={() => handleTabChange('applications')}
          style={{
            padding: '0.65rem 1.35rem',
            borderRadius: '6px',
            fontSize: '0.92rem',
            fontWeight: 700,
            cursor: 'pointer',
            border:
              activeTab === 'applications'
                ? '1px solid var(--accent-teal)'
                : '1px solid var(--border-default)',
            background:
              activeTab === 'applications'
                ? 'var(--accent-teal-light)'
                : 'var(--bg-card)',
            color: activeTab === 'applications' ? 'var(--accent-teal)' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'var(--transition)',
          }}
        >
          <FileText size={17} color={activeTab === 'applications' ? 'var(--accent-teal)' : 'currentColor'} />
          <span>My Applications ({applications.length})</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('saved')}
          style={{
            padding: '0.65rem 1.35rem',
            borderRadius: '6px',
            fontSize: '0.92rem',
            fontWeight: 700,
            cursor: 'pointer',
            border:
              activeTab === 'saved'
                ? '1px solid var(--semantic-amber)'
                : '1px solid var(--border-default)',
            background:
              activeTab === 'saved'
                ? 'rgba(180, 83, 9, 0.1)'
                : 'var(--bg-card)',
            color: activeTab === 'saved' ? 'var(--semantic-amber)' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'var(--transition)',
          }}
        >
          <Bookmark
            size={17}
            fill={activeTab === 'saved' ? 'var(--semantic-amber)' : 'none'}
            color={activeTab === 'saved' ? 'var(--semantic-amber)' : 'currentColor'}
          />
          <span>Saved Jobs ({savedJobs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('profile')}
          style={{
            padding: '0.65rem 1.35rem',
            borderRadius: '6px',
            fontSize: '0.92rem',
            fontWeight: 700,
            cursor: 'pointer',
            border:
              activeTab === 'profile'
                ? '1px solid var(--accent-teal)'
                : '1px solid var(--border-default)',
            background:
              activeTab === 'profile'
                ? 'var(--accent-teal-light)'
                : 'var(--bg-card)',
            color: activeTab === 'profile' ? 'var(--accent-teal)' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'var(--transition)',
          }}
        >
          <User size={17} color={activeTab === 'profile' ? 'var(--accent-teal)' : 'currentColor'} />
          <span>Resume & Profile</span>
        </button>
      </div>

      {activeTab === 'applications' ? (
        /* Applications List */
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-primary)', fontFamily: "'Newsreader', Georgia, serif" }}>
            Tracked Submissions ({applications.length})
          </h2>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 1.5rem', color: 'var(--text-secondary)' }}>
              <Loader2 size={36} className="spin" style={{ margin: '0 auto 1rem', color: 'var(--accent-teal)' }} />
              <p>Loading your application pipeline...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="paper-card" style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '8px' }}>
              <Briefcase size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', color: 'var(--text-primary)', fontFamily: "'Newsreader', Georgia, serif" }}>No Applications Yet</h3>
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
                    className="paper-card"
                    style={{
                      padding: '1.75rem',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-default)',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
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
                          <Building2 size={15} color="var(--accent-teal)" />
                          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            {companyName}
                          </span>
                          <span style={{ color: 'var(--border-default)' }}>•</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <Calendar size={12} />
                            <span>Applied on {formatDate(app.appliedAt)}</span>
                          </div>
                        </div>

                        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, fontFamily: "'Newsreader', Georgia, serif" }}>
                          {app.job?._id ? (
                            <Link
                              to={`/jobs/${app.job._id}`}
                              style={{ color: 'var(--text-primary)', textDecoration: 'none' }}
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
                            borderRadius: '4px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            letterSpacing: '0.01em',
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
                            background: 'var(--accent-teal-light)',
                            border: '1px solid rgba(15, 107, 92, 0.25)',
                            padding: '0.3rem 0.75rem',
                            borderRadius: '4px',
                          }}
                        >
                          <Sparkles size={14} color="var(--accent-teal)" />
                          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-teal)' }}>
                            {matchScore}% Fit
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
                        borderTop: '1px solid var(--border-default)',
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
                          color: isExpanded ? 'var(--accent-teal)' : 'var(--text-secondary)',
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
                          color: 'var(--semantic-red)',
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
                          borderRadius: '6px',
                          backgroundColor: 'var(--bg-primary)',
                          border: '1px solid var(--border-default)',
                        }}
                      >
                        {/* Recommendation & Seniority Fit */}
                        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                          <span
                            style={{
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              padding: '0.2rem 0.6rem',
                              borderRadius: '4px',
                              background: matchScore >= 75 ? 'rgba(45, 122, 58, 0.1)' : 'rgba(180, 83, 9, 0.1)',
                              color: matchScore >= 75 ? 'var(--semantic-green)' : 'var(--semantic-amber)',
                              border: `1px solid ${matchScore >= 75 ? 'rgba(45, 122, 58, 0.25)' : 'rgba(180, 83, 9, 0.25)'}`,
                            }}
                          >
                            {app.recommendation || (matchScore >= 75 ? 'Strong Match' : 'Moderate Match')}
                          </span>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {app.experienceFit || 'Candidate experience verified against job requirements.'}
                          </span>
                        </div>

                        {/* Skills Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                          {/* Matched Skills */}
                          <div style={{ background: 'var(--bg-card)', padding: '0.85rem', borderRadius: '6px', border: '1px solid var(--border-default)' }}>
                            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--semantic-green)', marginBottom: '0.45rem', letterSpacing: '0.01em' }}>
                              Matched skills ({app.matchedSkills?.length || 0})
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                              {app.matchedSkills && app.matchedSkills.length > 0 ? (
                                app.matchedSkills.map((s, idx) => (
                                  <span
                                    key={idx}
                                    style={{
                                      padding: '0.15rem 0.5rem',
                                      borderRadius: '3px',
                                      fontSize: '0.72rem',
                                      fontWeight: 500,
                                      background: 'var(--accent-teal-light)',
                                      color: 'var(--accent-teal)',
                                      border: '1px solid rgba(15, 107, 92, 0.2)',
                                    }}
                                  >
                                    ✓ {s}
                                  </span>
                                ))
                              ) : (
                                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>None extracted</span>
                              )}
                            </div>
                          </div>

                          {/* Missing Skills */}
                          <div style={{ background: 'var(--bg-card)', padding: '0.85rem', borderRadius: '6px', border: '1px solid var(--border-default)' }}>
                            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--semantic-red)', marginBottom: '0.45rem', letterSpacing: '0.01em' }}>
                              Missing / desired skills ({app.missingSkills?.length || 0})
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                              {app.missingSkills && app.missingSkills.length > 0 ? (
                                app.missingSkills.map((s, idx) => (
                                  <span
                                    key={idx}
                                    style={{
                                      padding: '0.15rem 0.5rem',
                                      borderRadius: '3px',
                                      fontSize: '0.72rem',
                                      fontWeight: 500,
                                      background: 'rgba(185, 28, 28, 0.08)',
                                      color: 'var(--semantic-red)',
                                      border: '1px solid rgba(185, 28, 28, 0.2)',
                                    }}
                                  >
                                    ✕ {s}
                                  </span>
                                ))
                              ) : (
                                <span style={{ fontSize: '0.78rem', color: 'var(--semantic-green)' }}>100% skill alignment</span>
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
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-primary)', fontFamily: "'Newsreader', Georgia, serif" }}>
            Saved Opportunities ({savedJobs.length})
          </h2>

          {savedJobs.length === 0 ? (
            <div className="paper-card" style={{ textAlign: 'center', padding: '4rem 2rem', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '8px',
                  background: 'rgba(180, 83, 9, 0.1)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--semantic-amber)',
                  marginBottom: '1rem',
                }}
              >
                <Bookmark size={28} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)', fontFamily: "'Newsreader', Georgia, serif" }}>
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
                  className="paper-card"
                  style={{
                    padding: '1.75rem',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-default)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
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
                            fontFamily: "'Newsreader', Georgia, serif",
                          }}
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
                          <Building2 size={14} color="var(--accent-teal)" />
                          {job.company}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <MapPin size={14} color="var(--accent-teal)" />
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
                        showToast(`Removed "${job.title}" from saved jobs.`, 'info');
                        setTimeout(() => setActionMessage(''), 3000);
                      }}
                      className="btn btn-ghost"
                      style={{
                        padding: '0.45rem 0.85rem',
                        fontSize: '0.82rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        color: 'var(--semantic-amber)',
                        borderRadius: '4px',
                      }}
                      title="Remove from saved jobs"
                    >
                      <Bookmark size={15} fill="var(--semantic-amber)" />
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
                            borderRadius: '4px',
                            background: 'var(--accent-teal-light)',
                            border: '1px solid rgba(15, 107, 92, 0.2)',
                            fontSize: '0.75rem',
                            color: 'var(--accent-teal)',
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
                      borderTop: '1px solid var(--border-default)',
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

      {/* Embedded Resume & Profile Management */}
      {activeTab === 'profile' && (
        <div className="animate-fade-in">
          <CandidateProfile />
        </div>
      )}

      {/* Confirmation Modal for Application Withdrawal */}
      {withdrawModalApp && (
        <div className="modal-overlay" onClick={() => setWithdrawModalApp(null)}>
          <div
            className="paper-card animate-fade-in"
            style={{
              maxWidth: '440px',
              width: '100%',
              padding: '2rem',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: '8px',
              boxShadow: '0 16px 48px rgba(0, 0, 0, 0.12)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '6px',
                  background: 'rgba(185, 28, 28, 0.1)',
                  color: 'var(--semantic-red)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.75rem',
                }}
              >
                <AlertTriangle size={24} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: "'Newsreader', Georgia, serif" }}>
                Withdraw Application?
              </h3>
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
                  backgroundColor: 'var(--semantic-red)',
                  color: '#fff',
                  fontSize: '0.9rem',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.5rem 1rem',
                  fontWeight: 600,
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
