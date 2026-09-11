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
  Calendar,
  LayoutList,
  Columns3,
  Gift,
} from 'lucide-react';
import api from '../services/api';
import { FALLBACK_JOBS } from '../data/fallbackJobs';
import { getDemoApplicantsForJob } from '../utils/demoApplicants';
import { useToast } from '../context/ToastContext';
import ScheduleInterviewModal from '../components/ScheduleInterviewModal';
import KanbanBoard from '../components/KanbanBoard';

const PIPELINE_COLUMNS = [
  {
    id: 'applied',
    title: 'Applied',
    subtitle: 'New Submissions',
    icon: Users,
    color: 'var(--accent-teal)',
    accentBg: 'var(--accent-teal-light)',
    borderTop: 'var(--accent-teal)',
  },
  {
    id: 'shortlisted',
    title: 'Shortlisted',
    subtitle: 'High AI Alignment',
    icon: Star,
    color: 'var(--accent-teal-mid)',
    accentBg: 'var(--accent-teal-light)',
    borderTop: 'var(--accent-teal-mid)',
  },
  {
    id: 'interview',
    title: 'Interview',
    subtitle: 'Rounds in Progress',
    icon: MessageSquare,
    color: 'var(--accent-teal)',
    accentBg: 'var(--accent-teal-light)',
    borderTop: 'var(--accent-teal)',
  },
  {
    id: 'offer',
    title: 'Offer',
    subtitle: 'Pending Acceptance',
    icon: Gift,
    color: 'var(--semantic-green)',
    accentBg: 'rgba(45, 122, 58, 0.1)',
    borderTop: 'var(--semantic-green)',
  },
  {
    id: 'hired',
    title: 'Hired',
    subtitle: 'Offers Extended',
    icon: CheckCircle2,
    color: 'var(--semantic-green)',
    accentBg: 'rgba(45, 122, 58, 0.1)',
    borderTop: 'var(--semantic-green)',
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
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'

  // Resume / Candidate Detail Modal
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Native Interview Scheduling Modal
  const [schedulingApplicant, setSchedulingApplicant] = useState(null);

  const handleInterviewScheduled = (_newInterview, applicationId) => {
    setApplicants((prev) =>
      prev.map((app) => (app._id === applicationId ? { ...app, status: 'interview' } : app))
    );
    setSchedulingApplicant(null);
  };

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

    try {
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

    if (scoreFilter === '75') {
      list = list.filter((a) => (a.aiMatchScore || 0) >= 75);
    } else if (scoreFilter === '50') {
      list = list.filter((a) => (a.aiMatchScore || 0) >= 50);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.candidate?.name?.toLowerCase().includes(q) ||
          a.candidate?.email?.toLowerCase().includes(q) ||
          (a.matchedSkills && a.matchedSkills.some((s) => s.toLowerCase().includes(q)))
      );
    }

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
      offer: [],
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
            color: 'var(--accent-teal)',
            fontSize: '0.9rem',
            fontWeight: 600,
            transition: 'var(--transition)',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to My Postings</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div
        className="paper-card"
        style={{
          padding: '2.25rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
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
                  letterSpacing: '0.01em',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '4px',
                  background: 'var(--accent-teal-light)',
                  color: 'var(--accent-teal)',
                  border: '1px solid rgba(15, 107, 92, 0.25)',
                }}
              >
                ATS candidate pipeline
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Powered by Gemini 2.5 Flash
              </span>
            </div>

            <h1
              style={{
                fontFamily: "'Newsreader', Georgia, serif",
                fontSize: '2.2rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                marginBottom: '0.4rem',
                color: 'var(--text-primary)',
              }}
            >
              {job?.title || 'Engineering Role'}
            </h1>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1.25rem',
                fontSize: '0.88rem',
                color: 'var(--text-secondary)',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Building2 size={15} color="var(--accent-teal)" />
                {job?.company || 'Company'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Briefcase size={15} color="var(--accent-teal)" />
                {job?.location || 'Location'}
              </span>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div
              style={{
                padding: '0.75rem 1.25rem',
                borderRadius: '6px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-default)',
                textAlign: 'center',
                minWidth: '100px',
              }}
            >
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {metrics.total}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.01em' }}>
                Total resumes
              </div>
            </div>

            <div
              style={{
                padding: '0.75rem 1.25rem',
                borderRadius: '6px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-default)',
                textAlign: 'center',
                minWidth: '100px',
              }}
            >
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--semantic-green)' }}>
                {metrics.strongMatches}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.01em' }}>
                Strong fit (≥75%)
              </div>
            </div>

            <div
              style={{
                padding: '0.75rem 1.25rem',
                borderRadius: '6px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-default)',
                textAlign: 'center',
                minWidth: '100px',
              }}
            >
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-teal)' }}>
                {metrics.inPipeline}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.01em' }}>
                In interview
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Controls & Filter Bar */}
      <div
        className="paper-card"
        style={{
          padding: '1.25rem 1.75rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
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

          <button
            onClick={() => setScoreFilter('all')}
            className={scoreFilter === 'all' ? 'btn btn-primary' : 'btn btn-secondary'}
            style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem' }}
          >
            All ({applicants.length})
          </button>

          <button
            onClick={() => setScoreFilter('75')}
            className={scoreFilter === '75' ? 'btn btn-primary' : 'btn btn-secondary'}
            style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem' }}
          >
            Strong Match ≥ 75% ({applicants.filter((a) => (a.aiMatchScore || 0) >= 75).length})
          </button>

          <button
            onClick={() => setScoreFilter('50')}
            className={scoreFilter === '50' ? 'btn btn-primary' : 'btn btn-secondary'}
            style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem' }}
          >
            Moderate ≥ 50% ({applicants.filter((a) => (a.aiMatchScore || 0) >= 50).length})
          </button>
        </div>

        {/* Right: Search Input & Sort Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', minWidth: '220px' }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              placeholder="Filter by candidate or skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{
                paddingLeft: '2.4rem',
                paddingTop: '0.45rem',
                paddingBottom: '0.45rem',
                fontSize: '0.82rem',
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--bg-secondary)',
              borderRadius: '6px',
              padding: '0.2rem',
              border: '1px solid var(--border-default)',
            }}
          >
            <button
              onClick={() => setSortBy('score')}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '4px',
                border: 'none',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: sortBy === 'score' ? 'var(--accent-teal)' : 'transparent',
                color: sortBy === 'score' ? '#FFFFFF' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <Sparkles size={13} />
              AI Fit
            </button>
            <button
              onClick={() => setSortBy('date')}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '4px',
                border: 'none',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: sortBy === 'date' ? 'var(--accent-teal)' : 'transparent',
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

          {/* View Mode Toggle */}
          <div className="view-toggle-pill">
            <button
              onClick={() => setViewMode('kanban')}
              className={`view-toggle-btn ${viewMode === 'kanban' ? 'active' : ''}`}
            >
              <Columns3 size={13} />
              Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            >
              <LayoutList size={13} />
              List
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div
          className="paper-card"
          style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
          }}
        >
          <Loader2 className="spin" size={36} color="var(--accent-teal)" />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Assembling ATS Kanban Board & Scoring Pipelines...
          </p>
        </div>
      ) : (
        <>
          {/* Kanban Drag-and-Drop View */}
          {viewMode === 'kanban' && (
            <KanbanBoard
              applicants={processedApplicants}
              setApplicants={setApplicants}
              onViewResume={(app) => setSelectedCandidate(app)}
              onScheduleInterview={(app) => setSchedulingApplicant(app)}
              job={job}
            />
          )}

          {/* List / Column Grid View */}
          {viewMode === 'list' && (
          <div
            className="kanban-scroll-container"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.25rem',
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
                    borderRadius: '8px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-default)',
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
                      background: 'var(--bg-card)',
                      borderBottom: '1px solid var(--border-default)',
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
                          borderRadius: '6px',
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
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', fontFamily: "'Newsreader', Georgia, serif" }}>
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
                        borderRadius: '4px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-default)',
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
                          borderRadius: '6px',
                          border: '1px dashed var(--border-default)',
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
                          onScheduleInterview={(appToSchedule) => setSchedulingApplicant(appToSchedule)}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          )}

          {/* Collapsible Rejected / Archived Tray */}
          <div
            className="paper-card"
            style={{
              borderRadius: '8px',
              border: '1px solid var(--border-default)',
              overflow: 'hidden',
              background: 'var(--bg-card)',
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
                    borderRadius: '6px',
                    background: 'rgba(185, 28, 28, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--semantic-red)',
                  }}
                >
                  <XCircle size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                    Archived / Rejected Candidates ({columnApplicants.rejected?.length || 0})
                  </h4>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    Stored with transparent feedback for talent pool re-engagement
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                {showRejectedTray ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </button>

            {showRejectedTray && (
              <div
                style={{
                  padding: '1rem 1.5rem 1.5rem',
                  borderTop: '1px solid var(--border-default)',
                  background: 'var(--bg-secondary)',
                }}
              >
                {columnApplicants.rejected?.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                    No candidates are currently archived or rejected.
                  </p>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                      gap: '1rem',
                    }}
                  >
                    {columnApplicants.rejected.map((app) => (
                      <CandidateCard
                        key={app._id}
                        application={app}
                        onTransition={handleTransition}
                        onViewResume={() => setSelectedCandidate(app)}
                        onScheduleInterview={(appToSchedule) => setSchedulingApplicant(appToSchedule)}
                        isRejectedColumn
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Candidate Scorecard Modal */}
      {selectedCandidate && (
        <ResumeDetailModal
          candidateApp={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          onTransition={handleTransition}
          onScheduleInterview={(appToSchedule) => setSchedulingApplicant(appToSchedule)}
        />
      )}

      {/* Native Schedule Interview Modal */}
      {schedulingApplicant && (
        <ScheduleInterviewModal
          isOpen={!!schedulingApplicant}
          onClose={() => setSchedulingApplicant(null)}
          application={schedulingApplicant}
          job={job}
          onSuccess={handleInterviewScheduled}
        />
      )}
    </div>
  );
};

const CandidateCard = ({
  application,
  onTransition,
  onViewResume,
  onScheduleInterview,
  _isRejectedColumn,
}) => {
  const candidate = application.candidate || {};
  const score = application.aiMatchScore || 0;

  const scoreTheme =
    score >= 75
      ? { bg: 'rgba(45, 122, 58, 0.1)', text: 'var(--semantic-green)', border: 'rgba(45, 122, 58, 0.25)' }
      : score >= 50
      ? { bg: 'rgba(180, 83, 9, 0.1)', text: 'var(--semantic-amber)', border: 'rgba(180, 83, 9, 0.25)' }
      : { bg: 'rgba(185, 28, 28, 0.1)', text: 'var(--semantic-red)', border: 'rgba(185, 28, 28, 0.25)' };

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
      className="paper-card"
      style={{
        padding: '1.25rem',
        borderRadius: '6px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
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
              borderRadius: '6px',
              background: 'var(--accent-teal-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem',
              color: 'var(--accent-teal)',
              border: '1px solid rgba(15, 107, 92, 0.25)',
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
            borderRadius: '4px',
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
          <span>{score}% Fit</span>
        </div>
      </div>

      {/* Target role / Location if available */}
      {candidate.profile?.targetRole && (
        <div style={{ fontSize: '0.78rem', color: 'var(--accent-teal)', fontWeight: 500 }}>
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
                  borderRadius: '3px',
                  background: 'var(--accent-teal-light)',
                  border: '1px solid rgba(15, 107, 92, 0.25)',
                  fontSize: '0.7rem',
                  color: 'var(--accent-teal)',
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
                  borderRadius: '3px',
                  background: 'rgba(185, 28, 28, 0.08)',
                  border: '1px solid rgba(185, 28, 28, 0.22)',
                  fontSize: '0.7rem',
                  color: 'var(--semantic-red)',
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
            background: 'var(--bg-primary)',
            padding: '0.5rem 0.65rem',
            borderRadius: '4px',
            borderLeft: '2px solid var(--accent-teal)',
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
          borderTop: '1px solid var(--border-default)',
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
            color: 'var(--accent-teal)',
          }}
        >
          <FileText size={13} />
          <span>Scorecard</span>
        </button>

        {/* 1-Click Quick Move Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
          {/* Prominent "Schedule Interview" button on shortlisted candidate cards */}
          {application.status === 'shortlisted' && (
            <button
              type="button"
              onClick={() => onScheduleInterview && onScheduleInterview(application)}
              style={{
                padding: '0.35rem 0.65rem',
                borderRadius: '4px',
                background: 'var(--accent-teal)',
                border: '1px solid var(--accent-teal)',
                color: '#FFFFFF',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                boxShadow: '0 1px 3px rgba(15, 107, 92, 0.2)',
                transition: 'all 0.15s ease',
              }}
              title="Schedule Native Interview"
            >
              <Calendar size={13} />
              Schedule Interview
            </button>
          )}

          {application.status !== 'shortlisted' && (
            <button
              onClick={() => onTransition(application._id, 'shortlisted', candidate.name)}
              style={{
                padding: '0.35rem 0.55rem',
                borderRadius: '4px',
                background: 'var(--accent-teal-light)',
                border: '1px solid rgba(15, 107, 92, 0.25)',
                color: 'var(--accent-teal)',
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

          {application.status !== 'interview' && application.status !== 'shortlisted' && (
            <button
              onClick={() => {
                if (onScheduleInterview) {
                  onScheduleInterview(application);
                } else {
                  onTransition(application._id, 'interview', candidate.name);
                }
              }}
              style={{
                padding: '0.35rem 0.55rem',
                borderRadius: '4px',
                background: 'rgba(180, 83, 9, 0.1)',
                border: '1px solid rgba(180, 83, 9, 0.25)',
                color: 'var(--semantic-amber)',
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
                borderRadius: '4px',
                background: 'rgba(45, 122, 58, 0.1)',
                border: '1px solid rgba(45, 122, 58, 0.25)',
                color: 'var(--semantic-green)',
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
                borderRadius: '4px',
                background: 'rgba(185, 28, 28, 0.08)',
                border: '1px solid rgba(185, 28, 28, 0.22)',
                color: 'var(--semantic-red)',
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
                borderRadius: '4px',
                background: 'var(--accent-teal-light)',
                border: '1px solid rgba(15, 107, 92, 0.25)',
                color: 'var(--accent-teal)',
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

const ResumeDetailModal = ({ candidateApp, onClose, onTransition, onScheduleInterview }) => {
  const candidate = candidateApp.candidate || {};
  const score = candidateApp.aiMatchScore || 0;

  const scoreColor =
    score >= 75
      ? 'var(--semantic-green)'
      : score >= 45
      ? 'var(--semantic-amber)'
      : 'var(--semantic-red)';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="paper-card"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '2.5rem',
          borderRadius: '8px',
          border: '1px solid var(--border-default)',
          backgroundColor: 'var(--bg-card)',
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.12)',
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
            borderBottom: '1px solid var(--border-default)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', fontFamily: "'Newsreader', Georgia, serif" }}>
                {candidate.name || 'Candidate Profile'}
              </h2>
              <span
                style={{
                  padding: '0.2rem 0.6rem',
                  borderRadius: '4px',
                  background: 'var(--accent-teal-light)',
                  color: 'var(--accent-teal)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.01em',
                  textTransform: 'capitalize',
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
              background: 'transparent',
              border: 'none',
              borderRadius: '4px',
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
            borderRadius: '6px',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-default)',
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
              <Sparkles size={16} color="var(--accent-teal)" />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.01em', color: 'var(--accent-teal)' }}>
                Gemini ATS evaluation
              </span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {score}% Match Score
            </div>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Recommendation Tier: <strong style={{ color: scoreColor }}>{candidateApp.recommendation || 'Strong Match'}</strong>
            </span>
          </div>

          <div
            style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              border: `4px solid ${scoreColor}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.25rem',
              color: scoreColor,
              background: 'var(--bg-card)',
            }}
          >
            {score}%
          </div>
        </div>

        {/* Matched Skills */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.6rem', color: 'var(--semantic-green)' }}>
            ✓ Verified Matched Skills ({candidateApp.matchedSkills?.length || 0})
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
            {candidateApp.matchedSkills && candidateApp.matchedSkills.length > 0 ? (
              candidateApp.matchedSkills.map((s, idx) => (
                <span
                  key={idx}
                  style={{
                    padding: '0.3rem 0.75rem',
                    borderRadius: '4px',
                    background: 'var(--accent-teal-light)',
                    border: '1px solid rgba(15, 107, 92, 0.25)',
                    color: 'var(--accent-teal)',
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
          <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.6rem', color: 'var(--semantic-red)' }}>
            ✕ Identified Skill Gaps ({candidateApp.missingSkills?.length || 0})
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
            {candidateApp.missingSkills && candidateApp.missingSkills.length > 0 ? (
              candidateApp.missingSkills.map((s, idx) => (
                <span
                  key={idx}
                  style={{
                    padding: '0.3rem 0.75rem',
                    borderRadius: '4px',
                    background: 'rgba(185, 28, 28, 0.08)',
                    border: '1px solid rgba(185, 28, 28, 0.22)',
                    color: 'var(--semantic-red)',
                    fontSize: '0.8rem',
                  }}
                >
                  ✕ {s}
                </span>
              ))
            ) : (
              <span style={{ fontSize: '0.82rem', color: 'var(--semantic-green)' }}>
                Zero skill gaps detected! Complete technical coverage.
              </span>
            )}
          </div>
        </div>

        {/* Experience Fit Evaluation */}
        {candidateApp.experienceFit && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.45rem', color: 'var(--accent-teal)' }}>
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
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.45rem', color: 'var(--accent-teal)' }}>
              ATS Recruiter Executive Synthesis
            </h4>
            <div
              style={{
                padding: '1rem 1.25rem',
                borderRadius: '6px',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-default)',
                borderLeft: '3px solid var(--accent-teal)',
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
            borderTop: '1px solid var(--border-default)',
          }}
        >
          {candidateApp.resumeUrl ? (
            <a
              href={candidateApp.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
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
              className="btn btn-secondary"
              style={{
                padding: '0.65rem 1.15rem',
                fontSize: '0.85rem',
                borderColor: 'rgba(15, 107, 92, 0.3)',
                color: 'var(--accent-teal)',
              }}
            >
              ⭐ Shortlist
            </button>

            {candidateApp.status === 'shortlisted' ? (
              <button
                onClick={() => {
                  onClose();
                  if (onScheduleInterview) onScheduleInterview(candidateApp);
                }}
                className="btn btn-primary"
                style={{
                  padding: '0.65rem 1.25rem',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'var(--accent-teal)',
                }}
              >
                <Calendar size={15} />
                Schedule Interview
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  if (onScheduleInterview) {
                    onScheduleInterview(candidateApp);
                  } else {
                    onTransition(candidateApp._id, 'interview', candidate.name);
                  }
                }}
                className="btn btn-secondary"
                style={{
                  padding: '0.65rem 1.15rem',
                  fontSize: '0.85rem',
                  borderColor: 'rgba(180, 83, 9, 0.3)',
                  color: 'var(--semantic-amber)',
                }}
              >
                💬 Interview
              </button>
            )}
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
