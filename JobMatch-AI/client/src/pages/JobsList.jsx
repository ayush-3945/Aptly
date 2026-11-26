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
  FileCheck,
  ArrowRight,
  Activity,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import ApplyModal from '../components/ApplyModal';
import { useSavedJobs } from '../utils/savedJobs';
import { FALLBACK_JOBS } from '../data/fallbackJobs';
import SkillAutocomplete from '../components/SkillAutocomplete';
import { normalizeSkillName } from '../utils/skillsList';
import useDocumentTitle from '../hooks/useDocumentTitle';

const POPULAR_SKILLS = [
  'All',
  'React',
  'Node.js',
  'Python',
  'Java',
  'Docker',
  'AWS',
  'Kubernetes',
  'PostgreSQL',
  'TypeScript',
  'Tailwind CSS',
];
const LOCATIONS = [
  'All Locations',
  'Remote',
  'Hybrid',
  'San Francisco, CA',
  'Austin, TX',
  'New York, NY',
  'Seattle, WA',
  'Chicago, IL',
  'Boston, MA',
  'Denver, CO',
];

const JobsList = () => {
  useDocumentTitle(
    'Explore Tech Jobs',
    'Browse verified technical requisitions with real-time skill matching and compensation transparency.'
  );

  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [selectedSkill, setSelectedSkill] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [userSelectedSort, setUserSelectedSort] = useState(false);

  // Modal State
  const [selectedJob, setSelectedJob] = useState(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [initialEvaluationForModal, setInitialEvaluationForModal] = useState(null);

  // Bookmark State
  const { isSaved, toggleSave } = useSavedJobs();
  const [candidateApplications, setCandidateApplications] = useState([]);

  const handleToggleSave = (job) => {
    const isNowSaved = toggleSave(job._id);
    showToast(
      isNowSaved ? `Saved "${job.title}" to your bookmarks.` : `Removed "${job.title}" from saved jobs.`,
      isNowSaved ? 'success' : 'info'
    );
  };

  // Fetch candidate evaluated applications if logged in
  useEffect(() => {
    if (user && user.role === 'candidate') {
      api
        .get('/applications/my')
        .then((res) => {
          if (Array.isArray(res.data)) {
            setCandidateApplications(res.data);
          }
        })
        .catch(() => {
          setCandidateApplications([]);
        });
    } else {
      setCandidateApplications([]);
    }
  }, [user]);

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
        console.warn('Jobs API unreachable, using fallback list:', err.message);
        setJobs(FALLBACK_JOBS);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Candidate reference skills if present in profile
  const isCandidate = Boolean(user && user.role === 'candidate');
  const candidateSkills = useMemo(() => {
    if (isCandidate && Array.isArray(user?.skills) && user.skills.length > 0) {
      return user.skills.map((s) => (typeof s === 'string' ? s : s?.name || '')).filter(Boolean);
    }
    return [];
  }, [isCandidate, user]);

  const hasCandidateSkills = candidateSkills.length > 0;
  const candidateHasNoSkills = isCandidate && candidateSkills.length === 0;

  // Canonical set of normalized lowercase skills for exact, case-insensitive overlap
  const candidateCanonicalSkills = useMemo(() => {
    const set = new Set();
    candidateSkills.forEach((s) => {
      const canonical = normalizeSkillName(s);
      if (canonical) set.add(canonical.toLowerCase());
    });
    return set;
  }, [candidateSkills]);

  // Enrich each job: Only real matcher scores from candidate applications are shown.
  // Unevaluated jobs receive matchScore = null (rendered as "Not evaluated yet").
  const enrichedJobs = useMemo(() => {
    return jobs.map((job) => {
      const jobIdStr = String(job._id || job.id || '');
      const reqSkills = Array.isArray(job.requiredSkills) ? job.requiredSkills : [];

      // Check if logged-in candidate already has an evaluated application
      const candidateApp = candidateApplications.find((app) => {
        const appJobId = String(app.job?._id || app.job?.id || app.job || '');
        return appJobId === jobIdStr;
      });

      // Calculate profile overlap count using normalizeSkillName (case-insensitive)
      const overlapSkills = reqSkills.filter((s) =>
        candidateCanonicalSkills.has(normalizeSkillName(s).toLowerCase())
      );
      const overlapCount = overlapSkills.length;

      if (candidateApp && typeof candidateApp.aiMatchScore === 'number') {
        return {
          ...job,
          matchScore: candidateApp.aiMatchScore,
          matchedSkills: Array.isArray(candidateApp.matchedSkills) && candidateApp.matchedSkills.length > 0
            ? candidateApp.matchedSkills
            : overlapSkills,
          missingSkills: Array.isArray(candidateApp.missingSkills) ? candidateApp.missingSkills : [],
          isStrongMatch: candidateApp.aiMatchScore >= 75,
          isEvaluated: true,
          overlapCount,
        };
      }

      const missing = reqSkills.filter(
        (s) => !candidateCanonicalSkills.has(normalizeSkillName(s).toLowerCase())
      );

      // Do NOT invent match scores. Stays null until evaluated by the real matcher.
      return {
        ...job,
        matchScore: null,
        matchedSkills: overlapSkills,
        missingSkills: missing,
        isStrongMatch: false,
        isEvaluated: false,
        overlapCount,
      };
    });
  }, [jobs, candidateApplications, candidateCanonicalSkills]);

  // Check if any job has an AI fit score for this candidate
  const hasAnyAiFitScore = useMemo(() => {
    return enrichedJobs.some((j) => typeof j.matchScore === 'number');
  }, [enrichedJobs]);

  // Default sort: if no job has an AI fit score for this candidate, default to "newest".
  // If evaluated roles exist, default to "best-match" unless candidate manually selected a sort option.
  useEffect(() => {
    if (!userSelectedSort) {
      setSortBy(hasAnyAiFitScore ? 'best-match' : 'newest');
    }
  }, [hasAnyAiFitScore, userSelectedSort]);

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

    // Sort order
    if (sortBy === 'best-match') {
      result.sort((a, b) => {
        const scoreA = typeof a.matchScore === 'number' ? a.matchScore : -1;
        const scoreB = typeof b.matchScore === 'number' ? b.matchScore : -1;
        if (scoreA !== scoreB) {
          return scoreB - scoreA;
        }
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
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
    const evaluated = filteredJobs.filter((j) => typeof j.matchScore === 'number');
    if (evaluated.length === 0) return null;
    let highest = evaluated[0];
    for (const j of evaluated) {
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
    setUserSelectedSort(false);
    setSortBy(hasAnyAiFitScore ? 'best-match' : 'newest');
  };

  const hasActiveFilters =
    keyword.trim() !== '' || selectedLocation !== 'All Locations' || selectedSkill !== 'All';

  // Distinct handler for Evaluate (diagnostic scorecard) vs Apply (direct submission)
  const handleOpenApplyModal = (job, isDiagnosticEvaluation = false) => {
    setSelectedJob(job);
    if (isDiagnosticEvaluation && typeof job.matchScore === 'number') {
      setInitialEvaluationForModal({
        aiMatchScore: job.matchScore,
        recommendation: job.isStrongMatch ? 'Strong Match' : 'Moderate Match',
        matchedSkills: job.matchedSkills,
        missingSkills: job.missingSkills,
        experienceFit: `Candidate profile aligns with ${job.matchedSkills.length} of ${job.requiredSkills?.length || 0} evaluated skills.`,
        fitSummary: `Evaluation summary for ${job.title} at ${job.company}. Review skill breakdown and interview strategy below.`,
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
              Job Directory
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
                Browse open positions and see how your skills match each role.
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

          {/* Row 2: Skill Filter Strip */}
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
              Filter by skill:
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

            {/* Custom selected skill pill when not in POPULAR_SKILLS */}
            {selectedSkill !== 'All' &&
              !POPULAR_SKILLS.some((s) => s.toLowerCase() === selectedSkill.toLowerCase()) && (
                <button
                  key={selectedSkill}
                  type="button"
                  onClick={() => setSelectedSkill('All')}
                  style={{
                    padding: '0.22rem 0.65rem',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: '1px solid #0d9488',
                    backgroundColor: '#0d9488',
                    color: '#FFFFFF',
                    boxShadow: '0 1px 3px rgba(13, 148, 136, 0.28)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                  title="Click to clear skill filter"
                >
                  <span>{selectedSkill}</span>
                  <X size={12} />
                </button>
              )}

            {/* Reusable SkillAutocomplete for search filter */}
            <div style={{ minWidth: '170px', maxWidth: '230px', marginLeft: 'auto' }}>
              <SkillAutocomplete
                onAddSkill={(skill) => setSelectedSkill(skill)}
                placeholder="Find skill..."
                showButton={false}
                existingSkills={selectedSkill !== 'All' ? [selectedSkill] : []}
                className="form-input"
                inputStyle={{
                  padding: '0.24rem 0.65rem',
                  fontSize: '0.78rem',
                  height: '28px',
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                }}
              />
            </div>
          </div>
        </div>

        {/* Profile Skills Overlap Prompt — shown once at top if logged-in candidate has no skills saved */}
        {candidateHasNoSkills && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              fontSize: '0.86rem',
              color: '#475569',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={16} color="#0D9488" style={{ flexShrink: 0 }} />
              <span>
                Profile overlap:{' '}
                <strong style={{ color: '#0F172A' }}>Add skills to your profile to see matches</strong> with open roles.
              </span>
            </div>
            <Link
              to="/profile"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#0D9488',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
            >
              <span>Add skills</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        )}

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            <span>
              Showing <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{filteredJobs.length}</strong> roles
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
              onChange={(e) => {
                setUserSelectedSort(true);
                setSortBy(e.target.value);
              }}
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
              {hasAnyAiFitScore ? (
                <>
                  <option value="best-match">Best match (AI)</option>
                  <option value="newest">Newest</option>
                  <option value="title">Role title (A–Z)</option>
                  <option value="company">Company name (A–Z)</option>
                </>
              ) : (
                <>
                  <option value="newest">Newest</option>
                  <option value="best-match">Best match (AI)</option>
                  <option value="title">Role title (A–Z)</option>
                  <option value="company">Company name (A–Z)</option>
                </>
              )}
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
              Loading available jobs...
            </p>
          </div>
        ) : jobs.length === 0 ? (
          /* Empty State — 0 Total Roles Posted */
          <div
            style={{
              textAlign: 'center',
              padding: '4.5rem 1.5rem',
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
            }}
          >
            {/* Centered Document with Magnifying Glass SVG Illustration in Teal */}
            <svg
              width="68"
              height="68"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ margin: '0 auto 1.25rem', display: 'block' }}
            >
              <rect
                x="14"
                y="8"
                width="36"
                height="48"
                rx="5"
                fill="#F0FDFA"
                stroke="#0D9488"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line x1="22" y1="20" x2="38" y2="20" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="22" y1="28" x2="38" y2="28" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="22" y1="36" x2="30" y2="36" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="42" cy="42" r="10" fill="#FFFFFF" stroke="#0F766E" strokeWidth="2.5" />
              <line x1="49" y1="49" x2="57" y2="57" stroke="#0F766E" strokeWidth="3" strokeLinecap="round" />
            </svg>

            <h3
              style={{
                fontFamily: "'Newsreader', Georgia, serif",
                fontSize: '1.45rem',
                fontWeight: 700,
                color: '#0F172A',
                marginBottom: '0.4rem',
              }}
            >
              No roles posted yet
            </h3>
            <p
              style={{
                color: '#64748B',
                fontSize: '0.92rem',
                margin: '0 auto 1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                flexWrap: 'wrap',
              }}
            >
              <span>Check back soon or</span>
              <button
                type="button"
                onClick={() =>
                  showToast('Preference saved! We will notify you as soon as new positions open up.', 'success')
                }
                className="btn btn-ghost"
                style={{
                  padding: '0.2rem 0.65rem',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  color: '#0F766E',
                  backgroundColor: '#F0FDFA',
                  border: '1px solid #CCFBF1',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                Notify me
              </button>
            </p>
          </div>
        ) : filteredJobs.length === 0 ? (
          /* Filtered Empty State */
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
              Try adjusting your search keyword, selecting "All Locations", or resetting skill filters.
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
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
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
                          Top match for your profile
                        </span>
                      </div>
                    )}

                    {/* Card Header: Split into 2 Rows:
                        Row 1: Company name (on its own line, wraps if long, max 2 lines) + Bookmark icon (top right)
                        Row 2: Status badge ("Not evaluated yet" / fit %) and Date under company name */}
                    <div style={{ marginBottom: '0.75rem' }}>
                      {/* Row 1: Company Name + Bookmark Button */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: '0.75rem',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.45rem',
                            minWidth: 0,
                            flex: 1,
                          }}
                        >
                          <Building2
                            size={16}
                            color="#64748B"
                            style={{ flexShrink: 0, marginTop: '2px' }}
                          />
                          <span
                            style={{
                              fontSize: '0.88rem',
                              fontWeight: 600,
                              color: '#334155',
                              lineHeight: 1.35,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              wordBreak: 'break-word',
                              overflowWrap: 'break-word',
                            }}
                            title={job.company}
                          >
                            {job.company}
                          </span>
                        </div>

                        {/* Interactive Bookmark Button pinned at Top Right */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleToggleSave(job);
                          }}
                          style={{
                            flexShrink: 0,
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

                      {/* Row 2: Status Badge and Date under Company Name */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          flexWrap: 'wrap',
                          marginTop: '0.45rem',
                        }}
                      >
                        {/* Diagnostic Match Preview Badge */}
                        {typeof job.matchScore === 'number' ? (
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'baseline',
                              gap: '0.2rem',
                              padding: '0.2rem 0.55rem',
                              borderRadius: '9999px',
                              backgroundColor: job.isStrongMatch ? '#F0FDFA' : '#FFFBEB',
                              border: `1px solid ${job.isStrongMatch ? '#99F6E4' : '#FDE68A'}`,
                            }}
                            title={`Evaluated fit: ${job.matchScore}% candidate compatibility`}
                          >
                            <span
                              style={{
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                color: job.isStrongMatch ? 'var(--accent-teal)' : 'var(--semantic-amber)',
                                lineHeight: 1,
                              }}
                            >
                              {job.matchScore}%
                            </span>
                            <span
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                color: job.isStrongMatch ? 'var(--accent-teal)' : 'var(--semantic-amber)',
                                lineHeight: 1,
                              }}
                            >
                              fit
                            </span>
                          </div>
                        ) : (
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '0.18rem 0.52rem',
                              borderRadius: '9999px',
                              backgroundColor: 'var(--bg-secondary)',
                              border: '1px solid var(--border-default)',
                            }}
                            title="Not evaluated yet for your profile"
                          >
                            <span
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                color: 'var(--text-muted)',
                                lineHeight: 1,
                              }}
                            >
                              Not evaluated yet
                            </span>
                          </div>
                        )}

                        <span style={{ color: '#CBD5E1', fontSize: '0.75rem' }}>•</span>
                        <span style={{ fontSize: '0.76rem', color: '#94A3B8' }}>
                          {formatDate(job.createdAt)}
                        </span>
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

                    {/* 7. Skill Tags with Gap Analysis & Profile Overlap Line */}
                    <div style={{ marginBottom: '1.25rem' }}>
                      <div
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          color: '#64748B',
                          marginBottom: '0.35rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        <span>Skills & fit:</span>
                      </div>

                      {/* Small line: "X of Y skills match your profile" (Profile overlap, not AI score) */}
                      {hasCandidateSkills && Array.isArray(job.requiredSkills) && job.requiredSkills.length > 0 && (
                        <div
                          style={{
                            fontSize: '0.76rem',
                            color: '#475569',
                            marginBottom: '0.45rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            flexWrap: 'wrap',
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 600,
                              color: job.overlapCount > 0 ? '#0F766E' : '#64748B',
                            }}
                          >
                            {job.overlapCount} of {job.requiredSkills.length} skills match your profile
                          </span>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              color: '#64748B',
                              backgroundColor: '#F1F5F9',
                              border: '1px solid #E2E8F0',
                              padding: '0.08rem 0.35rem',
                              borderRadius: '3px',
                              fontWeight: 500,
                            }}
                          >
                            profile overlap
                          </span>
                        </div>
                      )}

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {job.requiredSkills?.map((skill, idx) => {
                          const isMatched = candidateCanonicalSkills.has(normalizeSkillName(skill).toLowerCase());
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSkillClick(skill)}
                              title={
                                isMatched
                                  ? `You match ${skill} (Click to filter)`
                                  : `Missing skill: ${skill} (Click to filter)`
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
                      flexWrap: 'wrap',
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
                          title="Review skill match and interview tips"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#CCFBF1';
                            e.currentTarget.style.borderColor = '#99F6E4';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#F0FDFA';
                            e.currentTarget.style.borderColor = '#CCFBF1';
                          }}
                        >
                          <FileCheck size={13} color="#0d9488" />
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
