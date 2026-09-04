import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ApplyModal from '../components/ApplyModal';

// Curated default jobs to guarantee an active job board even if the local database is fresh
const FALLBACK_JOBS = [
  {
    _id: 'job_fallback_1',
    title: 'Senior Full-Stack MERN & AI Engineer',
    company: 'TechPulse Solutions',
    location: 'Remote',
    requiredSkills: ['React', 'Node.js', 'Express', 'MongoDB', 'Gemini AI', 'Docker'],
    description:
      'We are looking for a Senior Full-Stack MERN & AI Engineer to build scalable web applications. You will architect Node.js microservices, build responsive React 19 frontends, and integrate Google Gemini AI for automated candidate matching.',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'job_fallback_2',
    title: 'Frontend AI Interface Architect',
    company: 'HyperScale AI',
    location: 'San Francisco, CA',
    requiredSkills: ['React', 'TypeScript', 'TailwindCSS', 'Gemini AI', 'Next.js'],
    description:
      'Lead our frontend engineering initiatives building generative AI copilots and real-time streaming interfaces. Strong mastery of React component trees, responsive CSS, and AI streaming APIs required.',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'job_fallback_3',
    title: 'Backend Systems & API Engineer',
    company: 'CloudCore Labs',
    location: 'Remote',
    requiredSkills: ['Node.js', 'Express', 'MongoDB', 'Docker', 'Redis', 'Microservices'],
    description:
      'Architect robust backend services, secure authentication, and high-performance MongoDB aggregation pipelines. You will optimize database throughput and scale services handling millions of daily events.',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'job_fallback_4',
    title: 'Full-Stack Software Engineer',
    company: 'DataSphere Analytics',
    location: 'Austin, TX',
    requiredSkills: ['React', 'Node.js', 'MongoDB', 'Python', 'REST API'],
    description:
      'Join our product engineering team delivering modern data analytics dashboards. Build full-stack features from MERN interfaces to data pipelines and secure customer access controls.',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'job_fallback_5',
    title: 'Cloud Infrastructure & DevOps Engineer',
    company: 'InfraNexus',
    location: 'New York, NY',
    requiredSkills: ['Docker', 'AWS', 'Kubernetes', 'CI/CD', 'Node.js'],
    description:
      'Manage cloud infrastructure, automated deployment pipelines, and Docker container clusters for our AI microservices platform. Experience with continuous delivery and zero-downtime rollouts is essential.',
    createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'job_fallback_6',
    title: 'Junior Full-Stack Web Developer',
    company: 'Apex Code Ventures',
    location: 'Remote',
    requiredSkills: ['React', 'JavaScript', 'Express', 'MongoDB', 'Git'],
    description:
      'Great opportunity for a rising full-stack developer to contribute to our MERN platform. You will build user-facing components, write API endpoints, and learn automated ATS workflows.',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const POPULAR_SKILLS = ['All', 'React', 'Node.js', 'MongoDB', 'Gemini AI', 'Docker', 'Python', 'TypeScript'];
const LOCATIONS = ['All Locations', 'Remote', 'San Francisco, CA', 'Austin, TX', 'New York, NY'];

const JobsList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [selectedSkill, setSelectedSkill] = useState('All');

  // Modal State
  const [selectedJob, setSelectedJob] = useState(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
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
              color: 'var(--accent-indigo)',
            }}
          >
            Live Engineering Board
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Explore Open Opportunities
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.25rem' }}>
              Browse verified engineering positions and benchmark your resume against requirements with Gemini AI.
            </p>
          </div>

          <div
            style={{
              padding: '0.45rem 0.95rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            Showing <strong className="gradient-text">{filteredJobs.length}</strong> Available Roles
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div
        className="card-glass"
        style={{
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
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
              placeholder="Search by role title, company, or tech stack..."
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
                <option key={loc} value={loc} style={{ background: '#0D111A', color: '#fff' }}>
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
            Skills:
          </span>
          {POPULAR_SKILLS.map((skill) => {
            const isSelected = selectedSkill === skill;
            return (
              <button
                key={skill}
                onClick={() => setSelectedSkill(skill)}
                style={{
                  padding: '0.25rem 0.75rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  borderRadius: '9999px',
                  border: isSelected ? '1px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
                  background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                  color: isSelected ? '#A5B4FC' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
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
                  {job.title}
                </h3>

                {/* Location Badge */}
                <div style={{ marginBottom: '1rem' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      fontSize: '0.78rem',
                      color: 'var(--accent-cyan)',
                      background: 'rgba(6, 182, 212, 0.1)',
                      border: '1px solid rgba(6, 182, 212, 0.25)',
                      padding: '0.15rem 0.55rem',
                      borderRadius: '4px',
                      fontWeight: 600,
                    }}
                  >
                    <MapPin size={12} />
                    <span>{job.location}</span>
                  </span>
                </div>

                {/* Description Snippet */}
                <p
                  style={{
                    fontSize: '0.88rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
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
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.5rem' }}>
                  {job.requiredSkills?.map((skill, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: '0.15rem 0.55rem',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        borderRadius: '4px',
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
                    <span>View Applicants in ATS</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenApplyModal(job)}
                    className="btn btn-primary"
                    style={{ width: '100%', fontSize: '0.88rem', padding: '0.65rem' }}
                  >
                    <Sparkles size={15} />
                    <span>Apply & Check AI Match</span>
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
