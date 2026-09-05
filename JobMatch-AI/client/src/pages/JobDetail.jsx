import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Target,
  Share2,
  Check,
  LayoutDashboard,
  Loader2,
  Bookmark,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { FALLBACK_JOBS } from '../data/fallbackJobs';
import ApplyModal from '../components/ApplyModal';
import { useSavedJobs } from '../utils/savedJobs';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { isSaved, toggleSave } = useSavedJobs();

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/jobs/${id}`);
        if (response.data) {
          setJob(response.data);
        } else {
          const fallback = FALLBACK_JOBS.find((j) => j._id === id) || FALLBACK_JOBS[0];
          setJob(fallback);
        }
      } catch (err) {
        console.warn('Could not fetch job from API, using fallback data:', err.message);
        const fallback = FALLBACK_JOBS.find((j) => j._id === id) || FALLBACK_JOBS[0];
        setJob(fallback);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      showToast('Job link copied to clipboard!', 'info');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center', minHeight: '60vh' }}>
        <Loader2 size={36} className="spin" style={{ margin: '0 auto 1rem', color: 'var(--accent-indigo)' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center', minHeight: '50vh' }}>
        <h2>Job Position Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '1rem 0 1.5rem' }}>
          The role you are looking for may have been closed or relocated.
        </p>
        <Link to="/jobs" className="btn btn-primary">
          <ArrowLeft size={16} />
          <span>Back to All Open Roles</span>
        </Link>
      </div>
    );
  }

  // Default responsibilities/requirements if dynamic job lacks them
  const responsibilities = job.responsibilities || [
    `Design, build, and deploy production-ready features for ${job.title}.`,
    `Collaborate with cross-functional product, design, and infrastructure teams.`,
    `Optimize application performance, database queries, and system uptime.`,
    `Participate in code reviews, design documentation, and architectural discussions.`,
  ];

  const requirements = job.requirements || [
    `Demonstrated proficiency in ${job.requiredSkills?.slice(0, 3).join(', ') || 'modern software engineering'}.`,
    `Proven track record delivering reliable, production-tested software services.`,
    `Familiarity with containerized workflows (Docker), automated testing, and CI/CD.`,
    `Strong communication and collaborative problem-solving skills.`,
  ];

  return (
    <div className="container animate-fade-in" style={{ padding: '3.5rem 1.5rem 5rem' }}>
      {/* Breadcrumb Navigation */}
      <div style={{ marginBottom: '1.75rem' }}>
        <Link
          to="/jobs"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--accent-indigo)',
            fontSize: '0.92rem',
            fontWeight: 600,
            transition: 'var(--transition)',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Open Opportunities</span>
        </Link>
      </div>

      {/* Header Card */}
      <div
        className="card-glass"
        style={{
          padding: '2.25rem',
          marginBottom: '2rem',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
              <Building2 size={18} color="var(--accent-indigo)" />
              <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {job.company}
              </span>
              <span style={{ color: 'var(--border-subtle)' }}>•</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <Calendar size={14} />
                <span>Posted on {formatDate(job.createdAt)}</span>
              </div>
            </div>

            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '0.85rem' }}>
              {job.title}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.82rem',
                  color: 'var(--accent-cyan)',
                  background: 'rgba(6, 182, 212, 0.12)',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 600,
                }}
              >
                <MapPin size={13} />
                <span>{job.location}</span>
              </span>

              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.82rem',
                  color: '#A7F3D0',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 600,
                }}
              >
                <ShieldCheck size={13} />
                <span>Verified ATS Opening</span>
              </span>
            </div>
          </div>

          {/* Action Header Group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={handleShare}
              className="btn btn-secondary"
              style={{ fontSize: '0.88rem', padding: '0.7rem 1rem' }}
              title="Share job link"
            >
              <Share2 size={16} />
              <span>{copied ? 'Link Copied!' : 'Share'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const isNowSaved = toggleSave(job._id);
                showToast(
                  isNowSaved
                    ? `Saved "${job.title}" to bookmarks!`
                    : `Removed "${job.title}" from bookmarks.`,
                  isNowSaved ? 'success' : 'info'
                );
              }}
              className="btn btn-secondary"
              style={{
                fontSize: '0.88rem',
                padding: '0.7rem 1rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: isSaved(job._id) ? '#F59E0B' : 'var(--text-secondary)',
                borderColor: isSaved(job._id) ? 'rgba(245, 158, 11, 0.4)' : 'var(--border-subtle)',
              }}
              title={isSaved(job._id) ? 'Remove bookmark' : 'Bookmark this job'}
            >
              <Bookmark
                size={16}
                fill={isSaved(job._id) ? '#F59E0B' : 'none'}
                color={isSaved(job._id) ? '#F59E0B' : 'currentColor'}
              />
              <span>{isSaved(job._id) ? 'Saved' : 'Save'}</span>
            </button>

            {user?.role === 'recruiter' ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="btn btn-secondary"
                style={{ fontSize: '0.95rem', padding: '0.75rem 1.4rem' }}
              >
                <LayoutDashboard size={16} />
                <span>View ATS Pipeline</span>
              </button>
            ) : (
              <button
                onClick={() => setIsApplyModalOpen(true)}
                className="btn btn-primary"
                style={{ fontSize: '0.95rem', padding: '0.75rem 1.6rem' }}
              >
                <Sparkles size={16} />
                <span>Apply & Check AI Match</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Two-Column Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '2rem', alignItems: 'start' }}>
        {/* Left Column: Job Description, Responsibilities & Requirements */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Overview */}
          <div className="card-glass" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>Role Overview</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.96rem' }}>
              {job.description}
            </p>
          </div>

          {/* Responsibilities */}
          <div className="card-glass" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem' }}>Key Responsibilities</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {responsibilities.map((resp, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.94rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  <span style={{ color: 'var(--accent-cyan)', flexShrink: 0, marginTop: '2px' }}>
                    <CheckCircle2 size={16} />
                  </span>
                  <span>{resp}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Technical Requirements */}
          <div className="card-glass" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem' }}>Qualifications & Requirements</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {requirements.map((req, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.94rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  <span style={{ color: 'var(--accent-purple)', flexShrink: 0, marginTop: '2px' }}>
                    <Check size={16} />
                  </span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Company info, Skills list & AI Match Teaser */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* AI ATS Teaser Card */}
          <div
            className="card-glass"
            style={{
              padding: '1.75rem',
              background: 'linear-gradient(145deg, rgba(138, 43, 226, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%)',
              border: '1px solid var(--border-focus)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Sparkles size={18} color="var(--accent-cyan)" />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>AI Resume Matcher</h4>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Submit your resume to benchmark your qualifications against this role using Google Gemini AI.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.82rem', color: 'var(--text-primary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Zap size={14} color="var(--warning)" />
                <span>Instant 0–100% Fit Score</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Target size={14} color="var(--accent-cyan)" />
                <span>Automated Skills Gap Analysis</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={14} color="var(--success)" />
                <span>Direct Recruiter Visibility</span>
              </div>
            </div>

            {user?.role !== 'recruiter' && (
              <button
                onClick={() => setIsApplyModalOpen(true)}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.7rem', fontSize: '0.92rem' }}
              >
                <Sparkles size={16} />
                <span>Test Your Resume Fit</span>
              </button>
            )}
          </div>

          {/* Required Skills Card */}
          <div className="card-glass" style={{ padding: '1.75rem' }}>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Required Tech Stack</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
              {job.requiredSkills?.map((skill, idx) => (
                <span
                  key={idx}
                  style={{
                    padding: '0.25rem 0.7rem',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* About Company Card */}
          <div className="card-glass" style={{ padding: '1.75rem' }}>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.85rem' }}>About {job.company}</h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {job.aboutCompany ||
                `${job.company} is an engineering-driven technology organization committed to building scalable systems, fostering talent, and shipping high-impact products.`}
            </p>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <ApplyModal
        job={job}
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
      />
    </div>
  );
};

export default JobDetail;
