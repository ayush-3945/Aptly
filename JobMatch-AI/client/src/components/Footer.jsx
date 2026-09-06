import React from 'react';
import { GitBranch } from 'lucide-react';
import Logo from './Logo';

const Footer = () => {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-default)',
        backgroundColor: 'var(--bg-secondary)',
        padding: '2.5rem 0 2rem',
        marginTop: 'auto',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.75rem',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.4rem' }}>
              <Logo size={24} />
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '1.15rem', color: 'var(--text-primary)' }}>
                Aptly<span style={{ color: 'var(--accent-teal)', fontStyle: 'italic' }}>.AI</span>
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', maxWidth: '420px', lineHeight: 1.55 }}>
              Clinical talent intelligence and diagnostic ATS powered by Google Gemini AI, replacing blind keyword filters with structured semantic competency evaluations.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <a
              href="https://github.com/ayush-3945/Aptly"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem' }}
            >
              <GitBranch size={15} />
              <span>GitHub Repository</span>
            </a>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid var(--border-default)',
            paddingTop: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
          }}
        >
          <div>
            © {new Date().getFullYear()} Aptly AI. Engineered by <strong style={{ color: 'var(--text-primary)' }}>Ayush Kumar Pandey</strong>.
          </div>
          <div style={{ display: 'flex', gap: '0.85rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
            <span>React 19</span>
            <span>•</span>
            <span>Vite</span>
            <span>•</span>
            <span>Node.js</span>
            <span>•</span>
            <span>Gemini AI</span>
            <span>•</span>
            <span>MongoDB</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
