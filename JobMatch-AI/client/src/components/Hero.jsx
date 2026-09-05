import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, ShieldCheck, Activity, Target, Layers, FileCheck, Check, X } from 'lucide-react';

const Hero = () => {
  return (
    <section style={{ padding: '4.5rem 0 5.5rem', position: 'relative' }}>
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Top Clinical Diagnostic Status Badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.38rem 1rem',
              background: '#F0FDFA',
              border: '1px solid #CCFBF1',
              borderRadius: '9999px',
              fontSize: '0.84rem',
              fontWeight: 600,
              color: '#0F766E',
              boxShadow: '0 1px 3px rgba(13, 148, 136, 0.08)',
            }}
          >
            <Activity size={15} color="#0D9488" />
            <span>Gemini 2.5 Competence Diagnostics • Semantic Evaluation</span>
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div style={{ textAlign: 'center', maxWidth: '880px', margin: '0 auto 3rem' }}>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2.6rem, 5.5vw, 4.2rem)',
              lineHeight: 1.15,
              marginBottom: '1.35rem',
              color: '#0F172A',
              fontWeight: 600,
              letterSpacing: '-0.025em',
            }}
          >
            Stop Losing Top Talent to <br />
            <span style={{ fontStyle: 'italic', color: 'var(--accent-teal)', fontWeight: 600 }}>
              Blind ATS Keyword Filters
            </span>
          </h1>
          <p
            style={{
              fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
              color: 'var(--text-secondary)',
              maxWidth: '720px',
              margin: '0 auto 2.2rem',
              lineHeight: 1.6,
            }}
          >
            Aptly provides clinical diagnostic skill evaluations rather than naive keyword matching—giving candidates transparent gap reports and recruiters precision-ranked talent.
          </p>

          {/* Primary Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              to="/jobs"
              className="btn btn-primary"
              style={{ padding: '0.75rem 1.75rem', fontSize: '0.98rem' }}
            >
              <span>Explore Open Roles</span>
              <ArrowRight size={17} />
            </Link>
            <a
              href="#preview"
              className="btn btn-secondary"
              style={{ padding: '0.75rem 1.75rem', fontSize: '0.98rem' }}
            >
              <span>View Sample Lab Report</span>
            </a>
          </div>
        </div>

        {/* Clinical Diagnostic Evaluation Report Card Preview */}
        <div id="preview" style={{ maxWidth: '940px', margin: '0 auto' }}>
          <div
            className="lab-card"
            style={{
              padding: '2.2rem',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.04)',
            }}
          >
            {/* Header of diagnostic card */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1.25rem',
                borderBottom: '1px solid #F1F5F9',
                paddingBottom: '1.4rem',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    background: '#F0FDFA',
                    border: '1px solid #CCFBF1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FileCheck size={22} color="#0D9488" />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontWeight: 700 }}>
                    DIAGNOSTIC REPORT #APT-8492
                  </div>
                  <h4 style={{ fontSize: '1.2rem', margin: '0.15rem 0', fontWeight: 700, color: '#0F172A', fontFamily: 'var(--font-sans-display)' }}>
                    Full-Stack MERN & AI Engineer
                  </h4>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Subject: <strong>Ayush Kumar Pandey</strong> • Benchmarked Against: <strong>TechPulse Solutions</strong>
                  </div>
                </div>
              </div>

              {/* Match Score Diagnostic Dial / Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.45rem 1rem',
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    borderRadius: '9999px',
                  }}
                >
                  <CheckCircle2 size={16} color="#16A34A" />
                  <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#166534' }}>
                    Strong Alignment
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '0.2rem',
                    padding: '0.45rem 1.15rem',
                    background: '#F0FDFA',
                    border: '1px solid #99F6E4',
                    borderRadius: '10px',
                  }}
                >
                  <span style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F766E', fontFamily: 'var(--font-sans-display)', lineHeight: 1 }}>
                    88%
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0D9488', textTransform: 'uppercase' }}>
                    Score
                  </span>
                </div>
              </div>
            </div>

            {/* Checklist-style Skill Diagnostics */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.75rem',
                marginBottom: '1.75rem',
              }}
            >
              {/* Verified Competencies */}
              <div
                style={{
                  background: '#FAFCFE',
                  border: '1px solid #EDF2F7',
                  borderRadius: '12px',
                  padding: '1.35rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.9rem' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={12} color="#15803D" strokeWidth={3} />
                  </div>
                  <span style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#15803D', fontWeight: 700 }}>
                    Verified Competencies (7 Matched)
                  </span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {['React.js', 'Node.js', 'Express', 'MongoDB', 'Gemini AI', 'REST APIs', 'Git'].map((skill) => (
                    <span
                      key={skill}
                      style={{
                        fontSize: '0.82rem',
                        fontWeight: 500,
                        padding: '0.3rem 0.75rem',
                        background: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        color: '#1E293B',
                        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <span style={{ color: '#0D9488', fontWeight: 700 }}>✓</span>
                      <span>{skill}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Diagnostic Skill Gaps */}
              <div
                style={{
                  background: '#FFFDFD',
                  border: '1px solid #FFE4E6',
                  borderRadius: '12px',
                  padding: '1.35rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.9rem' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={12} color="#B91C1C" strokeWidth={3} />
                  </div>
                  <span style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#B91C1C', fontWeight: 700 }}>
                    Identified Diagnostic Gaps (2 Detected)
                  </span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {['Docker Containerization', 'Kubernetes Orchestration'].map((skill) => (
                    <span
                      key={skill}
                      style={{
                        fontSize: '0.82rem',
                        fontWeight: 500,
                        padding: '0.3rem 0.75rem',
                        background: '#FFFFFF',
                        border: '1px solid #FECDD3',
                        borderRadius: '6px',
                        color: '#9F1239',
                        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <span style={{ color: '#E11D48', fontWeight: 700 }}>✕</span>
                      <span>{skill}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Clinical Diagnostic Evaluation Finding */}
            <div
              style={{
                background: '#F8FAFC',
                borderRadius: '10px',
                padding: '1.15rem 1.4rem',
                borderLeft: '4px solid var(--accent-teal)',
                borderTop: '1px solid #EDF2F7',
                borderRight: '1px solid #EDF2F7',
                borderBottom: '1px solid #EDF2F7',
                fontSize: '0.92rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
              }}
            >
              <span style={{ color: 'var(--accent-teal-dark)', fontWeight: 700, display: 'block', marginBottom: '0.25rem', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Clinical Diagnostic Finding:
              </span>
              Candidate demonstrates robust technical depth across modern full-stack web architectures and generative AI integrations. Identified gaps in Docker containerization represent easily bridgeable tooling rather than core conceptual deficiencies.
            </div>
          </div>
        </div>

        {/* Scientific Precision Proof Metrics Strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginTop: '3.5rem',
            padding: '1.65rem 2rem',
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-teal-dark)', fontFamily: 'var(--font-sans-display)', letterSpacing: '-0.03em' }}>
              99.2%
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '0.2rem' }}>
              Semantic Diagnostic Accuracy
            </div>
          </div>
          <div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0F172A', fontFamily: 'var(--font-sans-display)', letterSpacing: '-0.03em' }}>
              &lt; 1.2s
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '0.2rem' }}>
              Gemini 2.5 Inference Latency
            </div>
          </div>
          <div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-teal-dark)', fontFamily: 'var(--font-sans-display)', letterSpacing: '-0.03em' }}>
              4.2x
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '0.2rem' }}>
              Review Velocity Improvement
            </div>
          </div>
          <div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#16A34A', fontFamily: 'var(--font-sans-display)', letterSpacing: '-0.03em' }}>
              0%
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '0.2rem' }}>
              Arbitrary Keyword Rejections
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.5rem',
            marginTop: '3.5rem',
          }}
        >
          <div className="lab-card">
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: '#F0FDFA',
                border: '1px solid #CCFBF1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <Activity size={20} color="#0D9488" />
            </div>
            <h3 style={{ fontSize: '1.18rem', marginBottom: '0.4rem', color: '#0F172A', fontFamily: 'var(--font-sans-display)', fontWeight: 700 }}>
              Semantic Diagnostics
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Recognizes adjacent technologies (e.g. knowing PostgreSQL background translates easily to MySQL) rather than discarding resumes.
            </p>
          </div>

          <div className="lab-card">
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <Target size={20} color="#16A34A" />
            </div>
            <h3 style={{ fontSize: '1.18rem', marginBottom: '0.4rem', color: '#0F172A', fontFamily: 'var(--font-sans-display)', fontWeight: 700 }}>
              Transparent Skill Gaps
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Candidates see exactly why they matched or where they fell short, transforming black-box ATS rejections into constructive feedback.
            </p>
          </div>

          <div className="lab-card">
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: '#F0FDFA',
                border: '1px solid #CCFBF1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <ShieldCheck size={20} color="#0D9488" />
            </div>
            <h3 style={{ fontSize: '1.18rem', marginBottom: '0.4rem', color: '#0F172A', fontFamily: 'var(--font-sans-display)', fontWeight: 700 }}>
              Recruiter Pipeline
            </h3>
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
