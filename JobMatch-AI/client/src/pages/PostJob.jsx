import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import {
  Briefcase,
  Building2,
  MapPin,
  Sparkles,
  Plus,
  X,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Wand2,
  Layers,
  Globe,
  FileText,
  ShieldAlert,
  Award,
} from 'lucide-react';
import api from '../services/api';
import JDQualityPanel from '../components/JDQualityPanel';

const POPULAR_SKILLS = [
  'React',
  'Node.js',
  'Express',
  'MongoDB',
  'Gemini AI',
  'TypeScript',
  'Docker',
  'Python',
  'AWS',
  'TailwindCSS',
  'GraphQL',
  'Kubernetes',
];

const WORKPLACE_TYPES = ['Remote', 'Hybrid', 'Onsite'];
const EXPERIENCE_LEVELS = ['Entry-Level', 'Mid-Level', 'Senior', 'Lead / Staff', 'Executive'];

const SAMPLE_JOB = {
  title: 'Senior Full-Stack MERN & Gemini AI Engineer',
  company: 'CloudPulse AI Systems',
  workplaceType: 'Remote',
  location: 'Remote (US/Global)',
  experienceLevel: 'Senior',
  skills: ['React', 'Node.js', 'Express', 'MongoDB', 'Gemini AI', 'Docker', 'REST API'],
  description: `About the Role:
CloudPulse AI Systems is building next-generation intelligent HR and hiring platforms. We are seeking a Senior Full-Stack MERN & Gemini AI Engineer to lead the architecture and implementation of our high-volume candidate evaluation pipeline and AI matching services.

Key Responsibilities:
• Design and build scalable Node.js microservices and RESTful APIs connecting to MongoDB clusters.
• Integrate Google Gemini foundation models (Gemini 2.5 Flash) for automated resume analysis, skill gap detection, and ATS compatibility scoring.
• Develop reactive, high-performance user interfaces using React 19 and modern CSS.
• Architect background job processing and secure multipart PDF parsing pipelines using Multer and pdf-parse.
• Partner with product and engineering leaders to uphold 99.9% uptime, write automated tests, and optimize database aggregations.

Compensation & Benefits:
• $145,000 - $180,000 base salary + equity options.
• Comprehensive medical, dental, vision coverage, 401(k) matching, and annual remote work equipment stipend.`,
  requirements: `• 4+ years of production experience building and deploying full-stack web applications in the MERN stack.
• Proven hands-on experience integrating LLM APIs (Gemini, Claude, or OpenAI) with structured JSON outputs.
• Deep understanding of MongoDB schema design, indexing, and aggregation pipelines.
• Familiarity with containerization (Docker) and cloud deployments (AWS, Vercel, Render).
• Strong communication skills and a passion for engineering high-velocity AI products.`,
};

const PostJob = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [workplaceType, setWorkplaceType] = useState('Remote');
  const [location, setLocation] = useState('Remote');
  const [experienceLevel, setExperienceLevel] = useState('Senior');
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Live JD Quality Scorer State
  const [scoreData, setScoreData] = useState(null);
  const [scoringLoading, setScoringLoading] = useState(false);
  const descriptionInputRef = React.useRef(null);

  // Fetch JD Quality Analysis
  const fetchJdScore = async (
    descVal = description,
    reqVal = requirements,
    titleVal = title,
    locVal = location,
    expVal = experienceLevel
  ) => {
    const combined = `${descVal} ${reqVal}`.trim();
    if (combined.length < 10) {
      setScoreData(null);
      setScoringLoading(false);
      return;
    }

    setScoringLoading(true);
    try {
      const res = await api.post('/jobs/score-jd', {
        jobTitle: titleVal.trim() || 'Engineering Role',
        description: descVal.trim() || 'Software Engineer',
        requirements: reqVal.trim(),
        location: locVal.trim() || 'Remote',
        experienceLevel: expVal,
      });

      if (res.data) {
        setScoreData(res.data.data || res.data);
      }
    } catch (err) {
      console.warn('[PostJob] Failed to score JD:', err.message);
      showToast('Could not score JD right now. Please verify server connection.', 'error');
    } finally {
      setScoringLoading(false);
    }
  };

  // Debounced trigger: 1.5s after user stops typing
  useEffect(() => {
    const combined = `${description} ${requirements}`.trim();
    if (combined.length < 10) {
      setScoreData(null);
      return;
    }

    const timer = setTimeout(() => {
      fetchJdScore();
    }, 1500);

    return () => clearTimeout(timer);
  }, [description, requirements, title, location, experienceLevel]);

  const handleAnalyzeNow = () => {
    const combined = `${description} ${requirements}`.trim();
    if (combined.length === 0) {
      showToast(
        'Please enter text in Job Overview or Requirements before analyzing, or click "Pre-fill Sample Job".',
        'warning'
      );
      descriptionInputRef.current?.focus();
      return;
    }
    if (combined.length < 10) {
      showToast(
        `Please write at least 10 characters for JD analysis (currently ${combined.length} chars).`,
        'info'
      );
      descriptionInputRef.current?.focus();
      return;
    }
    fetchJdScore();
  };

  // 1-Click Pre-fill Sample Job
  const handlePrefill = () => {
    setTitle(SAMPLE_JOB.title);
    setCompany(SAMPLE_JOB.company);
    setWorkplaceType(SAMPLE_JOB.workplaceType);
    setLocation(SAMPLE_JOB.location);
    setExperienceLevel(SAMPLE_JOB.experienceLevel || 'Senior');
    setSkills(SAMPLE_JOB.skills);
    setDescription(SAMPLE_JOB.description);
    setRequirements(SAMPLE_JOB.requirements);
    setError('');

    // Trigger analysis immediately on sample prefill
    fetchJdScore(
      SAMPLE_JOB.description,
      SAMPLE_JOB.requirements,
      SAMPLE_JOB.title,
      SAMPLE_JOB.location,
      SAMPLE_JOB.experienceLevel || 'Senior'
    );
  };

  // Skill Input Handler — supports comma-separated bulk input
  const handleAddSkill = (skillToAdd) => {
    const raw = (skillToAdd || skillInput).trim();
    if (!raw) return;

    const parts = raw.split(',').map((s) => s.trim()).filter(Boolean);
    const newSkills = [...skills];
    parts.forEach((part) => {
      const exists = newSkills.some((s) => s.toLowerCase() === part.toLowerCase());
      if (!exists && part.length > 0) {
        newSkills.push(part);
      }
    });
    setSkills(newSkills);
    setSkillInput('');
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Workplace selection helper
  const handleSelectWorkplace = (type) => {
    setWorkplaceType(type);
    if (type === 'Remote' && (location === 'New York, NY' || location === 'San Francisco, CA (Hybrid)')) {
      setLocation('Remote');
    } else if (type === 'Hybrid' && location === 'Remote') {
      setLocation('San Francisco, CA (Hybrid)');
    } else if (type === 'Onsite' && location === 'Remote') {
      setLocation('New York, NY');
    }
  };

  // Warning tooltip logic for post button
  const postWarningTooltip =
    scoreData && scoreData.overallScore > 0 && scoreData.overallScore < 50
      ? 'JD quality score is low. Consider improving first.'
      : scoreData?.biasFlags?.length > 0
      ? 'Biased language detected — review before posting'
      : '';

  // Submit Job Creation
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (skillInput.trim()) {
      const parts = skillInput.split(',').map((s) => s.trim()).filter(Boolean);
      const updated = [...skills];
      parts.forEach((part) => {
        if (!updated.some((s) => s.toLowerCase() === part.toLowerCase())) {
          updated.push(part);
        }
      });
      setSkills(updated);
      setSkillInput('');
    }

    if (!title.trim()) {
      setError('Please provide a job title.');
      showToast('Please provide a job title.', 'warning');
      return;
    }
    if (!company.trim()) {
      setError('Please provide the hiring company name.');
      showToast('Please provide the hiring company name.', 'warning');
      return;
    }
    if (!location.trim()) {
      setError('Please provide the job location or select Remote.');
      showToast('Please provide the job location or select Remote.', 'warning');
      return;
    }

    const currentSkills = skillInput.trim()
      ? [...skills, ...skillInput.split(',').map((s) => s.trim()).filter((s) => s && !skills.some((sk) => sk.toLowerCase() === s.toLowerCase()))]
      : skills;

    if (currentSkills.length === 0) {
      setError('Please add at least one required technical skill.');
      showToast('Please add at least one required technical skill.', 'warning');
      return;
    }

    const combinedDescription = requirements.trim()
      ? `${description.trim()}\n\nRequirements & Qualifications:\n${requirements.trim()}`
      : description.trim();

    if (!combinedDescription || combinedDescription.length < 30) {
      setError('Please provide a descriptive job overview (at least 30 characters).');
      showToast('Please provide a descriptive job overview.', 'warning');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: title.trim(),
        company: company.trim(),
        location: location.trim(),
        requiredSkills: skills,
        description: combinedDescription,
        workplaceType,
        experienceLevel,
      };

      const response = await api.post('/jobs', payload);

      setSuccessMessage(`Opening created successfully for "${response.data.title || title}"!`);
      showToast('Job requisition published successfully!', 'success');

      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    } catch (err) {
      console.error('Job creation error:', err);
      const msg =
        err.response?.data?.message ||
        'Failed to publish job opening. Please check your connection and try again.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '3rem 1.5rem 5rem', maxWidth: '1320px' }}>
      {/* Back to Dashboard Link */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--accent-teal)',
            fontSize: '0.9rem',
            fontWeight: 600,
            transition: 'var(--transition)',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Recruiter Dashboard</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div
        className="paper-card"
        style={{
          padding: '2rem 2.25rem',
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
            gap: '1.25rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.01em',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '4px',
                  background: 'var(--accent-teal-light)',
                  color: 'var(--accent-teal)',
                  border: '1px solid rgba(15, 107, 92, 0.25)',
                }}
              >
                ATS requisition studio
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Powered by Gemini 2.5 Flash live quality analyzer
              </span>
            </div>
            <h1
              style={{
                fontFamily: "'Newsreader', Georgia, serif",
                fontSize: '2.1rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                margin: '0 0 0.35rem 0',
                color: 'var(--text-primary)',
              }}
            >
              Create New Job Opening
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', maxWidth: '680px', lineHeight: 1.5, margin: 0 }}>
              Draft role responsibilities and qualifications. The real-time AI scorer will evaluate your description's clarity, competitiveness, and screen for biased wording.
            </p>
          </div>

          {/* Pre-fill Sample Button */}
          <button
            type="button"
            onClick={handlePrefill}
            disabled={loading}
            className="btn btn-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.84rem',
              padding: '0.55rem 1.1rem',
              borderColor: 'rgba(15, 107, 92, 0.3)',
              color: 'var(--accent-teal)',
            }}
            title="Populate complete sample engineering role"
          >
            <Wand2 size={15} />
            <span>Pre-fill Sample Job</span>
          </button>
        </div>
      </div>

      {/* 2-Column Split Layout: 60% Form / 40% Live JD Quality Panel */}
      <div className="post-job-grid-layout">
        {/* Left Column (60%): Job Creation Form */}
        <div>
          <form
            onSubmit={handleSubmit}
            className="paper-card"
            style={{
              padding: '2.25rem',
              borderRadius: '8px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
            }}
          >
            {/* Error & Success Banners */}
            {error && (
              <div
                style={{
                  padding: '1rem 1.25rem',
                  borderRadius: '6px',
                  background: 'rgba(185, 28, 28, 0.08)',
                  border: '1px solid rgba(185, 28, 28, 0.25)',
                  color: 'var(--semantic-red)',
                  marginBottom: '1.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  fontSize: '0.88rem',
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div
                style={{
                  padding: '1rem 1.25rem',
                  borderRadius: '6px',
                  background: 'rgba(45, 122, 58, 0.08)',
                  border: '1px solid rgba(45, 122, 58, 0.25)',
                  color: 'var(--semantic-green)',
                  marginBottom: '1.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  fontSize: '0.88rem',
                }}
              >
                <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Row 1: Job Title */}
            <div className="form-group" style={{ marginBottom: '1.75rem' }}>
              <label className="form-label" style={{ fontSize: '0.92rem', marginBottom: '0.4rem' }}>
                <Briefcase size={16} color="var(--accent-teal)" />
                Job Title / Requisition Role <span style={{ color: 'var(--semantic-red)' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Senior Full-Stack MERN & Gemini AI Engineer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input"
                style={{ fontSize: '0.95rem', padding: '0.8rem 1.1rem' }}
                disabled={loading}
                required
              />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Use industry standard titles (e.g. "Senior Backend Engineer") for optimal candidate matching.
              </span>
            </div>

            {/* Row 2: Company, Workplace Arrangement, and Experience Level */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.25rem',
                marginBottom: '1.75rem',
              }}
            >
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.92rem', marginBottom: '0.4rem' }}>
                  <Building2 size={16} color="var(--accent-teal)" />
                  Hiring Company <span style={{ color: 'var(--semantic-red)' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. CloudPulse AI"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '0.92rem', padding: '0.75rem 1rem' }}
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.92rem', marginBottom: '0.4rem' }}>
                  <Globe size={16} color="var(--accent-teal)" />
                  Workplace Type
                </label>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {WORKPLACE_TYPES.map((type) => {
                    const isSelected = workplaceType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleSelectWorkplace(type)}
                        style={{
                          flex: 1,
                          padding: '0.7rem 0.3rem',
                          borderRadius: '6px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'var(--transition)',
                          border: isSelected
                            ? '1px solid var(--accent-teal)'
                            : '1px solid var(--border-default)',
                          background: isSelected
                            ? 'var(--accent-teal-light)'
                            : 'var(--bg-card)',
                          color: isSelected ? 'var(--accent-teal)' : 'var(--text-secondary)',
                        }}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.92rem', marginBottom: '0.4rem' }}>
                  <Award size={16} color="var(--accent-teal)" />
                  Experience Level
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '0.88rem', padding: '0.75rem 1rem' }}
                  disabled={loading}
                >
                  {EXPERIENCE_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 3: Location */}
            <div className="form-group" style={{ marginBottom: '1.75rem' }}>
              <label className="form-label" style={{ fontSize: '0.92rem', marginBottom: '0.4rem' }}>
                <MapPin size={16} color="var(--accent-teal)" />
                Location Details <span style={{ color: 'var(--semantic-red)' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Remote (US/Global), San Francisco, CA (Hybrid), or New York, NY"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="form-input"
                style={{ fontSize: '0.92rem', padding: '0.75rem 1rem' }}
                disabled={loading}
                required
              />
            </div>

            {/* Row 4: Required Skills & Tech Stack */}
            <div className="form-group" style={{ marginBottom: '1.75rem' }}>
              <label className="form-label" style={{ fontSize: '0.92rem', marginBottom: '0.4rem' }}>
                <Layers size={16} color="var(--accent-teal)" />
                Required Skills & Tech Stack <span style={{ color: 'var(--semantic-red)' }}>*</span>
              </label>

              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <input
                  type="text"
                  placeholder="Type a skill (e.g. React, Docker, Gemini AI) and press Enter or Comma..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  className="form-input"
                  style={{ fontSize: '0.92rem', padding: '0.75rem 1rem', flex: 1 }}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => handleAddSkill()}
                  className="btn btn-secondary"
                  style={{ padding: '0.75rem 1.25rem', fontSize: '0.88rem', whiteSpace: 'nowrap' }}
                  disabled={loading || !skillInput.trim()}
                >
                  <Plus size={16} />
                  Add Skill
                </button>
              </div>

              {/* Selected Skills Chips */}
              {skills.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    marginTop: '0.75rem',
                    padding: '0.85rem',
                    borderRadius: '6px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-default)',
                  }}
                >
                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '4px',
                        background: 'var(--accent-teal-light)',
                        border: '1px solid rgba(15, 107, 92, 0.25)',
                        color: 'var(--accent-teal)',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                      }}
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--accent-teal)',
                          cursor: 'pointer',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                        }}
                        title={`Remove ${skill}`}
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Quick Suggestions Bar */}
              <div style={{ marginTop: '0.65rem' }}>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginRight: '0.5rem' }}>
                  Quick suggestions:
                </span>
                <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.25rem' }}>
                  {POPULAR_SKILLS.map((popSkill) => {
                    const isAdded = skills.some((s) => s.toLowerCase() === popSkill.toLowerCase());
                    return (
                      <button
                        key={popSkill}
                        type="button"
                        onClick={() => handleAddSkill(popSkill)}
                        disabled={isAdded || loading}
                        style={{
                          fontSize: '0.74rem',
                          padding: '0.18rem 0.5rem',
                          borderRadius: '4px',
                          background: isAdded ? 'var(--bg-secondary)' : 'var(--bg-card)',
                          border: '1px solid var(--border-default)',
                          color: isAdded ? 'var(--text-muted)' : 'var(--text-secondary)',
                          cursor: isAdded ? 'default' : 'pointer',
                          transition: 'var(--transition)',
                        }}
                      >
                        {isAdded ? `✓ ${popSkill}` : `+ ${popSkill}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Row 5: Job Description & Responsibilities */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="form-label" style={{ fontSize: '0.92rem', margin: 0 }}>
                  <FileText size={16} color="var(--accent-teal)" />
                  Job Overview & Responsibilities <span style={{ color: 'var(--semantic-red)' }}>*</span>
                </label>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  {description.length} chars
                </span>
              </div>
              <textarea
                ref={descriptionInputRef}
                rows={8}
                placeholder="Describe the company mission, role summary, day-to-day duties, and compensation/benefits package..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-input"
                style={{
                  fontSize: '0.92rem',
                  lineHeight: 1.6,
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  padding: '0.85rem',
                }}
                disabled={loading}
                required
              />
            </div>

            {/* Row 6: Requirements & Qualifications (Analyzed in real-time) */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="form-label" style={{ fontSize: '0.92rem', margin: 0 }}>
                  <CheckCircle2 size={16} color="var(--accent-teal)" />
                  Key Requirements & Qualifications
                </label>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  {requirements.length} chars
                </span>
              </div>
              <textarea
                rows={6}
                placeholder="List technical prerequisites, years of experience, core competencies, and preferred credentials..."
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                className="form-input"
                style={{
                  fontSize: '0.92rem',
                  lineHeight: 1.6,
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  padding: '0.85rem',
                }}
                disabled={loading}
              />
            </div>

            {/* Analyze Now Button Row */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Tip: Auto-analyzes 1.5s after typing stops.
              </span>
              <button
                type="button"
                onClick={handleAnalyzeNow}
                disabled={scoringLoading || (!description.trim() && !requirements.trim())}
                className="btn btn-secondary"
                style={{
                  fontSize: '0.8rem',
                  padding: '0.4rem 0.85rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  borderColor: 'var(--accent-teal)',
                  color: 'var(--accent-teal)',
                }}
                title="Trigger immediate AI quality re-analysis"
              >
                {scoringLoading ? <Loader2 className="spin" size={13} /> : <Wand2 size={13} />}
                <span>Analyze Now</span>
              </button>
            </div>

            {/* Form Actions */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid var(--border-default)',
              }}
            >
              <Link
                to="/dashboard"
                className="btn btn-secondary"
                style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}
              >
                Cancel
              </Link>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {postWarningTooltip && (
                  <span
                    style={{
                      fontSize: '0.78rem',
                      color: scoreData?.overallScore < 50 ? 'var(--semantic-red)' : 'var(--semantic-amber)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                    title={postWarningTooltip}
                  >
                    <AlertCircle size={14} />
                    <span>Quality alert active</span>
                  </span>
                )}

                <button
                  type="submit"
                  disabled={loading || !!successMessage}
                  className="btn btn-primary"
                  title={postWarningTooltip || undefined}
                  style={{
                    padding: '0.75rem 1.85rem',
                    fontSize: '0.95rem',
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="spin" size={18} />
                      <span>Publishing Requisition...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      <span>Publish Job Opening</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column (40%): Live JD Quality Scorer Panel */}
        <div>
          <JDQualityPanel
            scoreData={scoreData}
            loading={scoringLoading}
            onAnalyzeNow={handleAnalyzeNow}
            onPrefill={handlePrefill}
            hasText={Boolean(description.trim() || requirements.trim())}
          />
        </div>
      </div>
    </div>
  );
};

export default PostJob;
