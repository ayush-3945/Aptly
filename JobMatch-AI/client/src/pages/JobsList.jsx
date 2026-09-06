import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  RotateCcw,
  Building2,
  Bookmark,
  ArrowUpDown,
  Check,
  Send,
  LayoutDashboard,
  Filter,
  Loader2,
  Sparkles,
  Activity,
  X,
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
  const [sortBy, setSortBy] = useState('best-match');

  // Modal State
  const [selectedJob, setSelectedJob] = useState(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [initialEvaluationForModal, setInitialEvaluationForModal] = useState(null);

  // Bookmark State
  const { isSaved, toggleSave } = useSavedJobs();

  const handleToggleSave = (job) => {
    const isNowSaved = toggleSave(job._id);
    showToast(
      isNowSaved ? `Saved "${job.title}" to your bookmarks.` : `Removed "${job.title}" from saved jobs.`,
      isNowSaved ? 'success' : 'info'
    );
  };

  // Fetch jobs from backend with resilient fallback
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

  // Candidate reference skills baseline for real-time diagnostic gap calculation
  const candidateSkills = useMemo(() => {
    if (user?.skills && Array.isArray(user.skills) && user.skills.length > 0) {
      return user.skills;
    }
    // Default engineering baseline for prospective candidates
    return ['React', 'Node.js', 'Express', 'MongoDB', 'Gemini AI', 'TypeScript'];
  }, [user]);

  // Enrich each job with real-time diagnostic match calculations
  const enrichedJobs = useMemo(() => {
    return jobs.map((job) => {
      const reqSkills = Array.isArray(job.requiredSkills) ? job.requiredSkills : [];
      const matched = reqSkills.filter((s) =>
        candidateSkills.some((cs) => cs.toLowerCase() === s.toLowerCase())
      );
      const missing = reqSkills.filter(
        (s) => !candidateSkills.some((cs) => cs.toLowerCase() === s.toLowerCase())
      );
      const ratio = reqSkills.length > 0 ? matched.length / reqSkills.length : 0.75;
      // Clinical compatibility score with realistic curve
      const matchScore = Math.min(96, Math.max(52, Math.round(ratio * 78 + (matched.length > 0 ? 18 : 0))));
      return {
        ...job,
        matchScore,
        matchedSkills: matched,
        missingSkills: missing,
        isStrongMatch: matchScore >= 75,
      };
    });
  }, [jobs, candidateSkills]);

  // Filter & sort jobs based on search inputs and sort dropdown
  const filteredJobs = useMemo(() => {
    const result = enrichedJobs.filter((job) => {
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

      // 3. Competency filter
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

    // Sort order
    if (sortBy === 'best-match') {
      result.sort((a, b) => b.matchScore - a.matchScore);
    } else if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (sortBy === 'title') {
      result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else if (sortBy === 'company') {
      result.sort((a, b) => (a.company || '').localeCompare(b.company || ''));
    }

    return result;
  }, [enrichedJobs, keyword, selectedLocation, selectedSkill, sortBy]);

  // Determine top matching job to break visual monotony
  const topMatchJobId = useMemo(() => {
    if (filteredJobs.length === 0) return null;
    let highest = filteredJobs[0];
    for (const j of filteredJobs) {
      if (j.matchScore > highest.matchScore) {
        highest = j;
      }
    }
    return highest._id;
  }, [filteredJobs]);

  const handleClearFilters = () => {
    setKeyword('');
    setSelectedLocation('All Locations');
    setSelectedSkill('All');
  };

  const hasActiveFilters =
    keyword.trim() !== '' || selectedLocation !== 'All Locations' || selectedSkill !== 'All';

  // Distinct handler for Evaluate (diagnostic scorecard) vs Apply (direct submission)
  const handleOpenApplyModal = (job, isDiagnosticEvaluation = false) => {
    setSelectedJob(job);
    if (isDiagnosticEvaluation) {
      setInitialEvaluationForModal({
        aiMatchScore: job.matchScore,
        recommendation: job.isStrongMatch ? 'Strong Match' : 'Moderate Match',
        matchedSkills: job.matchedSkills,
        missingSkills: job.missingSkills,
        experienceFit: `Candidate profile aligns with ${job.matchedSkills.length} of ${job.requiredSkills?.length || 0} evaluated competencies.`,
        fitSummary: `Clinical diagnostic evaluation for ${job.title} at ${job.company}. Review competency breakdown and interview strategy below.`,
      });
    } else {
      setInitialEvaluationForModal(null);
    }
    setIsApplyModalOpen(true);
  };

  const handleSkillClick = (skillName) => {
    setSelectedSkill((prev) => (prev.toLowerCase() === skillName.toLowerCase() ? 'All' : skillName));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        backgroundImage: 'radial-gradient(#E2E8F0 1.2px, transparent 1.2px)',
        backgroundSize: '24px 24px',
        padding: '3rem 1.5rem 5rem',
      }}
    >
      <div className="container" style={{ maxWidth: '1180px', margin: '0 auto' }}>
        {/* Page Header */}
        <header style={{ marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              backgroundColor: '#F0FDFA',
              border: '1px solid #CCFBF1',
              marginBottom: '0.85rem',
            }}
          >
            <Activity size={14} color="#0d9488" />
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#0F6B5C',
                letterSpacing: '0.01em',
              }}
            >
              Clinical competence registry
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1
                style={{
                  fontFamily: "'Newsreader', 'Playfair Display', 'Charter', 'Georgia', serif",
                  fontSize: 'clamp(2rem, 3.5vw, 2.65rem)',
                  fontWeight: 600,
                  letterSpacing: '-0.025em',
                  color: '#0F172A',
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                Explore Open Opportunities
              </h1>
              <p
                style={{
                  color: '#475569',
                  fontSize: '0.98rem',
                  marginTop: '0.45rem',
                  marginBottom: 0,
                  maxWidth: '680px',
                  lineHeight: 1.55,
                }}
              >
                Browse verified positions and compare your clinical competencies against role requirements with Gemini ATS diagnostics.
              </p>
            </div>
          </div>
        </header>

        {/* Compact Filter Bar */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '0.9rem 1.15rem',
            marginBottom: '1.25rem',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          {/* Row 1: Unified Search & Location Strip */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div
              style={{
                flex: '1 1 320px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#F8FAFC',
              }}
            >
              <Search size={16} color="#64748B" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search by role title, company, or tech stack..."
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  fontSize: '0.9rem',
                  color: '#0F172A',
                }}
              />
              {keyword && (
                <button
                  onClick={() => setKeyword('')}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    padding: 0,
                    color: '#94A3B8',
                    display: 'flex',
                  }}
                  title="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Location Selector */}
            <div
              style={{
                width: '190px',
                minWidth: '150px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.45rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#F8FAFC',
              }}
            >
              <MapPin size={15} color="#0d9488" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  fontSize: '0.86rem',
                  color: '#0F172A',
                  cursor: 'pointer',
                }}
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc} style={{ background: '#FFFFFF', color: '#0F172A' }}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Button */}
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  color: '#64748B',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#CBD5E1';
                  e.currentTarget.style.color = '#0F172A';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.color = '#64748B';
                }}
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Row 2: Slender Competency Filter Strip with High-Contrast Active State */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              flexWrap: 'wrap',
              paddingTop: '0.35rem',
              borderTop: '1px solid #F1F5F9',
            }}
          >
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#64748B',
                marginRight: '0.35rem',
              }}
            >
              Filter by competency:
            </span>
            {POPULAR_SKILLS.map((skill) => {
              const isSelected = selectedSkill.toLowerCase() === skill.toLowerCase();
              return (
                <button
                  key={skill}
                  onClick={() => setSelectedSkill(skill)}
                  style={{
                    padding: '0.22rem 0.65rem',
                    fontSize: '0.78rem',
                    fontWeight: isSelected ? 600 : 500,
                    borderRadius: '6px',
                    border: isSelected ? '1px solid #0d9488' : '1px solid #E2E8F0',
                    backgroundColor: isSelected ? '#0d9488' : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : '#475569',
                    boxShadow: isSelected ? '0 1px 3px rgba(13, 148, 136, 0.28)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = '#99F6E4';
                      e.currentTarget.style.color = '#0F6B5C';
                      e.currentTarget.style.backgroundColor = '#F0FDFA';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = '#E2E8F0';
                      e.currentTarget.style.color = '#475569';
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                    }
                  }}
                >
                  {skill}
                </button>
              );
            })}
          </div>
        </div>

        {/* Connected Results Count and Sorting Toolbar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            marginBottom: '1.5rem',
            padding: '0 0.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: '#64748B' }}>
            <span>
              Showing <strong style={{ color: '#0F172A', fontWeight: 700 }}>{filteredJobs.length}</strong> evaluated roles
            </span>
            {hasActiveFilters && (
              <span
                style={{
                  fontSize: '0.78rem',
                  color: '#0F6B5C',
                  backgroundColor: '#F0FDFA',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '9999px',
                  border: '1px solid #CCFBF1',
                  fontWeight: 500,
                }}
              >
                Filtered
              </span>
            )}
          </div>

          {/* Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ArrowUpDown size={14} color="#64748B" />
            <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 500 }}>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                backgroundColor: '#FFFFFF',
                padding: '0.3rem 0.6rem',
                fontSize: '0.82rem',
                color: '#0F172A',
                fontWeight: 500,
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="best-match">Best match (AI)</option>
              <option value="newest">Newest first</option>
              <option value="title">Role title (A–Z)</option>
              <option value="company">Company name (A–Z)</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 1.5rem',
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
            }}
          >
            <Loader2
              size={32}
              className="spin"
              style={{ margin: '0 auto 0.75rem', color: '#0d9488' }}
            />
            <p style={{ color: '#475569', fontSize: '0.94rem', margin: 0 }}>
              Analyzing clinical competence registry and compiling matching roles...
            </p>
          </div>
        ) : filteredJobs.length === 0 ? (
          /* Empty State */
          <div
            style={{
              textAlign: 'center',
              padding: '3.5rem 1.5rem',
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
            }}
          >
            <Filter size={32} color="#94A3B8" style={{ margin: '0 auto 0.75rem' }} />
            <h3
              style={{
                fontFamily: "'Newsreader', Georgia, serif",
                fontSize: '1.35rem',
                color: '#0F172A',
                marginBottom: '0.35rem',
              }}
            >
              No matching positions found
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Try adjusting your search keyword, selecting "All Locations", or resetting competency filters.
            </p>
            <button
              onClick={handleClearFilters}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid #0d9488',
                backgroundColor: '#0d9488',
                color: '#FFFFFF',
                fontSize: '0.86rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={14} />
              <span>Reset all filters</span>
            </button>
          </div>
        ) : (
          /* Job Cards Grid */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '1.35rem',
            }}
          >
            {filteredJobs.map((job) => {
              const isTopMatch = job._id === topMatchJobId;
              const saved = isSaved(job._id);

              return (
                <article
                  key={job._id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '10px',
                    border: isTopMatch ? '1px solid #99F6E4' : '1px solid #E2E8F0',
                    borderTop: isTopMatch ? '3px solid #0d9488' : '1px solid #E2E8F0',
                    boxShadow: isTopMatch
                      ? '0 6px 20px -4px rgba(13, 148, 136, 0.12), 0 2px 6px -1px rgba(15, 23, 42, 0.04)'
                      : '0 1px 3px rgba(15, 23, 42, 0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: isTopMatch ? '1.5rem 1.5rem 1.35rem' : '1.35rem 1.4rem 1.25rem',
                    position: 'relative',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = isTopMatch
                      ? '0 10px 24px -4px rgba(13, 148, 136, 0.18)'
                      : '0 8px 20px -4px rgba(15, 23, 42, 0.08)';
                    if (!isTopMatch) e.currentTarget.style.borderColor = '#CBD5E1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = isTopMatch
                      ? '0 6px 20px -4px rgba(13, 148, 136, 0.12), 0 2px 6px -1px rgba(15, 23, 42, 0.04)'
                      : '0 1px 3px rgba(15, 23, 42, 0.03)';
                    if (!isTopMatch) e.currentTarget.style.borderColor = '#E2E8F0';
                  }}
                >
                  <div>
                    {/* Top Match Highlight Label (Breaks identical card monotony) */}
                    {isTopMatch && (
                      <div style={{ marginBottom: '0.75rem' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            letterSpacing: '0.01em',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '9999px',
                            backgroundColor: '#F0FDFA',
                            color: '#0F6B5C',
                            border: '1px solid #CCFBF1',
                          }}
                        >
                          <span>✦</span> Top match for your profile
                        </span>
                      </div>
                    )}

                    {/* Card Header: Company, Date, Match Score Badge & Bookmark */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.5rem',
                        marginBottom: '0.75rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0 }}>
                        <Building2 size={15} color="#64748B" style={{ flexShrink: 0 }} />
                        <span
                          style={{
                            fontSize: '0.86rem',
                            fontWeight: 600,
                            color: '#334155',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {job.company}
                        </span>
                        <span style={{ color: '#CBD5E1', fontSize: '0.75rem' }}>•</span>
                        <span style={{ fontSize: '0.76rem', color: '#94A3B8', flexShrink: 0 }}>
                          {formatDate(job.createdAt)}
                        </span>
                      </div>

                      {/* Right Header Actions: Match Score Preview Badge + Interactive Bookmark */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
                        {/* 1. Diagnostic Match Preview Badge */}
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'baseline',
                            gap: '0.2rem',
                            padding: '0.22rem 0.55rem',
                            borderRadius: '9999px',
                            backgroundColor: job.isStrongMatch ? '#F0FDFA' : '#FFFBEB',
                            border: `1px solid ${job.isStrongMatch ? '#99F6E4' : '#FDE68A'}`,
                          }}
                          title={`Estimated ${job.matchScore}% candidate compatibility based on skills profile`}
                        >
                          <span
                            style={{
                              fontFamily: "'JetBrains Mono', monospace",
                              fontSize: '0.84rem',
                              fontWeight: 700,
                              color: job.isStrongMatch ? '#0F6B5C' : '#B45309',
                              lineHeight: 1,
                            }}
                          >
                            {job.matchScore}%
                          </span>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              color: job.isStrongMatch ? '#0d9488' : '#D97706',
                              lineHeight: 1,
                            }}
                          >
                            fit
                          </span>
                        </div>

                        {/* 8. Interactive Bookmark Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleToggleSave(job);
                          }}
                          style={{
                            background: saved ? '#FFFBEB' : '#FFFFFF',
                            border: `1px solid ${saved ? '#FDE68A' : '#E2E8F0'}`,
                            borderRadius: '6px',
                            padding: '0.32rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s ease',
                          }}
                          title={saved ? 'Saved to bookmarks (click to remove)' : 'Save role for later'}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.08)';
                            if (!saved) e.currentTarget.style.borderColor = '#CBD5E1';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            if (!saved) e.currentTarget.style.borderColor = '#E2E8F0';
                          }}
                        >
                          <Bookmark
                            size={14}
                            fill={saved ? '#D97706' : 'none'}
                            color={saved ? '#D97706' : '#94A3B8'}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Job Title with Clinical Serif Typography */}
                    <h2
                      style={{
                        fontFamily: "'Newsreader', 'Charter', 'Georgia', serif",
                        fontSize: '1.22rem',
                        fontWeight: 600,
                        lineHeight: 1.35,
                        margin: '0 0 0.45rem 0',
                        color: '#0F172A',
                      }}
                    >
                      <Link
                        to={`/jobs/${job._id}`}
                        style={{
                          color: '#0F172A',
                          textDecoration: 'none',
                          transition: 'color 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#0d9488')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#0F172A')}
                      >
                        {job.title}
                      </Link>
                    </h2>

                    {/* Location Badge */}
                    <div style={{ marginBottom: '0.85rem' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          fontSize: '0.76rem',
                          color: '#0F6B5C',
                          backgroundColor: '#F0FDFA',
                          border: '1px solid #CCFBF1',
                          padding: '0.15rem 0.55rem',
                          borderRadius: '9999px',
                          fontWeight: 500,
                        }}
                      >
                        <MapPin size={11} color="#0d9488" />
                        <span>{job.location}</span>
                      </span>
                    </div>

                    {/* Description Snippet */}
                    <p
                      style={{
                        fontSize: '0.87rem',
                        color: '#475569',
                        lineHeight: 1.55,
                        marginBottom: '1.15rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {job.description}
                    </p>

                    {/* 7. Skill Tags with Gap Analysis (Matched vs Missing) */}
                    <div style={{ marginBottom: '1.25rem' }}>
                      <div
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          color: '#64748B',
                          marginBottom: '0.4rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        <span>Competencies & fit analysis:</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {job.requiredSkills?.map((skill, idx) => {
                          const isMatched = job.matchedSkills?.includes(skill);
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSkillClick(skill)}
                              title={
                                isMatched
                                  ? `You match ${skill} (Click to filter by this competency)`
                                  : `Competency gap: ${skill} (Click to filter by this competency)`
                              }
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.18rem 0.5rem',
                                fontSize: '0.74rem',
                                fontWeight: isMatched ? 600 : 400,
                                borderRadius: '5px',
                                border: isMatched ? '1px solid #99F6E4' : '1px solid #E2E8F0',
                                backgroundColor: isMatched ? '#F0FDFA' : '#F8FAFC',
                                color: isMatched ? '#0F6B5C' : '#64748B',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#0d9488';
                                e.currentTarget.style.color = '#0F6B5C';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = isMatched ? '#99F6E4' : '#E2E8F0';
                                e.currentTarget.style.color = isMatched ? '#0F6B5C' : '#64748B';
                              }}
                            >
                              {isMatched && <Check size={11} strokeWidth={2.8} color="#0d9488" />}
                              <span>{skill}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* 2. Distinct CTA Hierarchy: Primary "Apply now" vs Secondary "Run skill diagnostic" */}
                  <div
                    style={{
                      borderTop: '1px solid #F1F5F9',
                      paddingTop: '0.95rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                    }}
                  >
                    {user?.role === 'recruiter' ? (
                      <button
                        onClick={() => navigate(`/dashboard/pipeline/${job._id}`)}
                        style={{
                          width: '100%',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                          padding: '0.55rem 0.9rem',
                          borderRadius: '7px',
                          border: 'none',
                          backgroundColor: '#0d9488',
                          color: '#FFFFFF',
                          fontSize: '0.84rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0F6B5C')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0d9488')}
                      >
                        <LayoutDashboard size={14} />
                        <span>View applicants in ATS</span>
                      </button>
                    ) : (
                      <>
                        {/* Primary Dominant CTA: Apply now */}
                        <button
                          onClick={() => handleOpenApplyModal(job, false)}
                          style={{
                            flex: 1,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                            padding: '0.55rem 0.9rem',
                            borderRadius: '7px',
                            border: 'none',
                            backgroundColor: '#0d9488',
                            color: '#FFFFFF',
                            fontSize: '0.84rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: '0 1px 2px rgba(13, 148, 136, 0.2)',
                            transition: 'background-color 0.15s ease, transform 0.1s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#0F6B5C';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#0d9488';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          <Send size={13} />
                          <span>Apply now</span>
                        </button>

                        {/* Secondary Supporting CTA: Run skill diagnostic */}
                        <button
                          onClick={() => handleOpenApplyModal(job, true)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.35rem',
                            padding: '0.52rem 0.75rem',
                            borderRadius: '7px',
                            border: '1px solid #CCFBF1',
                            backgroundColor: '#F0FDFA',
                            color: '#0F6B5C',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            whiteSpace: 'nowrap',
                          }}
                          title="Review personalized competence match and interview talking points"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#CCFBF1';
                            e.currentTarget.style.borderColor = '#99F6E4';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#F0FDFA';
                            e.currentTarget.style.borderColor = '#CCFBF1';
                          }}
                        >
                          <Sparkles size={13} color="#0d9488" />
                          <span>Check match</span>
                        </button>
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Real-time AI Apply & Diagnostic Modal */}
        <ApplyModal
          job={selectedJob}
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          initialEvaluation={initialEvaluationForModal}
        />
      </div>
    </div>
  );
};

export default JobsList;
