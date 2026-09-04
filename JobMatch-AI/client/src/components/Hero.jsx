import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, FileText, CheckCircle2, TrendingUp, ShieldCheck, ArrowRight, Zap, Target } from 'lucide-react';

const Hero = () => {
  return (
    <section style={{ padding: '4.5rem 0 5rem', position: 'relative' }}>
      <div className="container">
        {/* Top Announcement Badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.4rem 1rem',
            background: 'rgba(138, 43, 226, 0.12)',
            border: '1px solid rgba(138, 43, 226, 0.3)',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#D8B4FE'
          }}>
            <Sparkles size={14} color="#C084FC" />
            <span>Powered by Google Gemini 2.5 AI & Semantic Matching</span>
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div style={{ textAlign: 'center', maxWidth: '860px', margin: '0 auto 3rem' }}>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            lineHeight: 1.15,
            marginBottom: '1.25rem'
          }}>
            Stop Losing Top Talent to <br />
            <span className="gradient-text">Blind ATS Keyword Filters</span>
          </h1>
          <p style={{
            fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
            color: 'var(--text-secondary)',
            maxWidth: '680px',
            margin: '0 auto 2.2rem'
          }}>
            Aptly evaluates candidates based on actual skill competence, seniority, and conceptual relevance—delivering transparent skill-gap insights to both recruiters and candidates.
          </p>

          {/* Primary Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/jobs" className="btn btn-primary" style={{ padding: '0.85rem 1.8rem', fontSize: '1rem' }}>
              <span>Explore Open Roles</span>
              <ArrowRight size={18} />
            </Link>
            <a href="#preview" className="btn btn-secondary" style={{ padding: '0.85rem 1.8rem', fontSize: '1rem' }}>
              <span>View ATS Match Demo</span>
            </a>
          </div>
        </div>

        {/* Interactive Live ATS Evaluation Card Preview */}
        <div id="preview" style={{ maxWidth: '940px', margin: '0 auto' }}>
          <div className="card-glass" style={{
            padding: '2rem',
            border: '1px solid rgba(138, 43, 226, 0.25)',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.6), 0 0 30px -10px rgba(138, 43, 226, 0.2)'
          }}>
            {/* Header of preview card */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              paddingBottom: '1.2rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FileText size={22} color="#10B981" />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '0.1rem' }}>
                    Full-Stack MERN & AI Engineer
                  </h4>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Sample Candidate Evaluation: Ayush Kumar Pandey • Target: TechPulse Solutions
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="badge badge-strong">
                  <CheckCircle2 size={13} />
                  Strong Match
                </span>
                <div style={{
                  padding: '0.35rem 0.85rem',
                  background: 'var(--accent-gradient)',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 800,
                  fontSize: '1rem'
                }}>
                  88% Match
                </div>
              </div>
            </div>

            {/* Grid of details inside card */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <div>
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>
                  Matched Core Skills
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.6rem' }}>
                  {['React.js', 'Node.js', 'Express', 'MongoDB', 'Gemini AI', 'REST APIs', 'Git'].map((skill) => (
                    <span key={skill} style={{
                      fontSize: '0.8rem',
                      padding: '0.25rem 0.65rem',
                      background: 'rgba(16, 185, 129, 0.12)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      borderRadius: '6px',
                      color: '#6EE7B7'
                    }}>
                      ✓ {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>
                  Identified Skill Gaps
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.6rem' }}>
                  {['Docker Containerization', 'Kubernetes Orchestration'].map((skill) => (
                    <span key={skill} style={{
                      fontSize: '0.8rem',
                      padding: '0.25rem 0.65rem',
                      background: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      borderRadius: '6px',
                      color: '#FCA5A5'
                    }}>
                      ✕ {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Recruiter Executive Summary */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '1rem 1.25rem',
              borderLeft: '4px solid var(--accent-purple)',
              fontSize: '0.92rem',
              color: 'var(--text-secondary)'
            }}>
              <strong style={{ color: 'var(--text-primary)' }}>AI Recruiter Synthesis: </strong>
              Candidate demonstrates robust competence across the full JavaScript ecosystem and vector LLM integration. Minor gap in DevOps containerization which is easily bridged with short onboarding.
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.5rem',
          marginTop: '4rem'
        }}>
          <div className="card-glass">
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'rgba(138, 43, 226, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <Zap size={20} color="#C084FC" />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>Semantic Parsing</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Recognizes adjacent technologies (e.g. knowing PostgreSQL background translates easily to MySQL) rather than discarding resumes.
            </p>
          </div>

          <div className="card-glass">
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <Target size={20} color="#10B981" />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>Transparent Skill Gaps</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Candidates see exactly why they matched or where they fell short, transforming black-box ATS rejections into constructive feedback.
            </p>
          </div>

          <div className="card-glass">
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'rgba(6, 182, 212, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <ShieldCheck size={20} color="#06B6D4" />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>Recruiter Kanban Pipeline</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Filter by match score threshold (e.g. &gt;75%), sort top talent instantly, and transition candidates through interview stages.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
