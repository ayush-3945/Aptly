import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, ArrowRight, Zap, Target, Cpu, Terminal, Layers } from 'lucide-react';

const Hero = () => {
  return (
    <section style={{ padding: '4.5rem 0 5rem', position: 'relative' }}>
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Top Technical Status / Announcement Badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.35rem 0.95rem',
              background: 'rgba(245, 166, 35, 0.08)',
              border: '1px solid rgba(245, 166, 35, 0.28)',
              borderRadius: '4px',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--accent-amber)',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.04em',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--accent-amber)',
                boxShadow: '0 0 6px var(--accent-amber)',
                display: 'inline-block',
              }}
            />
            <Cpu size={13} color="#F5A623" />
            <span>POWERED BY GOOGLE GEMINI 2.5 • SEMANTIC ATS</span>
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div style={{ textAlign: 'center', maxWidth: '880px', margin: '0 auto 3rem' }}>
          <h1
            style={{
              fontSize: 'clamp(2.5rem, 5.5vw, 4.2rem)',
              lineHeight: 1.12,
              marginBottom: '1.35rem',
              letterSpacing: '-0.035em',
            }}
          >
            Stop Losing Top Talent to <br />
            <span style={{ color: 'var(--accent-amber)', fontWeight: 800 }}>Blind ATS Keyword Filters</span>
          </h1>
          <p
            style={{
              fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
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
                background: '#F5A623',
                color: '#0A0A0A',
                border: '1px solid #F5A623',
                fontWeight: 700,
              }}
            >
              <span>Explore Open Roles</span>
              <ArrowRight size={16} />
            </Link>
            <a
              href="#preview"
              className="btn btn-secondary"
              style={{
                padding: '0.75rem 1.65rem',
                fontSize: '0.95rem',
                borderRadius: '4px',
                fontWeight: 600,
              }}
            >
              <span>View Live Match Demo</span>
            </a>
          </div>
        </div>

        {/* Interactive Live ATS Evaluation Card Preview */}
        <div id="preview" style={{ maxWidth: '940px', margin: '0 auto' }}>
          <div
            className="card-glass"
            style={{
              padding: '1.75rem',
              border: '1px solid rgba(245, 166, 35, 0.28)',
              borderRadius: '6px',
              background: '#0E0E12',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.7)',
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
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                paddingBottom: '1.15rem',
                marginBottom: '1.35rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '4px',
                    background: 'rgba(245, 166, 35, 0.08)',
                    border: '1px solid rgba(245, 166, 35, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Terminal size={18} color="#F5A623" />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '0.2rem', fontWeight: 700 }}>
                    Full-Stack MERN & AI Engineer
                  </h4>
                  <div
                    style={{
                      fontSize: '0.78rem',
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)',
                      letterSpacing: '0.02em',
                    }}
                  >
                    EVALUATION: Ayush Kumar Pandey • TARGET: TechPulse Solutions
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="badge badge-strong">
                  <CheckCircle2 size={13} />
                  Strong Match
                </span>
                <div
                  style={{
                    padding: '0.3rem 0.75rem',
                    background: 'rgba(245, 166, 35, 0.12)',
                    border: '1px solid rgba(245, 166, 35, 0.45)',
                    borderRadius: '4px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    color: 'var(--accent-amber)',
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '0.04em',
                  }}
                >
                  88.0% ATS_MATCH
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
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  [+] MATCHED CORE SKILLS
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginTop: '0.6rem' }}>
                  {['React.js', 'Node.js', 'Express', 'MongoDB', 'Gemini AI', 'REST APIs', 'Git'].map((skill) => (
                    <span
                      key={skill}
                      style={{
                        fontSize: '0.76rem',
                        fontFamily: 'var(--font-mono)',
                        padding: '0.2rem 0.6rem',
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        borderRadius: '3px',
                        color: '#6EE7B7',
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
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  [-] IDENTIFIED SKILL GAPS
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginTop: '0.6rem' }}>
                  {['Docker Containerization', 'Kubernetes Orchestration'].map((skill) => (
                    <span
                      key={skill}
                      style={{
                        fontSize: '0.76rem',
                        fontFamily: 'var(--font-mono)',
                        padding: '0.2rem 0.6rem',
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        borderRadius: '3px',
                        color: '#FCA5A5',
                      }}
                    >
                      ✕ {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Recruiter Executive Summary in Terminal Quotebox */}
            <div
              style={{
                background: '#070709',
                borderRadius: '4px',
                padding: '0.9rem 1.15rem',
                borderLeft: '3px solid var(--accent-amber)',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                borderRight: '1px solid rgba(255, 255, 255, 0.05)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                fontSize: '0.88rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.55,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--accent-amber)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'block',
                  marginBottom: '0.3rem',
                  letterSpacing: '0.03em',
                }}
              >
                // AI_RECRUITER_SYNTHESIS:
              </span>
              Candidate demonstrates robust competence across the full JavaScript ecosystem and vector LLM integration. Minor gap in DevOps containerization which is easily bridged with short onboarding.
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
            background: '#0E0E12',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
          }}
        >
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 800, color: 'var(--accent-amber)', letterSpacing: '-0.02em' }}>
              99.2%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 600, marginTop: '0.2rem', letterSpacing: '0.03em' }}>
              [ATS_SEMANTIC_ACCURACY]
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 800, color: '#EDEDED', letterSpacing: '-0.02em' }}>
              &lt; 1.2s
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 600, marginTop: '0.2rem', letterSpacing: '0.03em' }}>
              [GEMINI_2.5_LATENCY]
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 800, color: 'var(--accent-amber)', letterSpacing: '-0.02em' }}>
              4.2x
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 600, marginTop: '0.2rem', letterSpacing: '0.03em' }}>
              [SHORTLIST_VELOCITY]
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 800, color: '#10B981', letterSpacing: '-0.02em' }}>
              0%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 600, marginTop: '0.2rem', letterSpacing: '0.03em' }}>
              [BLIND_KEYWORD_DISCARDS]
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
          <div className="card-glass">
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '4px',
                background: 'rgba(245, 166, 35, 0.08)',
                border: '1px solid rgba(245, 166, 35, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.9rem',
              }}
            >
              <Zap size={18} color="#F5A623" />
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem', fontWeight: 700 }}>Semantic Parsing</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              Recognizes adjacent technologies (e.g. knowing PostgreSQL background translates easily to MySQL) rather than discarding resumes.
            </p>
          </div>

          <div className="card-glass">
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '4px',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.9rem',
              }}
            >
              <Target size={18} color="#10B981" />
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem', fontWeight: 700 }}>Transparent Skill Gaps</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              Candidates see exactly why they matched or where they fell short, transforming black-box ATS rejections into constructive feedback.
            </p>
          </div>

          <div className="card-glass">
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '4px',
                background: 'rgba(245, 166, 35, 0.08)',
                border: '1px solid rgba(245, 166, 35, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.9rem',
              }}
            >
              <ShieldCheck size={18} color="#F5A623" />
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem', fontWeight: 700 }}>Recruiter Kanban Pipeline</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              Filter by match score threshold (e.g. &gt;75%), sort top talent instantly, and transition candidates through interview stages.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
