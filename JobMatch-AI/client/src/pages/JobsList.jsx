import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Briefcase,
  Search,
  MapPin,
  Calendar,
  Sparkles,
  LayoutDashboard,
  Filter,
  RotateCcw,
  Building2,
  Loader2,
  Bookmark,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import ApplyModal from '../components/ApplyModal';
import { useSavedJobs } from '../utils/savedJobs';

import { FALLBACK_JOBS } from '../data/fallbackJobs';

const POPULAR_SKILLS = ['All', 'React', 'Node.js', 'MongoDB', 'Gemini AI', 'Docker', 'Python', 'TypeScript'];
const LOCATIONS = ['All Locations', 'Remote', 'San Francisco, CA', 'Austin, TX', 'New York, NY'];

const JobsList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [selectedSkill, setSelectedSkill] = useState('All');

  // Modal State
  const [selectedJob, setSelectedJob] = useState(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Bookmark State
  const { isSaved, toggleSave } = useSavedJobs();

  const handleToggleSave = (job) => {
    const isNowSaved = toggleSave(job._id);
    showToast(
      isNowSaved ? `Saved "${job.title}" to your bookmarks!` : `Removed "${job.title}" from saved jobs.`,
      isNowSaved ? 'success' : 'info'
    );
  };

  // Fetch jobs from backend with fallback
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const response = await api.get('/jobs');
        if (Array.isArray(response.data) && response.data.length > 0) {
          setJobs(response.data);
        } else {
          setJobs(FALLBACK_JOBS);
        }
      } catch (err) {
        console.warn('Jobs API unreachable, using verified fallback list:', err.message);
        setJobs(FALLBACK_JOBS);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Filter jobs based on search inputs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // 1. Keyword filter
      if (keyword.trim()) {
        const term = keyword.toLowerCase();
        const titleMatch = job.title?.toLowerCase().includes(term);
        const companyMatch = job.company?.toLowerCase().includes(term);
        const descMatch = job.description?.toLowerCase().includes(term);
        const skillsMatch = job.requiredSkills?.some((s) => s.toLowerCase().includes(term));
        if (!titleMatch && !companyMatch && !descMatch && !skillsMatch) {
          return false;
        }
      }

      // 2. Location filter
      if (selectedLocation !== 'All Locations') {
        if (!job.location?.toLowerCase().includes(selectedLocation.toLowerCase())) {
          return false;
        }
      }

      // 3. Skill filter
      if (selectedSkill !== 'All') {
        const hasSkill = job.requiredSkills?.some(
          (s) => s.toLowerCase() === selectedSkill.toLowerCase()
        );
        if (!hasSkill) {
          return false;
        }
      }

      return true;
    });
  }, [jobs, keyword, selectedLocation, selectedSkill]);

  const handleClearFilters = () => {
    setKeyword('');
    setSelectedLocation('All Locations');
    setSelectedSkill('All');
  };

  const hasActiveFilters =
    keyword.trim() !== '' || selectedLocation !== 'All Locations' || selectedSkill !== 'All';

  const handleOpenApplyModal = (job) => {
    setSelectedJob(job);
    setIsApplyModalOpen(true);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '3.5rem 1.5rem 5rem' }}>
      {/* Header Section */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#F0FDFA',
              border: '1px solid #CCFBF1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Briefcase size={16} color="var(--accent-teal)" />
          </div>
          <span
            style={{
              fontFamily: 'var(--font-sans-display)',
              fontSize: '0.82rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'var(--accent-teal-dark)',
            }}
          >
            Clinical Competence Registry
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 600, letterSpacing: '-0.02em', color: '#0F172A', fontFamily: 'var(--font-heading)' }}>
              Explore Open Opportunities
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.25rem' }}>
              Browse verified engineering positions and benchmark your competencies with Gemini AI diagnostics.
            </p>
          </div>

          <div
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '8px',
              background: '#FFFFFF',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.84rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              boxShadow: 'var(--shadow-subtle)',
            }}
          >
            Showing <strong style={{ color: 'var(--accent-teal-dark)' }}>{filteredJobs.length}</strong> Evaluated Roles
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div
        className="lab-card"
        style={{
          padding: '1.35rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          background: '#FFFFFF',
        }}
      >
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Keyword Search Input */}
          <div style={{ flex: '1 1 320px' }} className="input-wrapper">
            <Search size={18} className="input-icon" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Filter by role title, organization, or required competence..."
              className="form-input has-icon-left"
            />
          </div>

          {/* Location Select Filter */}
          <div style={{ width: '220px', minWidth: '180px' }}>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="form-input"
              style={{ cursor: 'pointer' }}
            >
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc} style={{ background: '#FFFFFF', color: '#0F172A' }}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="btn btn-ghost"
              style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Quick Skill Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: '0.25rem' }}>
            Competency:
          </span>
          {POPULAR_SKILLS.map((skill) => {
            const isSelected = selectedSkill === skill;
            return (
              <button
                key={skill}
                onClick={() => setSelectedSkill(skill)}
                style={{
                  padding: '0.28rem 0.75rem',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  borderRadius: '6px',
                  border: isSelected ? '1px solid var(--accent-teal)' : '1px solid var(--border-subtle)',
                  background: isSelected ? 'var(--accent-teal-subtle)' : '#FFFFFF',
                  color: isSelected ? 'var(--accent-teal-dark)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
                }}
              >
                {skill}
              </button>
            );
          })}
        </div>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1.5rem', color: 'var(--text-secondary)' }}>
          <Loader2 size={36} className="spin" style={{ margin: '0 auto 1rem', color: 'var(--accent-indigo)' }} />
          <p style={{ fontSize: '0.95rem' }}>Loading open engineering roles...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div
          className="card-glass"
          style={{ textAlign: 'center', padding: '4rem 1.5rem', marginTop: '1.5rem' }}
        >
          <Filter size={36} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>No matching positions found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
            Try adjusting your keyword search, selecting "All Locations", or resetting skills filters.
          </p>
          <button onClick={handleClearFilters} className="btn btn-secondary">
            <RotateCcw size={15} />
            <span>Reset All Filters</span>
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {filteredJobs.map((job) => (
            <div
              key={job._id}
              className="card-glass"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.65rem',
              }}
            >
              <div>
                {/* Company & Posted Date */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.85rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Building2 size={16} color="var(--accent-indigo)" />
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {job.company}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.78rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      <Calendar size={13} />
                      <span>{formatDate(job.createdAt)}</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleToggleSave(job);
                      }}
                      style={{
                        background: isSaved(job._id) ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                        border: `1px solid ${isSaved(job._id) ? 'rgba(245, 158, 11, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
                        borderRadius: '8px',
                        padding: '0.35rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isSaved(job._id) ? '#F59E0B' : 'var(--text-muted)',
                        transition: 'var(--transition)',
                      }}
                      title={isSaved(job._id) ? 'Remove saved job' : 'Save job for later'}
                    >
                      <Bookmark
                        size={15}
                        fill={isSaved(job._id) ? '#F59E0B' : 'none'}
                        style={{
                          transition: 'transform 0.2s ease',
                          transform: isSaved(job._id) ? 'scale(1.15)' : 'scale(1)',
                        }}
                      />
                    </button>
                  </div>
                </div>

                {/* Job Title */}
                <h3
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    marginBottom: '0.5rem',
                    lineHeight: 1.35,
                  }}
                >
                  <Link
                    to={`/jobs/${job._id}`}
                    style={{ color: '#0F172A', textDecoration: 'none', transition: 'var(--transition)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-teal)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#0F172A')}
                  >
                    {job.title}
                  </Link>
                </h3>

                {/* Location Badge */}
                <div style={{ marginBottom: '1rem' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.78rem',
                      color: 'var(--accent-teal-dark)',
                      background: 'var(--accent-teal-subtle)',
                      border: '1px solid var(--accent-teal-border)',
                      padding: '0.2rem 0.65rem',
                      borderRadius: '9999px',
                      fontWeight: 600,
                    }}
                  >
                    <MapPin size={12} color="var(--accent-teal)" />
                    <span>{job.location}</span>
                  </span>
                </div>

                {/* Description Snippet */}
                <p
                  style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.55,
                    marginBottom: '1.25rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {job.description}
                </p>

                {/* Required Skills Tag Chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
                  {job.requiredSkills?.map((skill, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: '0.2rem 0.6rem',
                        fontSize: '0.76rem',
                        fontWeight: 500,
                        borderRadius: '6px',
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        color: '#334155',
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '1.15rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                {user?.role === 'recruiter' ? (
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="btn btn-secondary"
                    style={{ width: '100%', fontSize: '0.88rem', padding: '0.65rem' }}
                  >
                    <LayoutDashboard size={15} />
                    <span>View Applicants in Diagnostic ATS</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenApplyModal(job)}
                    className="btn btn-primary"
                    style={{ width: '100%', fontSize: '0.88rem', padding: '0.65rem' }}
                  >
                    <ArrowRight size={15} />
                    <span>Run Clinical Skill Benchmark</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Real-time AI Apply Modal */}
      <ApplyModal
        job={selectedJob}
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
      />
    </div>
  );
};

export default JobsList;
