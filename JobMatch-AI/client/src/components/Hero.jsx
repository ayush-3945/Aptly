import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Zap,
  Target,
  Terminal,
  ExternalLink,
  FileCheck,
  GitBranch,
  UserCheck,
  Briefcase,
  Sparkles,
} from 'lucide-react';
import ApplyModal from './ApplyModal';
import { FALLBACK_JOBS } from '../data/fallbackJobs';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const SAMPLE_EVALUATION = {
  aiMatchScore: 88,
  recommendation: 'Strong Match',
  fitSummary:
    'Subject candidate profile demonstrates robust technical proficiency across full-stack MERN engineering, asynchronous API architectures, and REST services. The candidate exhibits strong alignment with Razorpay requirements.',
  matchedSkills: ['React.js', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'REST APIs', 'Git'],
  missingSkills: ['Docker Containerization', 'Kubernetes Orchestration'],
  experienceFit:
    'Candidate exhibits 4+ years of relevant MERN production engineering with deep API integration experience. Missing containerization competencies are easily bridgeable on the job.',
};

const Hero = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalEvaluation, setModalEvaluation] = useState(null);
  const [demoLoading, setDemoLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const openSampleReport = () => {
    setModalEvaluation(SAMPLE_EVALUATION);
    setIsModalOpen(true);
  };

  const openLiveBenchmark = () => {
    setModalEvaluation(null);
    setIsModalOpen(true);
  };

  const handle1ClickDemo = async (role) => {
    setDemoLoading(true);
    try {
      const email = role === 'recruiter' ? 'recruiter@aptly.ai' : 'candidate@aptly.ai';
      const res = await login(email, 'password123');
      showToast(`Signed in as demo ${role} (${res.name})!`, 'success');
      navigate(role === 'recruiter' ? '/dashboard' : '/jobs');
    } catch (err) {
      console.error('Demo login error:', err);
      showToast('Redirecting to login...', 'info');
      navigate('/login');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <section style={{ padding: '4.5rem 0 5rem', position: 'relative', background: 'var(--bg-primary)' }}>
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Hero Title & Subtitle */}
        <div style={{ textAlign: 'center', maxWidth: '880px', margin: '0 auto 3rem' }}>
          <h1
            style={{
              fontFamily: "'Newsreader', 'Charter', Georgia, serif",
              fontSize: 'clamp(2.5rem, 5.5vw, 4.2rem)',
              lineHeight: 1.12,
              marginBottom: '1.35rem',
              letterSpacing: '-0.025em',
              color: 'var(--text-primary)',
            }}
          >
            Stop Losing Top Talent to <br />
            <span style={{ color: 'var(--accent-teal)', fontWeight: 700 }}>Blind ATS Keyword Filters</span>
          </h1>
          <p
            style={{
              fontSize: 'clamp(1.05rem, 2vw, 1.22rem)',
              color: 'var(--text-secondary)',
              maxWidth: '700px',
              margin: '0 auto 1.5rem',
              lineHeight: 1.6,
            }}
          >
            Aptly evaluates candidates based on actual skill competence, seniority, and conceptual depth—providing transparent skill-gap insights to candidates and precision ranking to recruiters.
          </p>

          {/* Built with Strip */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.35rem 0.95rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              color: 'var(--text-secondary)',
              marginBottom: '2rem',
              boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
            }}
          >
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Built with:</span>
            <span>React 19</span>
            <span style={{ opacity: 0.4 }}>•</span>
            <span>Node.js / Express</span>
            <span style={{ opacity: 0.4 }}>•</span>
            <span>MongoDB</span>
            <span style={{ opacity: 0.4 }}>•</span>
            <span style={{ color: 'var(--accent-teal)', fontWeight: 600 }}>Google Gemini</span>
          </div>

          {/* Primary Action Buttons & Links */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            <Link
              to="/jobs"
              className="btn btn-primary"
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '0.92rem',
                borderRadius: '4px',
                fontWeight: 600,
              }}
            >
              <span>Explore Open Roles</span>
              <ArrowRight size={16} />
            </Link>
            <button
              type="button"
              onClick={openSampleReport}
              className="btn btn-secondary"
              style={{
                padding: '0.75rem 1.4rem',
                fontSize: '0.92rem',
                borderRadius: '4px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <FileCheck size={16} color="var(--accent-teal)" />
              <span>Sample Match Report</span>
            </button>
            <a
              href="https://github.com/ayush-3945/Aptly"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{
                padding: '0.75rem 1.25rem',
                fontSize: '0.92rem',
                borderRadius: '4px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
              }}
            >
              <GitBranch size={16} />
              <span>GitHub</span>
            </a>
            <a
              href="https://aptly-zeta.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{
                padding: '0.75rem 1.25rem',
                fontSize: '0.92rem',
                borderRadius: '4px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
              }}
            >
              <ExternalLink size={16} color="var(--accent-teal)" />
              <span>Live Demo</span>
            </a>
          </div>

          {/* 1-Click Fast Demo Login for Reviewers & Interviewers */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.45rem 0.95rem',
              background: 'rgba(15, 107, 92, 0.06)',
              border: '1px dashed var(--accent-teal)',
              borderRadius: '6px',
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontWeight: 600, color: 'var(--accent-teal)' }}>⚡ 1-Click Test Accounts:</span>
            <button
              type="button"
              disabled={demoLoading}
              onClick={() => handle1ClickDemo('recruiter')}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                borderRadius: '4px',
                padding: '0.25rem 0.65rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <Briefcase size={13} color="var(--accent-teal)" />
              <span>Try Demo as Recruiter</span>
            </button>
            <button
              type="button"
              disabled={demoLoading}
              onClick={() => handle1ClickDemo('candidate')}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                borderRadius: '4px',
                padding: '0.25rem 0.65rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <UserCheck size={13} color="var(--semantic-green)" />
              <span>Try Demo as Candidate</span>
            </button>
          </div>
        </div>

        {/* Interactive Live ATS Evaluation Card Preview */}
        <div id="preview" style={{ maxWidth: '940px', margin: '0 auto' }}>
          <div
            className="paper-card"
            style={{
              padding: '1.75rem',
              border: '1px solid var(--border-default)',
              borderRadius: '6px',
              background: 'var(--bg-card)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
            }}
          >
            {/* Header of preview card */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                borderBottom: '1px solid var(--border-default)',
                paddingBottom: '1.15rem',
                marginBottom: '1.35rem',
              }}
            >
              <div
                onClick={openSampleReport}
                style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}
                title="Click to open interactive evaluation scorecard"
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '4px',
                    background: 'var(--accent-teal-light)',
                    border: '1px solid rgba(15, 107, 92, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Terminal size={18} color="var(--accent-teal)" />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '0.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Full-Stack MERN Systems Engineer
                  </h4>
                  <div
                    style={{
                      fontSize: '0.78rem',
                      color: 'var(--text-muted)',
                      letterSpacing: '0.01em',
                    }}
                  >
                    Evaluation: Ayush Kumar Pandey • Razorpay •{' '}
                    <span style={{ color: 'var(--accent-teal)', fontWeight: 600 }}>Click to inspect</span>
                  </div>
                </div>
              </div>

              <div
                onClick={openSampleReport}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
                title="Click to inspect detailed match breakdown"
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.3rem 0.75rem',
                    borderRadius: '4px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    background: 'rgba(45, 122, 58, 0.1)',
                    color: 'var(--semantic-green)',
                    border: '1px solid rgba(45, 122, 58, 0.25)',
                  }}
                >
                  <CheckCircle2 size={13} />
                  Strong Match
                </span>
                <div
                  style={{
                    padding: '0.3rem 0.75rem',
                    background: 'var(--accent-teal-light)',
                    border: '1px solid rgba(15, 107, 92, 0.25)',
                    borderRadius: '4px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    color: 'var(--accent-teal)',
                  }}
                >
                  88% Fit
                </div>
              </div>
            </div>

            {/* Grid of details inside card */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.35rem',
                marginBottom: '1.35rem',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '0.74rem',
                    color: 'var(--text-muted)',
                    fontWeight: 700,
                    letterSpacing: '0.01em',
                  }}
                >
                  Matched core competencies
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginTop: '0.6rem' }}>
                  {['React.js', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'REST APIs', 'Git'].map((skill) => (
                    <span
                      key={skill}
                      style={{
                        fontSize: '0.76rem',
                        padding: '0.2rem 0.6rem',
                        background: 'var(--accent-teal-light)',
                        border: '1px solid rgba(15, 107, 92, 0.2)',
                        borderRadius: '3px',
                        color: 'var(--accent-teal)',
                        fontWeight: 500,
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span
                  style={{
                    fontSize: '0.74rem',
                    color: 'var(--text-muted)',
                    fontWeight: 700,
                    letterSpacing: '0.01em',
                  }}
                >
                  Identified skill gaps
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginTop: '0.6rem' }}>
                  {['Docker Containerization', 'Kubernetes Orchestration'].map((skill) => (
                    <span
                      key={skill}
                      style={{
                        fontSize: '0.76rem',
                        padding: '0.2rem 0.6rem',
                        background: 'rgba(185, 28, 28, 0.08)',
                        border: '1px solid rgba(185, 28, 28, 0.22)',
                        borderRadius: '3px',
                        color: 'var(--semantic-red)',
                        fontWeight: 500,
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Recruiter Executive Summary in Clean Quotebox */}
            <div
              style={{
                background: 'var(--bg-primary)',
                borderRadius: '4px',
                padding: '0.9rem 1.15rem',
                borderLeft: '3px solid var(--accent-teal)',
                borderTop: '1px solid var(--border-default)',
                borderRight: '1px solid var(--border-default)',
                borderBottom: '1px solid var(--border-default)',
                fontSize: '0.88rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.55,
              }}
            >
              <span
                style={{
                  color: 'var(--accent-teal)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'block',
                  marginBottom: '0.3rem',
                }}
              >
                Evaluation synthesis:
              </span>
              Candidate profile demonstrates robust technical proficiency across full-stack MERN engineering, asynchronous API architectures, and REST services. The candidate exhibits strong alignment with Razorpay requirements.
            </div>

            {/* Interactive Card Action Bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                marginTop: '1.35rem',
                paddingTop: '1.15rem',
                borderTop: '1px solid var(--border-default)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                }}
              >
                <ShieldCheck size={15} color="var(--accent-teal)" />
                <span>Verified ATS Evaluation Engine • Graceful fallback when AI is unavailable</span>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={openSampleReport}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.82rem', padding: '0.45rem 0.95rem' }}
                >
                  <ExternalLink size={14} color="var(--accent-teal)" />
                  <span>Open Full Scorecard</span>
                </button>
                <button
                  type="button"
                  onClick={openLiveBenchmark}
                  className="btn btn-primary"
                  style={{
                    fontSize: '0.82rem',
                    padding: '0.45rem 1.05rem',
                    fontWeight: 600,
                  }}
                >
                  <ArrowRight size={14} />
                  <span>Benchmark Your CV</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Proof Metrics Strip with Illustrative Demo Values Label */}
        <div
          style={{
            marginTop: '3.5rem',
            padding: '1.5rem 1.75rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: '6px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--border-default)',
              paddingBottom: '0.75rem',
              marginBottom: '1.25rem',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              ATS Pipeline Architecture & Verification
            </span>
            <span
              style={{
                fontSize: '0.7rem',
                padding: '0.2rem 0.6rem',
                background: 'var(--accent-teal-light)',
                color: 'var(--accent-teal)',
                borderRadius: '12px',
                fontWeight: 600,
                letterSpacing: '0.02em',
              }}
            >
              Illustrative Demo Values
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: '1.5rem',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '1.85rem',
                  fontWeight: 800,
                  color: 'var(--accent-teal)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                }}
              >
                4 Dimensions
              </div>
              <div
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  marginTop: '0.25rem',
                }}
              >
                Skills (40%), Experience (30%), Domain (20%), Education (10%)
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: '1.85rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                }}
              >
                Gemini 2.5
              </div>
              <div
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  marginTop: '0.25rem',
                }}
              >
                JSON Schema Enforced Extraction
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: '1.85rem',
                  fontWeight: 800,
                  color: 'var(--accent-teal)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                }}
              >
                Graceful
              </div>
              <div
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  marginTop: '0.25rem',
                }}
              >
                Fallback When AI Is Unavailable
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: '1.85rem',
                  fontWeight: 800,
                  color: 'var(--semantic-green)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                }}
              >
                100% Pass
              </div>
              <div
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  marginTop: '0.25rem',
                }}
              >
                Automated Verification Suite
              </div>
            </div>
          </div>
        </div>

        {/* 3-Step "How It Works" Section */}
        <div style={{ marginTop: '4rem', textAlign: 'center' }}>
          <div
            style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--accent-teal)',
              marginBottom: '0.4rem',
            }}
          >
            Evaluation Pipeline
          </div>
          <h2
            style={{
              fontFamily: "'Newsreader', 'Charter', Georgia, serif",
              fontSize: 'clamp(1.75rem, 3.2vw, 2.3rem)',
              color: 'var(--text-primary)',
              marginBottom: '2rem',
              letterSpacing: '-0.02em',
            }}
          >
            How Aptly.AI Works
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.35rem',
              textAlign: 'left',
            }}
          >
            {/* Step 1 */}
            <div
              className="paper-card"
              style={{
                padding: '1.6rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                borderRadius: '6px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '4px',
                    background: 'var(--accent-teal-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FileCheck size={18} color="var(--accent-teal)" />
                </div>
                <span
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                    color: 'var(--accent-teal)',
                    opacity: 0.5,
                  }}
                >
                  01
                </span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                1. Upload & Secure Parse
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: 1.55, margin: 0 }}>
                Upload your PDF resume. Server extracts machine text via <code style={{ fontSize: '0.78rem' }}>pdf-parse</code> with strict MIME type validation and zero path traversal vulnerability.
              </p>
            </div>

            {/* Step 2 */}
            <div
              className="paper-card"
              style={{
                padding: '1.6rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                borderRadius: '6px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '4px',
                    background: 'rgba(45, 122, 58, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Sparkles size={18} color="var(--semantic-green)" />
                </div>
                <span
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                    color: 'var(--semantic-green)',
                    opacity: 0.5,
                  }}
                >
                  02
                </span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                2. AI Semantic Evaluation
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: 1.55, margin: 0 }}>
                Google Gemini evaluates 4 sub-scores (skills, experience, domain, education). Protected by a graceful heuristic fallback when AI is unavailable.
              </p>
            </div>

            {/* Step 3 */}
            <div
              className="paper-card"
              style={{
                padding: '1.6rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                borderRadius: '6px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '4px',
                    background: 'var(--accent-teal-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Target size={18} color="var(--accent-teal)" />
                </div>
                <span
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                    color: 'var(--accent-teal)',
                    opacity: 0.5,
                  }}
                >
                  03
                </span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                3. Scorecard & Kanban Ranking
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: 1.55, margin: 0 }}>
                Recruiters manage ranked candidate pipelines with optimistic UI updates; applicants receive actionable feedback and skill gap roadmaps.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid - Concise One-Liners */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.35rem',
            marginTop: '3.5rem',
          }}
        >
          <div
            className="paper-card"
            style={{
              padding: '1.5rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: '6px',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '4px',
                background: 'var(--accent-teal-light)',
                border: '1px solid rgba(15, 107, 92, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.9rem',
              }}
            >
              <Zap size={18} color="var(--accent-teal)" />
            </div>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '0.35rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Semantic Parsing
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: 1.55, margin: 0 }}>
              Extracts technical competencies and adjacent skills without blind keyword rejections.
            </p>
          </div>

          <div
            className="paper-card"
            style={{
              padding: '1.5rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: '6px',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '4px',
                background: 'rgba(45, 122, 58, 0.1)',
                border: '1px solid rgba(45, 122, 58, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.9rem',
              }}
            >
              <Target size={18} color="var(--semantic-green)" />
            </div>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '0.35rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Actionable Skill Gaps
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: 1.55, margin: 0 }}>
              Shows candidates exact skill alignment and personalized learning roadmaps.
            </p>
          </div>

          <div
            className="paper-card"
            style={{
              padding: '1.5rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: '6px',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '4px',
                background: 'var(--accent-teal-light)',
                border: '1px solid rgba(15, 107, 92, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.9rem',
              }}
            >
              <ShieldCheck size={18} color="var(--accent-teal)" />
            </div>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '0.35rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Recruiter Kanban Pipeline
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: 1.55, margin: 0 }}>
              Filter by match score threshold and transition applicants through hiring stages.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Diagnostic Modal */}
      <ApplyModal
        job={FALLBACK_JOBS[0]}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialEvaluation={modalEvaluation}
      />
    </section>
  );
};

export default Hero;
