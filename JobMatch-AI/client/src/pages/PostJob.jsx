import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import api from '../services/api';

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

const SAMPLE_JOB = {
  title: 'Senior Full-Stack MERN & Gemini AI Engineer',
  company: 'CloudPulse AI Systems',
  workplaceType: 'Remote',
  location: 'Remote (US/Global)',
  skills: ['React', 'Node.js', 'Express', 'MongoDB', 'Gemini AI', 'Docker', 'REST API'],
  description: `About the Role:
CloudPulse AI Systems is building next-generation intelligent HR and hiring platforms. We are seeking a Senior Full-Stack MERN & Gemini AI Engineer to lead the architecture and implementation of our high-volume candidate evaluation pipeline and AI matching services.

Key Responsibilities:
• Design and build scalable Node.js microservices and RESTful APIs connecting to MongoDB clusters.
• Integrate Google Gemini foundation models (Gemini 2.5 Flash) for automated resume analysis, skill gap detection, and ATS compatibility scoring.
• Develop reactive, high-performance user interfaces using React 19, modern CSS Glassmorphism, and Vite.
• Architect background job processing and secure multipart PDF parsing pipelines using Multer and pdf-parse.
• Partner with product and engineering leaders to uphold 99.9% uptime, write automated tests, and optimize database aggregations.

Requirements & Qualifications:
• 4+ years of production experience building and deploying full-stack web applications in the MERN stack.
• Proven hands-on experience integrating LLM APIs (Gemini, Claude, or OpenAI) with structured JSON outputs.
• Deep understanding of MongoDB schema design, indexing, and aggregation pipelines.
• Familiarity with containerization (Docker) and cloud deployments (AWS, Vercel, Render).
• Excellent communication skills and a passion for engineering high-velocity AI products.`,
};

const PostJob = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [workplaceType, setWorkplaceType] = useState('Remote');
  const [location, setLocation] = useState('Remote');
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 1-Click Pre-fill Sample Job
  const handlePrefill = () => {
    setTitle(SAMPLE_JOB.title);
    setCompany(SAMPLE_JOB.company);
    setWorkplaceType(SAMPLE_JOB.workplaceType);
    setLocation(SAMPLE_JOB.location);
    setSkills(SAMPLE_JOB.skills);
    setDescription(SAMPLE_JOB.description);
    setError('');
  };

  // Skill Input Handler
  const handleAddSkill = (skillToAdd) => {
    const trimmed = (skillToAdd || skillInput).trim();
    if (!trimmed) return;

    // Check if duplicate
    const exists = skills.some((s) => s.toLowerCase() === trimmed.toLowerCase());
    if (!exists) {
      setSkills([...skills, trimmed]);
    }
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

  // Submit Job Creation
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!title.trim()) {
      setError('Please provide a job title.');
      return;
    }
    if (!company.trim()) {
      setError('Please provide the hiring company name.');
      return;
    }
    if (!location.trim()) {
      setError('Please provide the job location or select Remote.');
      return;
    }
    if (skills.length === 0) {
      setError('Please add at least one required technical skill.');
      return;
    }
    if (!description.trim() || description.trim().length < 40) {
      setError('Please provide a comprehensive job description (minimum 40 characters).');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: title.trim(),
        company: company.trim(),
        location: location.trim(),
        requiredSkills: skills,
        description: description.trim(),
      };

      await api.post('/jobs', payload);

      setSuccessMessage(`Job requisition "${title}" was published successfully!`);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Job creation error:', err);
      const msg = err.response?.data?.message || 'Failed to publish job requisition. Please try again.';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem', minHeight: '85vh', maxWidth: '900px' }}>
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
          <span>Back to Recruiter Dashboard</span>
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
            gap: '1.25rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
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
                  background: 'rgba(138, 43, 226, 0.2)',
                  color: '#C084FC',
                  border: '1px solid rgba(138, 43, 226, 0.35)',
                }}
              >
                🏢 ATS Requisition Studio
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Powered by Gemini AI Semantic Engine
              </span>
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.4rem' }}>
              Create New Job Opening
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '600px', lineHeight: 1.5 }}>
              Specify role qualifications, required skills, and responsibilities. Once posted, our automated Gemini AI parser immediately scores incoming applicant resumes.
            </p>
          </div>

          {/* Pre-fill Sample Button */}
          <button
            type="button"
            onClick={handlePrefill}
            className="btn btn-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.15rem',
              fontSize: '0.88rem',
              background: 'rgba(99, 102, 241, 0.15)',
              borderColor: 'rgba(99, 102, 241, 0.35)',
              color: '#A5B4FC',
            }}
            title="Populate form with a complete AI engineer job requisition"
          >
            <Wand2 size={16} color="#818CF8" />
            <span>Pre-fill Sample Job</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1.25rem 1.5rem',
            borderRadius: '14px',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            color: '#A7F3D0',
            marginBottom: '2rem',
            animation: 'fadeIn 0.3s ease-out',
          }}
        >
          <CheckCircle2 size={22} color="#10B981" />
          <div>
            <strong style={{ display: 'block', fontSize: '1rem', color: '#10B981' }}>
              Requisition Published!
            </strong>
            <span style={{ fontSize: '0.88rem' }}>{successMessage} Redirecting to your dashboard...</span>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem 1.25rem',
            borderRadius: '12px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#FCA5A5',
            marginBottom: '1.75rem',
            animation: 'fadeIn 0.3s ease-out',
          }}
        >
          <AlertCircle size={20} color="#EF4444" />
          <span style={{ fontSize: '0.9rem' }}>{error}</span>
        </div>
      )}

      {/* Job Creation Form */}
      <form onSubmit={handleSubmit} className="card-glass" style={{ padding: '2.5rem', borderRadius: '20px' }}>
        {/* Row 1: Job Title */}
        <div className="form-group" style={{ marginBottom: '1.75rem' }}>
          <label className="form-label" style={{ fontSize: '0.92rem', marginBottom: '0.4rem' }}>
            <Briefcase size={16} color="var(--accent-indigo)" />
            Job Title <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Senior Backend Systems & Distributed AI Engineer"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="form-input"
            style={{ fontSize: '1rem', padding: '0.85rem 1.1rem' }}
            disabled={loading}
            required
          />
        </div>

        {/* Row 2: Company & Workplace Type */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginBottom: '1.75rem',
          }}
        >
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.92rem', marginBottom: '0.4rem' }}>
              <Building2 size={16} color="var(--accent-indigo)" />
              Hiring Company / Organization <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. TechPulse Solutions"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="form-input"
              style={{ fontSize: '0.95rem', padding: '0.8rem 1.1rem' }}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.92rem', marginBottom: '0.4rem' }}>
              <Globe size={16} color="var(--accent-cyan)" />
              Workplace Arrangement
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {WORKPLACE_TYPES.map((type) => {
                const isSelected = workplaceType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleSelectWorkplace(type)}
                    style={{
                      flex: 1,
                      padding: '0.75rem 0.5rem',
                      borderRadius: '10px',
                      fontSize: '0.86rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'var(--transition)',
                      border: isSelected
                        ? '1px solid var(--accent-indigo)'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                      background: isSelected
                        ? 'rgba(99, 102, 241, 0.25)'
                        : 'rgba(255, 255, 255, 0.03)',
                      color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                    }}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Row 3: Location */}
        <div className="form-group" style={{ marginBottom: '1.75rem' }}>
          <label className="form-label" style={{ fontSize: '0.92rem', marginBottom: '0.4rem' }}>
            <MapPin size={16} color="var(--accent-cyan)" />
            Location Details <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Remote (US/Global), San Francisco, CA (Hybrid), or New York, NY"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="form-input"
            style={{ fontSize: '0.95rem', padding: '0.8rem 1.1rem' }}
            disabled={loading}
            required
          />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Specify cities, timezone preferences, or write "Remote".
          </span>
        </div>

        {/* Row 4: Dynamic Required Skills Tagging */}
        <div className="form-group" style={{ marginBottom: '1.75rem' }}>
          <label className="form-label" style={{ fontSize: '0.92rem', marginBottom: '0.4rem' }}>
            <Layers size={16} color="#F59E0B" />
            Required Skills & Tech Stack <span style={{ color: '#EF4444' }}>*</span>
          </label>

          {/* Skills Input Bar */}
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
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
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
                    borderRadius: '8px',
                    background: 'rgba(99, 102, 241, 0.2)',
                    border: '1px solid rgba(99, 102, 241, 0.4)',
                    color: '#E0E7FF',
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
                      color: 'rgba(255, 255, 255, 0.6)',
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
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginRight: '0.5rem' }}>
              Quick suggestions:
            </span>
            <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.35rem' }}>
              {POPULAR_SKILLS.map((popSkill) => {
                const isAdded = skills.some((s) => s.toLowerCase() === popSkill.toLowerCase());
                return (
                  <button
                    key={popSkill}
                    type="button"
                    onClick={() => handleAddSkill(popSkill)}
                    disabled={isAdded || loading}
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '6px',
                      background: isAdded ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
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

        {/* Row 5: Comprehensive Job Description */}
        <div className="form-group" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="form-label" style={{ fontSize: '0.92rem', marginBottom: '0.4rem' }}>
              <FileText size={16} color="var(--accent-indigo)" />
              Job Description & Responsibilities <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {description.length} characters
            </span>
          </div>
          <textarea
            rows={10}
            placeholder="Describe the company overview, day-to-day responsibilities, technical expectations, and qualifications. The Gemini AI engine will parse this to score applicant resumes."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-input"
            style={{
              fontSize: '0.92rem',
              lineHeight: 1.6,
              resize: 'vertical',
              fontFamily: 'inherit',
              padding: '1rem',
            }}
            disabled={loading}
            required
          />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Tip: Clearly listing key responsibilities and qualifications helps Gemini AI calculate high-fidelity candidate match scores.
          </span>
        </div>

        {/* Form Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '1rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <Link
            to="/dashboard"
            className="btn btn-secondary"
            style={{ padding: '0.75rem 1.5rem', fontSize: '0.92rem' }}
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={loading || !!successMessage}
            className="btn btn-primary"
            style={{
              padding: '0.75rem 1.85rem',
              fontSize: '0.95rem',
              boxShadow: '0 4px 18px rgba(138, 43, 226, 0.4)',
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
      </form>
    </div>
  );
};

export default PostJob;
