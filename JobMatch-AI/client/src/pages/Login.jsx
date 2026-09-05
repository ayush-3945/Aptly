import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, ArrowRight, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { email, password } = formData;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  // Quick fill demo credentials for reviewers & interviewers
  const fillDemoCredentials = (role) => {
    if (role === 'candidate') {
      setFormData({
        email: 'candidate@jobmatch.ai',
        password: 'password123',
      });
    } else {
      setFormData({
        email: 'recruiter@jobmatch.ai',
        password: 'password123',
      });
    }
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      showToast('Please provide both email and password.', 'warning');
      return;
    }

    setLoading(true);

    try {
      const res = await login(email.trim().toLowerCase(), password);
      showToast(`Welcome back, ${res.name || 'User'}!`, 'success');

      // Resolve intended redirect destination or default based on role
      const intendedDestination = location.state?.from?.pathname;
      if (intendedDestination) {
        navigate(intendedDestination, { replace: true });
      } else if (res.role === 'recruiter') {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/jobs', { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      const message =
        err.response?.data?.message ||
        (err.response?.status === 401
          ? 'Invalid email or password. Please try again.'
          : 'Login failed. Please verify credentials.');
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container animate-fade-in"
      style={{
        padding: '3.5rem 1.5rem 5rem',
        minHeight: '75vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        className="card-glass"
        style={{
          maxWidth: '460px',
          width: '100%',
          padding: '2.5rem 2.25rem',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.6)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '4px',
              background: 'rgba(245, 166, 35, 0.1)',
              border: '1px solid rgba(245, 166, 35, 0.35)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.85rem',
            }}
          >
            <LogIn size={20} color="#F5A623" />
          </div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800 }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.35rem' }}>
            Sign in to access your AI match reports and job portal
          </p>
        </div>

        {/* Demo Credentials Quick-Fill Pills */}
        <div
          style={{
            background: '#0E0E12',
            borderRadius: '4px',
            padding: '0.85rem 1rem',
            marginBottom: '1.5rem',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.74rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              marginBottom: '0.6rem',
            }}
          >
            <Zap size={13} color="var(--accent-amber)" />
            <span>1-Click Test Credentials</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => fillDemoCredentials('candidate')}
              className="btn btn-secondary"
              style={{
                fontSize: '0.78rem',
                padding: '0.45rem 0.5rem',
                borderRadius: '4px',
                border: '1px solid var(--border-subtle)',
                background: 'rgba(255, 255, 255, 0.03)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              Candidate
            </button>

            <button
              type="button"
              onClick={() => fillDemoCredentials('recruiter')}
              className="btn btn-secondary"
              style={{
                fontSize: '0.78rem',
                padding: '0.45rem 0.5rem',
                borderRadius: '4px',
                border: '1px solid rgba(245, 166, 35, 0.35)',
                background: 'rgba(245, 166, 35, 0.08)',
                color: 'var(--accent-amber)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              Recruiter
            </button>
          </div>
        </div>

        {/* Error Alert Banner */}
        {error && (
          <div className="alert-error">
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>{error}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          {/* Email Address */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <div className="input-wrapper">
              <Mail size={16} className="input-icon" />
              <input
                id="email"
                type="email"
                name="email"
                value={email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="form-input has-icon-left"
                autoComplete="email"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <div className="input-wrapper">
              <Lock size={16} className="input-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="form-input has-icon-left has-icon-right"
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                className="input-addon-right"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.8rem', fontSize: '1rem' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--accent-indigo)', fontWeight: 600 }}>
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
