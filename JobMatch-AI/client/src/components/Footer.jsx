import React from 'react';
import { GitBranch } from 'lucide-react';
import Logo from './Logo';

const Footer = () => {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-subtle)',
        backgroundColor: '#FFFFFF',
        padding: '3rem 0 2.25rem',
        marginTop: 'auto',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.45rem' }}>
              <Logo size={26} />
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '1.25rem', color: '#0F172A' }}>
                Aptly<span style={{ color: 'var(--accent-teal)', fontStyle: 'italic' }}>.AI</span>
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '420px', lineHeight: 1.55 }}>
              Clinical applicant diagnostic platform powered by Google Gemini AI, replacing arbitrary keyword filters with deep semantic competence evaluations.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            <a
              href="https://github.com/ayush-3945/Aptly"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
            >
              <GitBranch size={15} />
              <span>GitHub Repository</span>
            </a>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid #F1F5F9',
            paddingTop: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
          }}
        >
          <div>
            © {new Date().getFullYear()} Aptly AI • Engineered by <strong style={{ color: 'var(--text-primary)' }}>Ayush Kumar Pandey</strong>.
          </div>
          <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)' }}>
            <span>Clinical Precision Diagnostic Suite</span>
            <span>•</span>
            <span>Gemini 2.5</span>
            <span>•</span>
            <span>React 19</span>
            <span>•</span>
            <span>Node.js</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
