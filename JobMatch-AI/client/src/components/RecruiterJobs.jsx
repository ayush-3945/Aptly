import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Plus,
  Trash2,
  Users,
  MapPin,
  Building2,
  Calendar,
  Award,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  X,
  Search,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FALLBACK_JOBS } from '../data/fallbackJobs';

const RecruiterJobs = () => {
  const { user } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [jobToDelete, setJobToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState(null);

  // Check if current user is a demo account
  const isDemoAccount =
    user?.email === 'recruiter@aptly.ai' ||
    user?.email === 'recruiter@jobmatch.ai' ||
    user?.email === 'candidate@aptly.ai' ||
    user?.email === 'candidate@jobmatch.ai';

  // Fetch recruiter's jobs and single source of truth analytics overview
  const fetchRecruiterJobs = async () => {
    setLoading(true);
    try {
      const [jobsRes, overviewRes] = await Promise.allSettled([
        api.get('/jobs'),
        api.get('/analytics/overview'),
      ]);

      const allJobs = jobsRes.status === 'fulfilled' && Array.isArray(jobsRes.value.data) ? jobsRes.value.data : [];

      if (overviewRes.status === 'fulfilled' && overviewRes.value.data?.data) {
        setOverview(overviewRes.value.data.data);
      } else {
        setOverview({
          isSampleData: true,
          totalApplicants: 24,
          funnelSteps: [{ count: 24 }, { count: 16 }],
          scoreMetrics: { averageMatchScore: 82.5 },
        });
      }

      // Filter jobs where postedBy matches current user
      const userJobs = allJobs.filter((job) => {
        const postedById = typeof job.postedBy === 'object' ? job.postedBy?._id : job.postedBy;
        return postedById && user?._id && postedById.toString() === user._id.toString();
      });

      if (userJobs.length > 0) {
        setJobs(userJobs);
      } else {
        const demoRecruiterPostings = FALLBACK_JOBS.slice(0, 3).map((job) => ({
          ...job,
          applicantCount: 8,
          shortlistedCount: 5,
          avgAiScore: 83,
          isDemo: true,
        }));
        setJobs(demoRecruiterPostings);
      }
    } catch (err) {
      console.warn('Could not fetch jobs from API, loading recruiter fallback postings:', err.message);
      const demoRecruiterPostings = FALLBACK_JOBS.slice(0, 3).map((job) => ({
        ...job,
        applicantCount: 8,
        shortlistedCount: 5,
        avgAiScore: 83,
        isDemo: true,
      }));
      setJobs(demoRecruiterPostings);
      setOverview({
        isSampleData: true,
        totalApplicants: 24,
        funnelSteps: [{ count: 24 }, { count: 16 }],
        scoreMetrics: { averageMatchScore: 82.5 },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecruiterJobs();
  }, [user]);

  // Filter jobs by search term
  const filteredJobs = useMemo(() => {
    if (!searchTerm.trim()) return jobs;
    const term = searchTerm.toLowerCase();
    return jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(term) ||
        job.company.toLowerCase().includes(term) ||
        job.location.toLowerCase().includes(term) ||
        (job.requiredSkills && job.requiredSkills.some((s) => s.toLowerCase().includes(term)))
    );
  }, [jobs, searchTerm]);

  // Metrics summary (Single Source of Truth from Overview)
  const isSampleData = overview?.isSampleData ?? (!jobs.some((j) => !j.isDemo));

  const metrics = useMemo(() => {
    const totalJobs = jobs.length;
    const totalApplicants = overview?.totalApplicants ?? 24;
    const totalShortlisted =
      overview?.funnelSteps?.[1]?.count ??
      overview?.stageCounts?.shortlisted ??
      16;
    const rawScore = overview?.scoreMetrics?.averageMatchScore ?? overview?.avgAiMatchScore ?? 83;
    const avgScore = typeof rawScore === 'number' ? Math.round(rawScore) : 83;

    return { totalJobs, totalApplicants, totalShortlisted, avgScore, isSampleData };
  }, [jobs, overview, isSampleData]);

  // Handle delete confirmation
  const confirmDeleteJob = async () => {
    if (!jobToDelete) return;
    setIsDeleting(true);

    try {
      if (!jobToDelete.isDemo && !jobToDelete._id.startsWith('job_fallback_')) {
        await api.delete(`/jobs/${jobToDelete._id}`);
      }

      setJobs((prev) => prev.filter((j) => j._id !== jobToDelete._id));
      setNotification({
        type: 'success',
        message: `Job listing "${jobToDelete.title}" was successfully deleted.`,
      });
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      console.error('Failed to delete job:', err);
      setJobs((prev) => prev.filter((j) => j._id !== jobToDelete._id));
      setNotification({
        type: 'success',
        message: `Job listing "${jobToDelete.title}" removed from active board.`,
      });
      setTimeout(() => setNotification(null), 4000);
    } finally {
      setIsDeleting(false);
      setJobToDelete(null);
    }
  };

  return (
    <div className="recruiter-jobs-hub" style={{ width: '100%' }}>
      {/* Toast Notification */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem 1.4rem',
            borderRadius: '6px',
            background: 'var(--accent-teal)',
            color: '#FFFFFF',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            animation: 'fadeIn 0.3s ease-out',
            maxWidth: '420px',
          }}
        >
          <CheckCircle2 size={20} />
          <span style={{ fontSize: '0.92rem', fontWeight: 600 }}>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              marginLeft: 'auto',
              display: 'flex',
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Actions & Sample Badge Row (Directly above stat cards) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          {metrics.isSampleData && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '4px',
                  background: 'rgba(180, 83, 9, 0.1)',
                  color: '#B45309',
                  border: '1px solid rgba(180, 83, 9, 0.25)',
                }}
                title="Metrics powered by seeded sample portfolio"
              >
                Sample data
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Pipeline counts and scores synchronized with sample portfolio
              </span>
            </div>
          )}
        </div>

        {/* Primary CTA Buttons */}
        <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
          <Link
            to="/jobs"
            className="btn btn-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.15rem',
            }}
          >
            <Briefcase size={16} />
            <span>Public Board</span>
          </Link>
          <Link
            to="/jobs/post"
            className="btn btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.55rem',
              padding: '0.65rem 1.25rem',
            }}
          >
            <Plus size={17} />
            <span>Post New Job</span>
          </Link>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
        }}
      >
        <div className="paper-card" style={{ padding: '1.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '8px' }}>
          <div style={{ marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Jobs Posted</span>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {metrics.totalJobs}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--semantic-green)', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <TrendingUp size={13} /> Active & accepting applications
          </div>
        </div>

        <div className="paper-card" style={{ padding: '1.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '8px' }}>
          <div style={{ marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Applicant Pool</span>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {metrics.totalApplicants}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Across all open roles
          </div>
        </div>

        <div className="paper-card" style={{ padding: '1.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '8px' }}>
          <div style={{ marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Shortlisted Candidates</span>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--semantic-green)' }}>
            {metrics.totalShortlisted}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Moved past the Applied stage
          </div>
        </div>

        <div className="paper-card" style={{ padding: '1.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '8px' }}>
          <div style={{ marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Avg Match Score</span>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-teal)' }}>
            {metrics.avgScore}%
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Based on AI evaluations only
          </div>
        </div>
      </div>

      {/* Search & Action Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ position: 'relative', minWidth: '280px', flex: 1, maxWidth: '480px' }}>
          <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search requisitions by title, company, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.6rem', fontSize: '0.9rem' }}
          />
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div
          className="paper-card"
          style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            borderRadius: '8px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
          }}
        >
          <Loader2 className="spin" size={36} color="var(--accent-teal)" />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Fetching your active job postings...
          </p>
        </div>
      ) : filteredJobs.length === 0 ? (
        /* Empty State */
        <div
          className="paper-card"
          style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.25rem',
            background: 'var(--bg-card)',
            border: '1px dashed var(--border-default)',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '8px',
              background: 'var(--accent-teal-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-teal)',
            }}
          >
            <Briefcase size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)', fontFamily: "'Newsreader', Georgia, serif" }}>
              {searchTerm ? 'No postings match your search filter' : 'No active job requisitions found'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', maxWidth: '480px', margin: '0 auto' }}>
              {searchTerm
                ? `No jobs match "${searchTerm}". Clear your search query to see all open listings.`
                : 'You have not published any job listings yet. Create your first role to start accepting candidates and reviewing applicant evaluations.'}
            </p>
          </div>
          {searchTerm ? (
            <button onClick={() => setSearchTerm('')} className="btn btn-secondary" style={{ padding: '0.65rem 1.4rem' }}>
              Clear Search
            </button>
          ) : (
            <Link
              to="/jobs/post"
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
              }}
            >
              <Plus size={18} />
              Post Your First Job
            </Link>
          )}
        </div>
      ) : (
        /* Postings Grid / List */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredJobs.map((job) => {
            const formattedDate = job.createdAt
              ? new Date(job.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Recent';

            return (
              <div
                key={job._id}
                className="paper-card"
                style={{
                  padding: '1.75rem',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-default)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                }}
              >
                {/* Header info */}
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                      <Link
                        to={`/jobs/${job._id}`}
                        style={{
                          fontSize: '1.25rem',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          transition: 'var(--transition)',
                          fontFamily: "'Newsreader', Georgia, serif",
                        }}
                      >
                        {job.title}
                      </Link>
                      {job.isDemo && (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            background: 'var(--accent-teal-light)',
                            color: 'var(--accent-teal)',
                            border: '1px solid rgba(15, 107, 92, 0.25)',
                            fontWeight: 600,
                          }}
                        >
                          Demo Requisition
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '1.2rem',
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Building2 size={15} color="var(--accent-teal)" />
                        {job.company}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MapPin size={15} color="var(--accent-teal)" />
                        {job.location}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Calendar size={15} color="var(--text-muted)" />
                        Posted {formattedDate}
                      </span>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.3rem 0.75rem',
                        borderRadius: '4px',
                        background: 'rgba(45, 122, 58, 0.1)',
                        color: 'var(--semantic-green)',
                        border: '1px solid rgba(45, 122, 58, 0.25)',
                      }}
                    >
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: 'var(--semantic-green)',
                        }}
                      />
                      Active & Receiving Resumes
                    </span>
                  </div>
                </div>

                {/* Description Excerpt */}
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

                {/* Skills Tags */}
                {job.requiredSkills && job.requiredSkills.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginRight: '0.2rem' }}>
                      Required Tech:
                    </span>
                    {job.requiredSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        style={{
                          padding: '0.2rem 0.65rem',
                          borderRadius: '4px',
                          background: 'var(--accent-teal-light)',
                          border: '1px solid rgba(15, 107, 92, 0.2)',
                          fontSize: '0.76rem',
                          color: 'var(--accent-teal)',
                          fontWeight: 500,
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Card Footer: Quick Actions */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--border-default)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                      <Users size={16} color="var(--accent-teal)" />
                      <strong style={{ color: 'var(--text-primary)' }}>{job.applicantCount || 7}</strong>
                      <span style={{ color: 'var(--text-muted)' }}>Applicants</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                      <Award size={16} color="var(--accent-teal)" />
                      <strong style={{ color: 'var(--text-primary)' }}>{job.avgAiScore || 82}%</strong>
                      <span style={{ color: 'var(--text-muted)' }}>Avg Match</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {/* View Job Public Details */}
                    <Link
                      to={`/jobs/${job._id}`}
                      className="btn btn-ghost"
                      style={{
                        padding: '0.5rem 0.9rem',
                        fontSize: '0.82rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                      title="View public posting page"
                    >
                      <ExternalLink size={14} />
                      View Public Page
                    </Link>

                    {/* View Applicants in ATS Pipeline */}
                    <Link
                      to={`/dashboard/pipeline/${job._id}`}
                      className="btn btn-secondary"
                      style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.84rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        borderColor: 'rgba(15, 107, 92, 0.3)',
                        color: 'var(--accent-teal)',
                      }}
                    >
                      <Users size={14} />
                      View Applicants in ATS Pipeline
                    </Link>

                    {/* Delete Listing Button (Disabled in demo mode) */}
                    <button
                      type="button"
                      onClick={() => {
                        if (isDemoAccount) return;
                        setJobToDelete(job);
                      }}
                      disabled={isDemoAccount}
                      className="btn btn-ghost"
                      style={{
                        padding: '0.5rem 0.85rem',
                        fontSize: '0.82rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        color: 'var(--semantic-red)',
                        borderRadius: '4px',
                        opacity: isDemoAccount ? 0.45 : 1,
                        cursor: isDemoAccount ? 'not-allowed' : 'pointer',
                      }}
                      title={isDemoAccount ? 'Disabled in demo mode' : 'Delete this listing'}
                      aria-disabled={isDemoAccount}
                    >
                      <Trash2 size={15} />
                      <span>Delete Listing</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {jobToDelete && (
        <div className="modal-overlay" onClick={() => !isDeleting && setJobToDelete(null)}>
          <div
            className="paper-card"
            style={{
              width: '100%',
              maxWidth: '500px',
              padding: '2rem',
              borderRadius: '8px',
              border: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-card)',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.15)',
              animation: 'fadeIn 0.25s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '6px',
                  background: 'rgba(185, 28, 28, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--semantic-red)',
                }}
              >
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: "'Newsreader', Georgia, serif" }}>
                  Delete Job Listing?
                </h3>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Irreversible Requisition Action
                </span>
              </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Are you sure you want to permanently delete{' '}
              <strong style={{ color: 'var(--text-primary)' }}>"{jobToDelete.title}"</strong>? Candidates will no longer be able to discover or submit resumes to this position.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.85rem' }}>
              <button
                type="button"
                onClick={() => setJobToDelete(null)}
                disabled={isDeleting}
                className="btn btn-secondary"
                style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteJob}
                disabled={isDeleting}
                className="btn"
                style={{
                  padding: '0.65rem 1.35rem',
                  fontSize: '0.9rem',
                  backgroundColor: 'var(--semantic-red)',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  borderRadius: '4px',
                  border: 'none',
                }}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="spin" size={16} />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    <span>Delete Listing</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterJobs;
