import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import usePageMeta from '../hooks/usePageMeta';

export default function NotFound() {
  usePageMeta('Page Not Found', 'The requested page could not be found on Aptly.AI.');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '65vh',
        padding: '3rem 1.5rem',
        textAlign: 'center',
      }}
    >
      <div
        className="paper-card"
        style={{
          maxWidth: '480px',
          width: '100%',
          padding: '2.5rem 2rem',
          borderRadius: '8px',
          border: '1px solid var(--border-default)',
          background: 'var(--bg-card)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            padding: '0.2rem 0.65rem',
            borderRadius: '4px',
            fontSize: '0.8rem',
            fontWeight: 700,
            background: 'var(--accent-teal-light)',
            color: 'var(--accent-teal)',
            border: '1px solid rgba(15, 107, 92, 0.25)',
            marginBottom: '1rem',
          }}
        >
          404 Error
        </span>

        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '2rem',
            color: 'var(--text-primary)',
            marginBottom: '0.75rem',
            letterSpacing: '-0.02em',
          }}
        >
          Page Not Found
        </h1>

        <p
          style={{
            fontSize: '0.92rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginBottom: '1.75rem',
          }}
        >
          The page or candidate requisition you are looking for doesn't exist or has been moved.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link
            to="/"
            className="btn btn-primary"
            style={{
              padding: '0.6rem 1.25rem',
              fontSize: '0.88rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
            }}
          >
            <Home size={15} />
            <span>Go Home</span>
          </Link>
          <Link
            to="/jobs"
            className="btn btn-secondary"
            style={{
              padding: '0.6rem 1.15rem',
              fontSize: '0.88rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
            }}
          >
            <ArrowLeft size={15} />
            <span>Explore Jobs</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
