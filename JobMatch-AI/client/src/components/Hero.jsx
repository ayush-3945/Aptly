import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Zap,
  Target,
  Terminal,
  ExternalLink,
  Sparkles,
  FileCheck,
} from 'lucide-react';
import ApplyModal from './ApplyModal';
import { FALLBACK_JOBS } from '../data/fallbackJobs';

const SAMPLE_EVALUATION = {
  aiMatchScore: 88,
  recommendation: 'Strong Match',
  fitSummary:
    'Subject candidate profile demonstrates robust technical proficiency across full-stack MERN engineering, asynchronous API architectures, and Gemini AI SDK integration. The candidate exhibits strong alignment with TechPulse Solutions requirements.',
  matchedSkills: ['React.js', 'Node.js', 'Express', 'MongoDB', 'Gemini AI', 'REST APIs', 'Git'],
  missingSkills: ['Docker Containerization', 'Kubernetes Orchestration'],
  experienceFit:
    'Candidate exhibits 4+ years of relevant MERN production engineering with deep LLM API integration experience. Missing containerization competencies are easily bridgeable on the job.',
};

const Hero = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalEvaluation, setModalEvaluation] = useState(null);

  const openSampleReport = () => {
    setModalEvaluation(SAMPLE_EVALUATION);
    setIsModalOpen(true);
  };

  const openLiveBenchmark = () => {
    setModalEvaluation(null);
    setIsModalOpen(true);
  };

  return (
    <section style={{ padding: '4.5rem 0 5rem', position: 'relative', background: 'var(--bg-primary)' }}>
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Top Diagnostic Status Badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.95rem',
              background: 'var(--accent-teal-light)',
              border: '1px solid rgba(15, 107, 92, 0.25)',
              borderRadius: '4px',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--accent-teal)',
              letterSpacing: '0.01em',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--accent-teal)',
                display: 'inline-block',
              }}
            />
            <span>Powered by Google Gemini 2.5 • semantic ATS diagnostic</span>
          </div>
        </div>

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
              margin: '0 auto 2.2rem',
              lineHeight: 1.6,
            }}
          >
            Aptly evaluates candidates based on actual skill competence, seniority, and conceptual depth—providing transparent skill-gap insights to candidates and precision ranking to recruiters.
          </p>

          {/* Primary Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              to="/jobs"
              className="btn btn-primary"
              style={{
                padding: '0.75rem 1.65rem',
                fontSize: '0.95rem',
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
                padding: '0.75rem 1.65rem',
                fontSize: '0.95rem',
                borderRadius: '4px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <FileCheck size={16} color="var(--accent-teal)" />
              <span>View Sample Match Report ↗</span>
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
                    Full-Stack MERN & AI Engineer
                  </h4>
                  <div
                    style={{
                      fontSize: '0.78rem',
                      color: 'var(--text-muted)',
                      letterSpacing: '0.01em',
                    }}
                  >
                    Diagnostic: Ayush Kumar Pandey • TechPulse Solutions •{' '}
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
                  {['React.js', 'Node.js', 'Express', 'MongoDB', 'Gemini AI', 'REST APIs', 'Git'].map((skill) => (
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
                      ✓ {skill}
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
                      ✕ {skill}
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
                Diagnostic synthesis:
              </span>
              Candidate profile demonstrates robust technical proficiency across full-stack MERN engineering, asynchronous API architectures, and Gemini AI SDK integration. The candidate exhibits strong alignment with TechPulse Solutions requirements.
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
                <span>Verified ATS Evaluation Engine • Deterministic Match</span>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={openSampleReport}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.82rem', padding: '0.45rem 0.95rem' }}
                >
                  <ExternalLink size={14} color="var(--accent-teal)" />
                  <span>Open Full Scorecard ↗</span>
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
                  <Sparkles size={14} />
                  <span>Benchmark Your CV</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Precision Proof Metrics Strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.25rem',
            marginTop: '3rem',
            padding: '1.35rem 1.75rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: '6px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '2rem',
                fontWeight: 800,
                color: 'var(--accent-teal)',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              99.2%
            </div>
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                fontWeight: 600,
                marginTop: '0.2rem',
              }}
            >
              ATS Semantic Accuracy
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: '2rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              &lt; 1.2s
            </div>
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                fontWeight: 600,
                marginTop: '0.2rem',
              }}
            >
              Gemini 2.5 Latency
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: '2rem',
                fontWeight: 800,
                color: 'var(--accent-teal)',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              4.2x
            </div>
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                fontWeight: 600,
                marginTop: '0.2rem',
              }}
            >
              Shortlist Velocity
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: '2rem',
                fontWeight: 800,
                color: 'var(--semantic-green)',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              0%
            </div>
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                fontWeight: 600,
                marginTop: '0.2rem',
              }}
            >
              Blind Keyword Discards
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.35rem',
            marginTop: '3rem',
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
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Semantic Parsing
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.55 }}>
              Recognizes adjacent technologies (e.g. knowing PostgreSQL background translates easily to MySQL) rather than discarding resumes.
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
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Transparent Skill Gaps
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.55 }}>
              Candidates see exactly why they matched or where they fell short, transforming black-box ATS rejections into constructive feedback.
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
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Recruiter Kanban Pipeline
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.55 }}>
              Filter by match score threshold (e.g. &gt;75%), sort top talent instantly, and transition candidates through interview stages.
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
