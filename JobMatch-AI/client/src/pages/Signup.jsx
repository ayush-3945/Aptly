import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, User, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Signup = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'candidate', // Default: 'candidate'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { name, email, password, role } = formData;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  const handleRoleSelect = (selectedRole) => {
    setFormData({
      ...formData,
      role: selectedRole,
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Form validations
    if (!name.trim()) {
      setError('Please enter your full name.');
      showToast('Please enter your full name.', 'warning');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      showToast('Please enter a valid email address.', 'warning');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      showToast('Password must be at least 6 characters long.', 'warning');
      return;
    }

    setLoading(true);

    try {
      const res = await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      });

      showToast(`Welcome to Aptly AI, ${res.name || 'there'}! Account created.`, 'success');

      // Role-based redirection
      if (res.role === 'recruiter') {
        navigate('/dashboard');
      } else {
        navigate('/jobs');
      }
    } catch (err) {
      console.error('Signup error:', err);
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
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
          maxWidth: '480px',
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
              borderRadius: '8px',
              background: 'var(--accent-teal-subtle)',
              border: '1px solid var(--accent-teal-border)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.85rem',
            }}
          >
            <UserPlus size={20} color="#0D9488" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>Create Diagnostic Account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.35rem' }}>
            Begin objective skill verification and precision job evaluation
          </p>
        </div>

        {/* Role Switcher Pill */}
        <div style={{ marginBottom: '1.75rem' }}>
          <label className="form-label" style={{ marginBottom: '0.5rem' }}>
            I am joining as:
          </label>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.65rem',
              background: 'var(--bg-secondary)',
              padding: '0.35rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {/* Candidate Option */}
            <button
              type="button"
              onClick={() => handleRoleSelect('candidate')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.75rem 0.5rem',
                borderRadius: 'var(--radius-xs)',
                border: role === 'candidate' ? '1.5px solid var(--accent-teal)' : '1px solid transparent',
                background: role === 'candidate' ? 'var(--bg-card)' : 'transparent',
                boxShadow: role === 'candidate' ? 'var(--shadow-subtle)' : 'none',
                color: role === 'candidate' ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'var(--transition)',
              }}
            >
              <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>🎯 Candidate</span>
              <span style={{ fontSize: '0.74rem', color: role === 'candidate' ? 'var(--accent-teal)' : 'var(--text-muted)', marginTop: '2px', fontFamily: 'var(--font-sans-display)' }}>
                Seek roles & verify skills
              </span>
            </button>

            {/* Recruiter Option */}
            <button
              type="button"
              onClick={() => handleRoleSelect('recruiter')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.75rem 0.5rem',
                borderRadius: 'var(--radius-xs)',
                border: role === 'recruiter' ? '1.5px solid var(--accent-teal)' : '1px solid transparent',
                background: role === 'recruiter' ? 'var(--bg-card)' : 'transparent',
                boxShadow: role === 'recruiter' ? 'var(--shadow-subtle)' : 'none',
                color: role === 'recruiter' ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'var(--transition)',
              }}
            >
              <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>🏢 Recruiter</span>
              <span style={{ fontSize: '0.74rem', color: role === 'recruiter' ? 'var(--accent-teal)' : 'var(--text-muted)', marginTop: '2px', fontFamily: 'var(--font-sans-display)' }}>
                Post jobs & diagnose matches
              </span>
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

        {/* Signup Form */}
        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Full Name
            </label>
            <div className="input-wrapper">
              <User size={16} className="input-icon" />
              <input
                id="name"
                type="text"
                name="name"
                value={name}
                onChange={handleChange}
                placeholder="e.g. Ayush Pandey"
                className="form-input has-icon-left"
                autoComplete="name"
                disabled={loading}
              />
            </div>
          </div>

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
              Password <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>(min 6 chars)</span>
            </label>
            <div className="input-wrapper">
              <Lock size={16} className="input-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={password}
                onChange={handleChange}
                placeholder="Create a strong password"
                className="form-input has-icon-left has-icon-right"
                autoComplete="new-password"
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
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-indigo)', fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
