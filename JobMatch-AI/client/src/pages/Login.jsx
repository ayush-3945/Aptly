import React from 'react';
import { Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';

const Login = () => {
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
            <LogIn size={22} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.6rem' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Sign in to access your AI match reports and job portal
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
          Authentication state & JWT session management will be wired in Day 16 & 17.
        </div>

        <div style={{ textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Don't have an account? <Link to="/signup" style={{ color: 'var(--accent-indigo)', fontWeight: 600 }}>Create Account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
