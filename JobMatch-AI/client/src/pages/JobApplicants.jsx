import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Users,
  Star,
  MessageSquare,
  CheckCircle2,
  XCircle,
  FileText,
  Filter,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
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
import InterviewKitModal from '../components/InterviewKitModal';
import CandidateCompareModal from '../components/CandidateCompareModal';
import ApplicantSideDrawer from '../components/ApplicantSideDrawer';
import { Scale } from 'lucide-react';

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
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [allJobs, setAllJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Sort State
  const [scoreFilter, setScoreFilter] = useState('all'); // 'all', '75', '50'
  const [selectedSkillFilter, setSelectedSkillFilter] = useState(null);
  const [sortBy, setSortBy] = useState('score'); // 'score', 'date'
  const [searchQuery, setSearchQuery] = useState('');
  const [showRejectedTray, setShowRejectedTray] = useState(false);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'

  // Resume / Candidate Detail Modal
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Native Interview Scheduling Modal
  const [schedulingApplicant, setSchedulingApplicant] = useState(null);
  // AI Interview Question Kit Modal
  const [selectedKitCandidate, setSelectedKitCandidate] = useState(null);

  const handleInterviewScheduled = (_newInterview, applicationId) => {
    setApplicants((prev) =>
      prev.map((app) => (app._id === applicationId ? { ...app, status: 'interview' } : app))
    );
    setSchedulingApplicant(null);
  };

  // Global Toast
  const { showToast } = useToast();

  // Load all jobs for switcher
  useEffect(() => {
    const fetchAllJobs = async () => {
      try {
        const res = await api.get('/jobs');
        if (Array.isArray(res.data) && res.data.length > 0) {
          setAllJobs(res.data);
        } else {
          setAllJobs(FALLBACK_JOBS);
        }
      } catch {
        setAllJobs(FALLBACK_JOBS);
      }
    };
    fetchAllJobs();
  }, []);

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
            title: 'Senior Full-Stack MERN Systems Engineer',
            company: 'Acme Payments',
            location: 'Bengaluru, India (Remote)',
            requiredSkills: ['React', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL'],
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

  // Derive unique skills from job and applicants for filter chips
  const availableSkills = useMemo(() => {
    const skillSet = new Set();
    if (job?.requiredSkills && Array.isArray(job.requiredSkills)) {
      job.requiredSkills.forEach((s) => skillSet.add(s));
    }
    applicants.forEach((app) => {
      (app.matchedSkills || []).forEach((s) => skillSet.add(s));
    });
    return Array.from(skillSet).slice(0, 10);
  }, [job, applicants]);

  // 1-Click Status Transition Handler with optimistic update and rollback
  const handleTransition = async (applicationId, newStatus, candidateName) => {
    const targetApp = applicants.find((app) => app._id === applicationId);
    const previousStatus = targetApp?.status || 'applied';

    setApplicants((prev) =>
      prev.map((app) => (app._id === applicationId ? { ...app, status: newStatus } : app))
    );

    const statusLabels = {
      applied: 'Applied',
      shortlisted: 'Shortlisted',
      interview: 'Interview Scheduled',
      offer: 'Offer Extended',
      hired: 'Hired',
      rejected: 'Archived / Rejected',
    };

    showToast(`${candidateName || 'Candidate'} moved to ${statusLabels[newStatus] || newStatus}.`, 'success');

    try {
      if (!applicationId.toString().startsWith('demo_')) {
        await api.patch(`/applications/${applicationId}/status`, { status: newStatus });
      }
    } catch (err) {
      console.warn('Status update API call error, rolling back optimistic state:', err.message);
      // Revert optimistic update on failure
      setApplicants((prev) =>
        prev.map((app) => (app._id === applicationId ? { ...app, status: previousStatus } : app))
      );
      showToast('Failed to update status. Reverted.', 'error');
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

    if (selectedSkillFilter) {
      list = list.filter((a) =>
        (a.matchedSkills || []).some(
          (s) => s.toLowerCase() === selectedSkillFilter.toLowerCase()
        )
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.candidate?.name?.toLowerCase().includes(q) ||
          a.candidateName?.toLowerCase().includes(q) ||
          a.candidate?.email?.toLowerCase().includes(q) ||
          (a.matchedSkills && a.matchedSkills.some((s) => s.toLowerCase().includes(q))) ||
          (a.missingSkills && a.missingSkills.some((s) => s.toLowerCase().includes(q)))
      );
    }

    if (sortBy === 'score') {
      list.sort((a, b) => (b.aiMatchScore || 0) - (a.aiMatchScore || 0));
    } else if (sortBy === 'date') {
      list.sort((a, b) => new Date(b.appliedAt || 0) - new Date(a.appliedAt || 0));
    }

    return list;
  }, [applicants, scoreFilter, selectedSkillFilter, searchQuery, sortBy]);

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
                Candidate Pipeline
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

      {/* Filter and Control Bar */}
      <div
        className="paper-card"
        style={{
          padding: '1.25rem 1.75rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
        }}
      >
        {/* Top Controls Row: Job Switcher, Search Input, Sort & View Mode */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          {/* Left: Job Switcher */}
          {allJobs.length > 1 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '220px' }}>
              <Briefcase size={15} color="var(--accent-teal)" />
              <label htmlFor="job-selector" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Job:
              </label>
              <select
                id="job-selector"
                value={jobId}
                onChange={(e) => navigate(`/applicants/${e.target.value}`)}
                className="form-input"
                style={{
                  padding: '0.4rem 0.75rem',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  maxWidth: '280px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                {allJobs.map((j) => (
                  <option key={j._id} value={j._id}>
                    {j.title} ({j.company || 'Company'})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              <Briefcase size={15} color="var(--accent-teal)" />
              <span>{job?.title || 'Open Position'}</span>
            </div>
          )}

          {/* Right: Search + Sort + View */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
            <div style={{ position: 'relative', minWidth: '240px', flex: 1, maxWidth: '360px' }}>
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
                placeholder="Search candidate name, email, or skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{
                  width: '100%',
                  paddingLeft: '2.4rem',
                  paddingRight: searchQuery ? '2rem' : '0.85rem',
                  paddingTop: '0.45rem',
                  paddingBottom: '0.45rem',
                  fontSize: '0.82rem',
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '0.6rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                  }}
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              )}
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
                type="button"
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
                }}
              >
                Match Score
              </button>
              <button
                type="button"
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
                type="button"
                onClick={() => setViewMode('kanban')}
                className={`view-toggle-btn ${viewMode === 'kanban' ? 'active' : ''}`}
              >
                <Columns3 size={13} />
                Kanban
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              >
                <LayoutList size={13} />
                List
              </button>
            </div>
          </div>
        </div>

        {/* Filter Chips Row: Score Chips & Skill Chips */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-default)',
          }}
        >
          {/* Min Score & Skill Filter Chips */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                marginRight: '0.2rem',
              }}
            >
              <Filter size={13} />
              Filter:
            </span>

            {/* Score chips */}
            <button
              type="button"
              onClick={() => setScoreFilter('all')}
              style={{
                padding: '0.28rem 0.65rem',
                borderRadius: '4px',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: scoreFilter === 'all' ? '1px solid var(--accent-teal)' : '1px solid var(--border-default)',
                background: scoreFilter === 'all' ? 'var(--accent-teal)' : 'var(--bg-secondary)',
                color: scoreFilter === 'all' ? '#FFFFFF' : 'var(--text-secondary)',
                transition: 'all 0.15s ease',
              }}
            >
              All ({applicants.length})
            </button>
            <button
              type="button"
              onClick={() => setScoreFilter('75')}
              style={{
                padding: '0.28rem 0.65rem',
                borderRadius: '4px',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: scoreFilter === '75' ? '1px solid var(--accent-teal)' : '1px solid var(--border-default)',
                background: scoreFilter === '75' ? 'var(--accent-teal)' : 'var(--bg-secondary)',
                color: scoreFilter === '75' ? '#FFFFFF' : 'var(--text-secondary)',
                transition: 'all 0.15s ease',
              }}
            >
              Strong Fit ≥ 75% ({applicants.filter((a) => (a.aiMatchScore || 0) >= 75).length})
            </button>
            <button
              type="button"
              onClick={() => setScoreFilter('50')}
              style={{
                padding: '0.28rem 0.65rem',
                borderRadius: '4px',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: scoreFilter === '50' ? '1px solid var(--accent-teal)' : '1px solid var(--border-default)',
                background: scoreFilter === '50' ? 'var(--accent-teal)' : 'var(--bg-secondary)',
                color: scoreFilter === '50' ? '#FFFFFF' : 'var(--text-secondary)',
                transition: 'all 0.15s ease',
              }}
            >
              Moderate ≥ 50% ({applicants.filter((a) => (a.aiMatchScore || 0) >= 50).length})
            </button>

            {/* Divider */}
            {availableSkills.length > 0 && (
              <span style={{ color: 'var(--border-default)', margin: '0 0.2rem' }}>|</span>
            )}

            {/* Skill Chips */}
            {availableSkills.map((skill) => {
              const isSelected = selectedSkillFilter?.toLowerCase() === skill.toLowerCase();
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => setSelectedSkillFilter(isSelected ? null : skill)}
                  style={{
                    padding: '0.28rem 0.65rem',
                    borderRadius: '12px',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: isSelected ? '1px solid var(--accent-teal)' : '1px solid var(--border-default)',
                    background: isSelected ? 'var(--accent-teal-light)' : 'var(--bg-primary)',
                    color: isSelected ? 'var(--accent-teal)' : 'var(--text-secondary)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {skill}
                </button>
              );
            })}
          </div>

          {/* Reset Filters CTA if active */}
          {(scoreFilter !== 'all' || selectedSkillFilter || searchQuery.trim()) && (
            <button
              type="button"
              onClick={() => {
                setScoreFilter('all');
                setSelectedSkillFilter(null);
                setSearchQuery('');
              }}
              style={{
                fontSize: '0.76rem',
                color: 'var(--accent-teal)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                textDecoration: 'underline',
              }}
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Loading Skeleton State */}
      {loading ? (
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            overflowX: 'auto',
            paddingBottom: '1rem',
            marginBottom: '2.5rem',
          }}
        >
          {PIPELINE_COLUMNS.map((col) => (
            <div
              key={col.id}
              style={{
                borderRadius: '8px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-default)',
                borderTop: `4px solid ${col.borderTop}`,
                flex: 1,
                minWidth: '180px',
                maxWidth: '220px',
                padding: '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="skeleton-shimmer" style={{ width: '80px', height: '16px', borderRadius: '4px' }} />
                <div className="skeleton-shimmer" style={{ width: '24px', height: '16px', borderRadius: '4px' }} />
              </div>
              {[1, 2, 3].map((cardIdx) => (
                <div
                  key={cardIdx}
                  style={{
                    padding: '0.85rem',
                    borderRadius: '6px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-default)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div className="skeleton-shimmer" style={{ width: '85px', height: '14px', borderRadius: '3px' }} />
                    <div className="skeleton-shimmer" style={{ width: '32px', height: '16px', borderRadius: '4px' }} />
                  </div>
                  <div className="skeleton-shimmer" style={{ width: '120px', height: '11px', borderRadius: '3px' }} />
                  <div className="skeleton-shimmer" style={{ width: '100%', height: '8px', borderRadius: '3px', marginTop: '0.2rem' }} />
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : processedApplicants.length === 0 ? (
        /* Friendly Empty State with Icon and Clear Action */
        <div
          className="paper-card"
          style={{
            padding: '3.5rem 2rem',
            textAlign: 'center',
            borderRadius: '8px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            maxWidth: '520px',
            margin: '2rem auto 4rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--accent-teal-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-teal)',
            }}
          >
            <Search size={26} />
          </div>
          <h3
            style={{
              fontFamily: "'Newsreader', Georgia, serif",
              fontSize: '1.4rem',
              fontWeight: 700,
              margin: 0,
              color: 'var(--text-primary)',
            }}
          >
            {applicants.length === 0 ? 'No applicants yet for this role' : 'No candidates match your filters'}
          </h3>
          <p
            style={{
              fontSize: '0.88rem',
              color: 'var(--text-secondary)',
              margin: 0,
              maxWidth: '380px',
              lineHeight: 1.5,
            }}
          >
            {applicants.length === 0
              ? 'New applications will appear here automatically with match scores and skill breakdowns.'
              : 'Try adjusting your search query, lowering the match score filter, or clearing selected skill chips.'}
          </p>
          {applicants.length === 0 ? (
            <Link to="/dashboard" className="btn btn-primary" style={{ padding: '0.6rem 1.25rem', marginTop: '0.5rem' }}>
              Back to My Postings
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                setScoreFilter('all');
                setSelectedSkillFilter(null);
                setSearchQuery('');
              }}
              className="btn btn-secondary"
              style={{ padding: '0.6rem 1.25rem', marginTop: '0.5rem' }}
            >
              Clear all filters
            </button>
          )}
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
              onGenerateKit={(app) => setSelectedKitCandidate(app)}
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

      {/* Candidate Scorecard Side Drawer */}
      {selectedCandidate && (
        <ApplicantSideDrawer
          application={selectedCandidate}
          applicants={processedApplicants}
          onClose={() => setSelectedCandidate(null)}
          onSelectCandidate={(cand) => setSelectedCandidate(cand)}
          onTransition={(appId, newStatus, candidateName) => {
            handleTransition(appId, newStatus, candidateName);
            setSelectedCandidate((prev) => (prev ? { ...prev, status: newStatus } : null));
          }}
          onScheduleInterview={(cand) => setSchedulingApplicant(cand)}
          onGenerateKit={(cand) => setSelectedKitCandidate(cand)}
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

      {/* AI Interview Question Kit Modal */}
      {selectedKitCandidate && (
        <InterviewKitModal
          application={selectedKitCandidate}
          job={job}
          onClose={() => setSelectedKitCandidate(null)}
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
          title={`Match Score: ${score}%`}
        >
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
                {skill}
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
                {skill}
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

export default JobApplicants;
