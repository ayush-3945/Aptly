import React from 'react';
import { Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

const Signup = () => {
  return (
    <div className="container" style={{ padding: '5rem 1.5rem', minHeight: '65vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="card-glass" style={{ maxWidth: '440px', width: '100%', padding: '2.5rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'var(--accent-gradient)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.75rem'
          }}>
            <UserPlus size={22} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.6rem' }}>Join Aptly AI</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Choose Candidate or Recruiter profile to get started
          </p>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.04)',
          borderRadius: 'var(--radius-sm)',
          padding: '1.25rem',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.88rem',
          marginBottom: '1.5rem'
        }}>
          Multi-role Candidate & Recruiter registration will be wired in Day 17.
        </div>

        <div style={{ textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent-indigo)', fontWeight: 600 }}>Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
