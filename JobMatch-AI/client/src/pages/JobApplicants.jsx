import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Users,
  Sparkles,
  Star,
  MessageSquare,
  CheckCircle2,
  XCircle,
  FileText,
  Filter,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Loader2,
  X,
  RotateCcw,
  Search,
  ExternalLink,
  Target,
  Award,
} from 'lucide-react';
import api from '../services/api';
import { FALLBACK_JOBS } from '../data/fallbackJobs';
import { getDemoApplicantsForJob } from '../utils/demoApplicants';
import { useToast } from '../context/ToastContext';

const PIPELINE_COLUMNS = [
  {
    id: 'applied',
    title: 'Applied',
    subtitle: 'New Submissions',
    icon: Users,
    color: '#38BDF8',
    accentBg: 'rgba(56, 189, 248, 0.12)',
    borderTop: '#38BDF8',
  },
  {
    id: 'shortlisted',
    title: 'Shortlisted',
    subtitle: 'High AI Alignment',
    icon: Star,
    color: '#818CF8',
    accentBg: 'rgba(99, 102, 241, 0.12)',
    borderTop: '#818CF8',
  },
  {
    id: 'interview',
    title: 'Interview',
    subtitle: 'Rounds in Progress',
    icon: MessageSquare,
    color: '#F59E0B',
    accentBg: 'rgba(245, 158, 11, 0.12)',
    borderTop: '#F59E0B',
  },
  {
    id: 'hired',
    title: 'Hired',
    subtitle: 'Offers Extended',
    icon: CheckCircle2,
    color: '#10B981',
    accentBg: 'rgba(16, 185, 129, 0.12)',
    borderTop: '#10B981',
  },
];

const JobApplicants = () => {
  const { jobId } = useParams();

  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Sort State
  const [scoreFilter, setScoreFilter] = useState('all'); // 'all', '75', '50'
  const [sortBy, setSortBy] = useState('score'); // 'score', 'date'
  const [searchQuery, setSearchQuery] = useState('');
  const [showRejectedTray, setShowRejectedTray] = useState(false);

  // Resume / Candidate Detail Modal
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Global Toast
  const { showToast } = useToast();

  // Load Job details and Applicants
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // 1. Fetch Job
      let currentJob = null;
      try {
        const jobRes = await api.get(`/jobs/${jobId}`);
        if (jobRes.data && typeof jobRes.data === 'object' && jobRes.data.title) {
          currentJob = jobRes.data;
        }
      } catch (err) {
        console.warn('Job not found in DB, checking fallback data:', err.message);
      }

      if (!currentJob) {
        currentJob =
          FALLBACK_JOBS.find((j) => j._id === jobId) || {
            _id: jobId,
            title: 'Senior Full-Stack MERN & AI Engineer',
            company: 'TechPulse Solutions',
            location: 'Remote',
            requiredSkills: ['React', 'Node.js', 'Express', 'MongoDB', 'Gemini AI'],
          };
      }
      setJob(currentJob);

      // 2. Fetch Applicants
      try {
        const appRes = await api.get(`/applications/job/${jobId}`);
        if (Array.isArray(appRes.data) && appRes.data.length > 0) {
          setApplicants(appRes.data);
        } else {
          // Use realistic demo archetypes
          setApplicants(getDemoApplicantsForJob(jobId));
        }
      } catch (err) {
        console.warn('Could not fetch applicants from API, using demo applicants:', err.message);
        setApplicants(getDemoApplicantsForJob(jobId));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId]);

  // 1-Click Status Transition Handler
  const handleTransition = async (applicationId, newStatus, candidateName) => {
    // 1. Optimistic UI update
    setApplicants((prev) =>
      prev.map((app) => (app._id === applicationId ? { ...app, status: newStatus } : app))
    );

    const statusLabels = {
      applied: 'Applied',
      shortlisted: 'Shortlisted',
      interview: 'Interview Scheduled',
      hired: 'Hired',
      rejected: 'Archived / Rejected',
    };

    showToast(`${candidateName || 'Candidate'} moved to ${statusLabels[newStatus] || newStatus}.`, 'success');

    // 2. Network call to backend
    try {
      // If it's a real MongoDB application ID (not starting with 'demo_')
      if (!applicationId.toString().startsWith('demo_')) {
        await api.patch(`/applications/${applicationId}/status`, { status: newStatus });
      }
    } catch (err) {
      console.warn('Status update API call error (fallback active):', err.message);
    }
  };

  // Filter and Sort Applicants
  const processedApplicants = useMemo(() => {
    let list = [...applicants];

    // Filter by score threshold
    if (scoreFilter === '75') {
      list = list.filter((a) => (a.aiMatchScore || 0) >= 75);
    } else if (scoreFilter === '50') {
      list = list.filter((a) => (a.aiMatchScore || 0) >= 50);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.candidate?.name?.toLowerCase().includes(q) ||
          a.candidate?.email?.toLowerCase().includes(q) ||
          (a.matchedSkills && a.matchedSkills.some((s) => s.toLowerCase().includes(q)))
      );
    }

    // Sort
    if (sortBy === 'score') {
      list.sort((a, b) => (b.aiMatchScore || 0) - (a.aiMatchScore || 0));
    } else if (sortBy === 'date') {
      list.sort((a, b) => new Date(b.appliedAt || 0) - new Date(a.appliedAt || 0));
    }

    return list;
  }, [applicants, scoreFilter, searchQuery, sortBy]);

  // Group by Column Stage
  const columnApplicants = useMemo(() => {
    const groups = {
      applied: [],
      shortlisted: [],
      interview: [],
      hired: [],
      rejected: [],
    };

    processedApplicants.forEach((app) => {
      const stage = app.status || 'applied';
      if (groups[stage]) {
        groups[stage].push(app);
      } else {
        groups.applied.push(app);
      }
    });

    return groups;
  }, [processedApplicants]);

  // Compute Total Metrics
  const metrics = useMemo(() => {
    const total = applicants.length;
    const strongMatches = applicants.filter((a) => (a.aiMatchScore || 0) >= 75).length;
    const inPipeline = applicants.filter(
      (a) => a.status === 'shortlisted' || a.status === 'interview'
    ).length;
    const avgScore =
      total > 0
        ? Math.round(applicants.reduce((acc, a) => acc + (a.aiMatchScore || 0), 0) / total)
        : 0;

    return { total, strongMatches, inPipeline, avgScore };
  }, [applicants]);

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', minHeight: '90vh' }}>
      {/* Navigation Breadcrumb */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            transition: 'var(--transition)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
        >
          <ArrowLeft size={16} />
          <span>Back to My Postings</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div
        className="card-glass"
        style={{
          padding: '2.25rem',
          borderRadius: '20px',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '9999px',
                  background: 'rgba(99, 102, 241, 0.18)',
                  color: '#818CF8',
                  border: '1px solid rgba(99, 102, 241, 0.35)',
                }}
              >
                ⭐ ATS Recruiter Pipeline
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Automated 1-Click State Transitions
              </span>
            </div>

            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.4rem' }}>
              {job ? job.title : 'Loading Job Requisition...'}
            </h1>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1.25rem',
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Building2 size={15} color="var(--accent-indigo)" />
                {job?.company || 'Company'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Briefcase size={15} color="var(--accent-cyan)" />
                {job?.location || 'Remote'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Users size={15} color="#F59E0B" />
                <strong style={{ color: 'var(--text-primary)' }}>{metrics.total}</strong> Total Candidates
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Sparkles size={15} color="#10B981" />
                Avg Score: <strong style={{ color: '#10B981' }}>{metrics.avgScore}%</strong>
              </span>
            </div>
          </div>

          {/* Quick Metrics Badge Summary */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div
              style={{
                padding: '0.75rem 1.25rem',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10B981' }}>
                {metrics.strongMatches}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Strong Matches
              </div>
            </div>

            <div
              style={{
                padding: '0.75rem 1.25rem',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-indigo)' }}>
                {metrics.inPipeline}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                In Interview
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Controls & Filter Bar */}
      <div
        className="card-glass"
        style={{
          padding: '1.25rem 1.75rem',
          borderRadius: '16px',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        {/* Left: AI Score Filtering Pills */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.65rem' }}>
          <span
            style={{
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              marginRight: '0.25rem',
            }}
          >
            <Filter size={14} />
            AI Filter:
          </span>

          {[
            { id: 'all', label: 'All Candidates' },
            { id: '75', label: '⭐ 75%+ Strong Match' },
            { id: '50', label: '⚡ 50%+ Moderate' },
          ].map((pill) => {
            const active = scoreFilter === pill.id;
            return (
              <button
                key={pill.id}
                onClick={() => setScoreFilter(pill.id)}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  border: active
                    ? '1px solid var(--accent-indigo)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  background: active ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                  color: active ? '#FFFFFF' : 'var(--text-secondary)',
                }}
              >
                {pill.label}
              </button>
            );
          })}
        </div>

        {/* Right: Search & Sort Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.85rem' }}>
          {/* Live Search */}
          <div style={{ position: 'relative', width: '220px' }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              placeholder="Search candidate or skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{
                paddingLeft: '2.2rem',
                paddingRight: searchQuery ? '2rem' : '0.85rem',
                fontSize: '0.82rem',
                paddingTop: '0.45rem',
                paddingBottom: '0.45rem',
                borderRadius: '8px',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '0.65rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                }}
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Sort Toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.03)',
            }}
          >
            <button
              onClick={() => setSortBy('score')}
              style={{
                padding: '0.45rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: sortBy === 'score' ? 'rgba(99, 102, 241, 0.3)' : 'transparent',
                color: sortBy === 'score' ? '#FFFFFF' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <Sparkles size={13} color={sortBy === 'score' ? '#F59E0B' : 'currentColor'} />
              Score
            </button>
            <button
              onClick={() => setSortBy('date')}
              style={{
                padding: '0.45rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: sortBy === 'date' ? 'rgba(99, 102, 241, 0.3)' : 'transparent',
                color: sortBy === 'date' ? '#FFFFFF' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <ArrowUpDown size={13} />
              Date
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div
          className="card-glass"
          style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <Loader2 className="spin" size={36} color="var(--accent-indigo)" />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Assembling ATS Kanban Board & Scoring Pipelines...
          </p>
        </div>
      ) : (
        <>
          {/* Kanban Board Grid (4 Columns) with Touch-Friendly Scroll */}
          <div
            className="kanban-scroll-container"
            style={{
              marginBottom: '2.5rem',
            }}
          >
            {PIPELINE_COLUMNS.map((col) => {
              const colApps = columnApplicants[col.id] || [];
              const IconComponent = col.icon;

              return (
                <div
                  key={col.id}
                  style={{
                    borderRadius: '16px',
                    background: 'rgba(15, 23, 42, 0.55)',
                    border: '1px solid rgba(255, 255, 255, 0.07)',
                    borderTop: `4px solid ${col.borderTop}`,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '480px',
                    overflow: 'hidden',
                  }}
                >
                  {/* Column Header */}
                  <div
                    style={{
                      padding: '1.2rem 1.25rem',
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: col.accentBg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: col.color,
                        }}
                      >
                        <IconComponent size={17} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#FFFFFF' }}>
                          {col.title}
                        </h3>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {col.subtitle}
                        </span>
                      </div>
                    </div>

                    <span
                      style={{
                        padding: '0.2rem 0.65rem',
                        borderRadius: '9999px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        color: col.color,
                      }}
                    >
                      {colApps.length}
                    </span>
                  </div>

                  {/* Cards Container */}
                  <div
                    style={{
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      flex: 1,
                    }}
                  >
                    {colApps.length === 0 ? (
                      <div
                        style={{
                          padding: '2.5rem 1rem',
                          textAlign: 'center',
                          borderRadius: '12px',
                          border: '1px dashed rgba(255, 255, 255, 0.08)',
                          color: 'var(--text-muted)',
                          fontSize: '0.82rem',
                        }}
                      >
                        No candidates in {col.title}
                      </div>
                    ) : (
                      colApps.map((app) => (
                        <CandidateCard
                          key={app._id}
                          application={app}
                          onTransition={handleTransition}
                          onViewResume={() => setSelectedCandidate(app)}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Collapsible Rejected / Archived Tray */}
          <div
            className="card-glass"
            style={{
              borderRadius: '16px',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              overflow: 'hidden',
            }}
          >
            <button
              onClick={() => setShowRejectedTray(!showRejectedTray)}
              style={{
                width: '100%',
                padding: '1.25rem 1.5rem',
                background: 'transparent',
                border: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#EF4444',
                  }}
                >
                  <XCircle size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#FCA5A5' }}>
                    Archived & Rejected Candidates ({columnApplicants.rejected.length})
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Applicants that did not meet minimum criteria or were passed over
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                <span style={{ fontSize: '0.8rem' }}>
                  {showRejectedTray ? 'Hide Archive' : 'View Archive'}
                </span>
                {showRejectedTray ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </button>

            {showRejectedTray && (
              <div
                style={{
                  padding: '1.25rem 1.5rem 1.75rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '1rem',
                }}
              >
                {columnApplicants.rejected.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                    No candidates currently in the rejected archive.
                  </p>
                ) : (
                  columnApplicants.rejected.map((app) => (
                    <CandidateCard
                      key={app._id}
                      application={app}
                      onTransition={handleTransition}
                      onViewResume={() => setSelectedCandidate(app)}
                      isRejectedColumn
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Candidate Resume & AI Scorecard Modal */}
      {selectedCandidate && (
        <ResumeDetailModal
          candidateApp={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          onTransition={handleTransition}
        />
      )}
    </div>
  );
};

/**
 * Individual Candidate Kanban Card Component
 */
const CandidateCard = ({ application, onTransition, onViewResume, isRejectedColumn }) => {
  const candidate = application.candidate || {};
  const score = application.aiMatchScore || 0;

  // Score badge coloring
  const getScoreColor = (sc) => {
    if (sc >= 80) return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', border: 'rgba(16, 185, 129, 0.35)' };
    if (sc >= 65) return { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.35)' };
    return { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.35)' };
  };

  const scoreTheme = getScoreColor(score);
  const initials = candidate.name
    ? candidate.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'CA';

  return (
    <div
      className="card-glass"
      style={{
        padding: '1.25rem',
        borderRadius: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.9rem',
        background: 'rgba(17, 24, 39, 0.85)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.35)',
        transition: 'transform 0.2s ease, border-color 0.2s ease',
      }}
    >
      {/* Top: Avatar, Name, and Score Gauge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.35), rgba(6, 182, 212, 0.35))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div>
            <h4
              style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: 0,
                lineHeight: 1.25,
              }}
            >
              {candidate.name || 'Anonymous Candidate'}
            </h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {candidate.email || 'applicant@jobmatch.ai'}
            </span>
          </div>
        </div>

        {/* AI Score Badge */}
        <div
          style={{
            padding: '0.25rem 0.6rem',
            borderRadius: '9999px',
            background: scoreTheme.bg,
            border: `1px solid ${scoreTheme.border}`,
            color: scoreTheme.text,
            fontSize: '0.76rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            whiteSpace: 'nowrap',
          }}
          title={`Gemini AI Match Score: ${score}%`}
        >
          <Sparkles size={12} />
          <span>{score}% Match</span>
        </div>
      </div>

      {/* Target role / Location if available */}
      {candidate.profile?.targetRole && (
        <div style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', fontWeight: 500 }}>
          {candidate.profile.targetRole}
        </div>
      )}

      {/* Matched vs Missing Skills Chips */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {/* Matched Skills */}
        {application.matchedSkills && application.matchedSkills.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
            {application.matchedSkills.slice(0, 3).map((skill, idx) => (
              <span
                key={idx}
                style={{
                  padding: '0.15rem 0.5rem',
                  borderRadius: '6px',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  fontSize: '0.7rem',
                  color: '#A7F3D0',
                  fontWeight: 600,
                }}
              >
                ✓ {skill}
              </span>
            ))}
            {application.matchedSkills.length > 3 && (
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                +{application.matchedSkills.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Missing Gap Skills */}
        {application.missingSkills && application.missingSkills.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
            {application.missingSkills.slice(0, 2).map((skill, idx) => (
              <span
                key={idx}
                style={{
                  padding: '0.15rem 0.5rem',
                  borderRadius: '6px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  fontSize: '0.7rem',
                  color: '#FCA5A5',
                }}
              >
                ✕ {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* AI Synthesis Recruiter Fit Note */}
      {application.fitSummary && (
        <p
          style={{
            fontSize: '0.76rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.45,
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.02)',
            padding: '0.5rem 0.65rem',
            borderRadius: '8px',
            borderLeft: '2px solid var(--accent-indigo)',
          }}
        >
          "{application.fitSummary}"
        </p>
      )}

      {/* Resume CTA and One-Click Transition Action Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.5rem',
          paddingTop: '0.65rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        <button
          type="button"
          onClick={onViewResume}
          className="btn btn-ghost"
          style={{
            padding: '0.35rem 0.6rem',
            fontSize: '0.74rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            color: 'var(--accent-cyan)',
          }}
        >
          <FileText size={13} />
          <span>Scorecard</span>
        </button>

        {/* 1-Click Quick Move Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          {application.status !== 'shortlisted' && (
            <button
              onClick={() => onTransition(application._id, 'shortlisted', candidate.name)}
              style={{
                padding: '0.35rem 0.55rem',
                borderRadius: '6px',
                background: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                color: '#A5B4FC',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem',
              }}
              title="Move to Shortlisted"
            >
              <Star size={12} />
              Shortlist
            </button>
          )}

          {application.status !== 'interview' && (
            <button
              onClick={() => onTransition(application._id, 'interview', candidate.name)}
              style={{
                padding: '0.35rem 0.55rem',
                borderRadius: '6px',
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: '#FCD34D',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem',
              }}
              title="Move to Interview"
            >
              <MessageSquare size={12} />
              Interview
            </button>
          )}

          {application.status !== 'hired' && application.status !== 'rejected' && (
            <button
              onClick={() => onTransition(application._id, 'hired', candidate.name)}
              style={{
                padding: '0.35rem 0.55rem',
                borderRadius: '6px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#6EE7B7',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem',
              }}
              title="Hire Candidate"
            >
              <CheckCircle2 size={12} />
              Hire
            </button>
          )}

          {application.status !== 'rejected' ? (
            <button
              onClick={() => onTransition(application._id, 'rejected', candidate.name)}
              style={{
                padding: '0.35rem 0.5rem',
                borderRadius: '6px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#FCA5A5',
                fontSize: '0.72rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Reject & Archive Candidate"
            >
              <X size={13} />
            </button>
          ) : (
            <button
              onClick={() => onTransition(application._id, 'applied', candidate.name)}
              style={{
                padding: '0.35rem 0.55rem',
                borderRadius: '6px',
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: '#7DD3FC',
                fontSize: '0.72rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
              title="Restore to Applied"
            >
              <RotateCcw size={12} />
              Restore
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Full Resume & ATS AI Scorecard Modal
 */
const ResumeDetailModal = ({ candidateApp, onClose, onTransition }) => {
  const candidate = candidateApp.candidate || {};
  const score = candidateApp.aiMatchScore || 0;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        padding: '1.5rem',
      }}
      onClick={onClose}
    >
      <div
        className="card-glass"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '2.5rem',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          backgroundColor: 'rgba(13, 17, 26, 0.98)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
          animation: 'fadeIn 0.25s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '1.5rem',
            paddingBottom: '1.25rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
                {candidate.name || 'Candidate Profile'}
              </h2>
              <span
                style={{
                  padding: '0.2rem 0.6rem',
                  borderRadius: '9999px',
                  background: 'rgba(99, 102, 241, 0.2)',
                  color: '#818CF8',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                {candidateApp.status}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
              {candidate.email} {candidate.profile?.location ? `• ${candidate.profile.location}` : ''}
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              borderRadius: '8px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.4rem',
              display: 'flex',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* AI Match Overview Box */}
        <div
          style={{
            padding: '1.5rem',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.12), rgba(6, 182, 212, 0.12))',
            border: '1px solid rgba(138, 43, 226, 0.3)',
            marginBottom: '1.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
              <Sparkles size={16} color="#F59E0B" />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', color: '#FCD34D' }}>
                Gemini ATS Evaluation
              </span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFFFFF' }}>
              {score}% Match Score
            </div>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Recommendation Tier: <strong style={{ color: '#10B981' }}>{candidateApp.recommendation || 'Strong Match'}</strong>
            </span>
          </div>

          <div
            style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              border: `4px solid ${score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.25rem',
              color: '#FFFFFF',
              background: 'rgba(0, 0, 0, 0.3)',
            }}
          >
            {score}%
          </div>
        </div>

        {/* Matched Skills */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.6rem', color: '#A7F3D0' }}>
            ✓ Verified Matched Skills ({candidateApp.matchedSkills?.length || 0})
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
            {candidateApp.matchedSkills && candidateApp.matchedSkills.length > 0 ? (
              candidateApp.matchedSkills.map((s, idx) => (
                <span
                  key={idx}
                  style={{
                    padding: '0.3rem 0.75rem',
                    borderRadius: '8px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#A7F3D0',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}
                >
                  ✓ {s}
                </span>
              ))
            ) : (
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>None identified</span>
            )}
          </div>
        </div>

        {/* Missing / Gap Skills */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.6rem', color: '#FCA5A5' }}>
            ✕ Identified Skill Gaps ({candidateApp.missingSkills?.length || 0})
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
            {candidateApp.missingSkills && candidateApp.missingSkills.length > 0 ? (
              candidateApp.missingSkills.map((s, idx) => (
                <span
                  key={idx}
                  style={{
                    padding: '0.3rem 0.75rem',
                    borderRadius: '8px',
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.28)',
                    color: '#FCA5A5',
                    fontSize: '0.8rem',
                  }}
                >
                  ✕ {s}
                </span>
              ))
            ) : (
              <span style={{ fontSize: '0.82rem', color: '#10B981' }}>
                Zero skill gaps detected! Complete technical coverage.
              </span>
            )}
          </div>
        </div>

        {/* Experience Fit Evaluation */}
        {candidateApp.experienceFit && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.45rem', color: '#93C5FD' }}>
              Seniority & Experience Alignment
            </h4>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
              {candidateApp.experienceFit}
            </p>
          </div>
        )}

        {/* Recruiter Fit Summary */}
        {candidateApp.fitSummary && (
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.45rem', color: '#FCD34D' }}>
              ATS Recruiter Executive Synthesis
            </h4>
            <div
              style={{
                padding: '1rem 1.25rem',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                fontSize: '0.88rem',
                color: 'var(--text-primary)',
                lineHeight: 1.6,
              }}
            >
              {candidateApp.fitSummary}
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {candidateApp.resumeUrl ? (
            <a
              href={candidateApp.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
              style={{
                padding: '0.65rem 1.2rem',
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <ExternalLink size={15} />
              Open Original PDF Resume
            </a>
          ) : (
            <div />
          )}

          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button
              onClick={() => {
                onTransition(candidateApp._id, 'shortlisted', candidate.name);
                onClose();
              }}
              className="btn"
              style={{
                padding: '0.65rem 1.15rem',
                fontSize: '0.85rem',
                background: 'rgba(99, 102, 241, 0.25)',
                color: '#C7D2FE',
                border: '1px solid rgba(99, 102, 241, 0.4)',
              }}
            >
              ⭐ Shortlist
            </button>
            <button
              onClick={() => {
                onTransition(candidateApp._id, 'interview', candidate.name);
                onClose();
              }}
              className="btn"
              style={{
                padding: '0.65rem 1.15rem',
                fontSize: '0.85rem',
                background: 'rgba(245, 158, 11, 0.25)',
                color: '#FDE68A',
                border: '1px solid rgba(245, 158, 11, 0.4)',
              }}
            >
              💬 Interview
            </button>
            <button
              onClick={() => {
                onTransition(candidateApp._id, 'hired', candidate.name);
                onClose();
              }}
              className="btn btn-primary"
              style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}
            >
              🎉 Hire Candidate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobApplicants;
