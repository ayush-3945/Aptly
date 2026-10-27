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
  UserCheck,
  Briefcase,
  Sparkles,
  Loader2,
} from 'lucide-react';
import ApplyModal from './ApplyModal';
import { FALLBACK_JOBS } from '../data/fallbackJobs';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const SAMPLE_EVALUATION = {
  aiMatchScore: 88,
  recommendation: 'Strong Match',
  fitSummary:
    'Subject candidate profile demonstrates robust technical proficiency across full-stack MERN engineering, asynchronous API architectures, and REST services. The candidate exhibits strong alignment with target role requirements.',
  matchedSkills: ['React.js', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'REST APIs', 'Git'],
  missingSkills: ['Docker Containerization', 'Kubernetes Orchestration'],
  experienceFit:
    'Candidate exhibits 4+ years of relevant MERN production engineering with deep API integration experience. Missing containerization competencies are easily bridgeable on the job.',
};

const Hero = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalEvaluation, setModalEvaluation] = useState(null);
  const [demoRoleLoading, setDemoRoleLoading] = useState(null); // 'recruiter' | 'candidate' | null
  const [wakeUpNotice, setWakeUpNotice] = useState(false);

  const navigate = useNavigate();
  const { user, isAuthenticated, login } = useAuth();
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
    setDemoRoleLoading(role);
    setWakeUpNotice(false);

    // After 2.5s of waiting, show friendly server wake-up notice
    const noticeTimer = setTimeout(() => {
      setWakeUpNotice(true);
    }, 2500);

    // 60-second timeout guard
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT')), 60000)
    );

    try {
      const email = role === 'recruiter' ? 'recruiter@aptly.ai' : 'candidate@aptly.ai';
      const loginPromise = login(email, 'password123');
      const res = await Promise.race([loginPromise, timeoutPromise]);
      clearTimeout(noticeTimer);
      showToast(`Signed in as demo ${role} (${res.name})!`, 'success');
      navigate(role === 'recruiter' ? '/dashboard' : '/dashboard');
    } catch (err) {
      clearTimeout(noticeTimer);
      console.error('Demo login error:', err);
      if (err.message === 'TIMEOUT') {
        showToast('Server is taking longer than expected to wake up. Please retry in a few seconds.', 'warning');
      } else {
        showToast('Server is waking up or temporarily busy. Please retry in a moment, or visit /login.', 'error');
      }
    } finally {
      setDemoRoleLoading(null);
      setWakeUpNotice(false);
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

          {/* Hero Action Buttons: Only 2 Buttons (or 1 "Go to Dashboard" if logged in) */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {isAuthenticated && user ? (
              <Link
                to="/dashboard"
                className="btn btn-primary"
                style={{
                  padding: '0.8rem 1.85rem',
                  fontSize: '0.98rem',
                  borderRadius: '4px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span>Go to Dashboard</span>
                <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <button
                  type="button"
                  disabled={Boolean(demoRoleLoading)}
                  onClick={() => handle1ClickDemo('recruiter')}
                  className="btn btn-primary"
                  style={{
                    padding: '0.8rem 1.65rem',
                    fontSize: '0.95rem',
                    borderRadius: '4px',
                    fontWeight: 600,
                    cursor: demoRoleLoading ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  {demoRoleLoading === 'recruiter' ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <Briefcase size={16} />
                      <span>Try Demo as Recruiter</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={Boolean(demoRoleLoading)}
                  onClick={() => handle1ClickDemo('candidate')}
                  className="btn btn-secondary"
                  style={{
                    padding: '0.8rem 1.65rem',
                    fontSize: '0.95rem',
                    borderRadius: '4px',
                    fontWeight: 600,
                    cursor: demoRoleLoading ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  {demoRoleLoading === 'candidate' ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <UserCheck size={16} color="var(--accent-teal)" />
                      <span>Try Demo as Candidate</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>

          {/* Cold-start friendly notice while server wakes up */}
          {demoRoleLoading && wakeUpNotice && (
            <div
              style={{
                marginTop: '1rem',
                fontSize: '0.84rem',
                color: 'var(--accent-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontWeight: 500,
              }}
            >
              <Loader2 size={15} className="animate-spin" />
              <span>Waking up server... this can take up to a minute</span>
            </div>
          )}
        </div>

        {/* Interactive Sample ATS Evaluation Card Preview */}
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <h4 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>
                      Full-Stack MERN Systems Engineer
                    </h4>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        padding: '0.12rem 0.5rem',
                        background: 'rgba(15, 107, 92, 0.08)',
                        color: 'var(--accent-teal)',
                        borderRadius: '3px',
                        fontWeight: 700,
                        letterSpacing: '0.03em',
                        textTransform: 'uppercase',
                      }}
                    >
                      Sample evaluation
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: '0.78rem',
                      color: 'var(--text-muted)',
                      letterSpacing: '0.01em',
                    }}
                  >
                    Sample candidate • Sample company •{' '}
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

            {/* Sub-Score Breakdown: Real 40/30/20/10 Formula Math */}
            <div
              style={{
                marginBottom: '1.35rem',
                padding: '0.95rem 1.15rem',
                background: 'var(--bg-primary)',
                borderRadius: '4px',
                border: '1px solid var(--border-default)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.75rem',
                  flexWrap: 'wrap',
                  gap: '0.4rem',
                }}
              >
                <span
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  How the score is built
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-teal)', fontWeight: 600 }}>
                  90×0.4 + 85×0.3 + 90×0.2 + 80×0.1 = 88%
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '0.85rem',
                }}
              >
                {/* Skills 40% */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Skills (40%)</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>90%</span>
                  </div>
                  <div style={{ height: '4px', background: 'var(--border-default)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: '90%', height: '100%', background: 'var(--accent-teal)', borderRadius: '2px' }} />
                  </div>
                </div>

                {/* Experience 30% */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Experience (30%)</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>85%</span>
                  </div>
                  <div style={{ height: '4px', background: 'var(--border-default)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: '85%', height: '100%', background: 'var(--accent-teal)', borderRadius: '2px' }} />
                  </div>
                </div>

                {/* Domain 20% */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Domain (20%)</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>90%</span>
                  </div>
                  <div style={{ height: '4px', background: 'var(--border-default)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: '90%', height: '100%', background: 'var(--accent-teal)', borderRadius: '2px' }} />
                  </div>
                </div>

                {/* Education 10% */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Education (10%)</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>80%</span>
                  </div>
                  <div style={{ height: '4px', background: 'var(--border-default)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: '80%', height: '100%', background: 'var(--accent-teal)', borderRadius: '2px' }} />
                  </div>
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
              Subject candidate profile demonstrates robust technical proficiency across full-stack MERN engineering, asynchronous API architectures, and REST services. The candidate exhibits strong alignment with target role requirements.
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
                <span>AI Evaluation Engine • Graceful fallback when AI is unavailable</span>
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
