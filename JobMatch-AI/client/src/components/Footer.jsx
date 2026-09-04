import React from 'react';
import { Sparkles, GitBranch } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      backgroundColor: 'var(--bg-secondary)',
      padding: '3rem 0 2rem',
      marginTop: 'auto'
    }}>
      <div className="container" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                background: 'var(--accent-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Sparkles size={13} color="#fff" />
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem' }}>
                Aptly<span className="gradient-text">.AI</span>
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '380px' }}>
              Intelligent applicant tracking system powered by Google Gemini AI, replacing blind keyword filters with deep semantic resume matching.
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
              <GitBranch size={16} />
              <span>GitHub Repo</span>
            </a>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.82rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            © {new Date().getFullYear()} Aptly AI. Engineered by <strong style={{ color: 'var(--text-secondary)' }}>Ayush Kumar Pandey</strong>.
          </div>
          <div style={{ display: 'flex', gap: '1.2rem' }}>
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
