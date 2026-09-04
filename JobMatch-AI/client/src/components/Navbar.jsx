import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Briefcase, LayoutDashboard, ArrowRight, User, LogOut, PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        backgroundColor: 'rgba(7, 9, 14, 0.75)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '74px',
        }}
      >
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--accent-glow)',
            }}
          >
            <Sparkles size={20} color="#FFFFFF" />
          </div>
          <div>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.4rem',
                fontWeight: 800,
                letterSpacing: '-0.03em',
              }}
            >
              Aptly<span className="gradient-text">.AI</span>
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link
            to="/jobs"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.92rem',
              fontWeight: 500,
              color: isActive('/jobs') ? 'var(--text-primary)' : 'var(--text-secondary)',
              transition: 'var(--transition)',
            }}
          >
            <Briefcase size={16} />
            <span>Explore Jobs</span>
          </Link>

          <Link
            to="/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.92rem',
              fontWeight: 500,
              color: isActive('/dashboard') ? 'var(--text-primary)' : 'var(--text-secondary)',
              transition: 'var(--transition)',
            }}
          >
            <LayoutDashboard size={16} />
            <span>ATS Pipeline</span>
          </Link>

          {user?.role === 'recruiter' && (
            <Link
              to="/jobs/post"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.92rem',
                fontWeight: 600,
                color: isActive('/jobs/post') ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                transition: 'var(--transition)',
              }}
            >
              <PlusCircle size={16} />
              <span>Post a Job</span>
            </Link>
          )}
        </nav>

        {/* Dynamic User Authentication Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {isAuthenticated && user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              {/* User Profile Card */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.4), rgba(6, 182, 212, 0.4))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                  }}
                >
                  <User size={15} />
                </div>
                <span
                  style={{
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    maxWidth: '140px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user.name || 'User'}
                </span>
                {/* Role Badge */}
                <span
                  style={{
                    padding: '0.18rem 0.55rem',
                    borderRadius: '9999px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    background: user.role === 'recruiter' ? 'rgba(138, 43, 226, 0.2)' : 'rgba(6, 182, 212, 0.2)',
                    color: user.role === 'recruiter' ? '#C084FC' : '#22D3EE',
                    border: `1px solid ${user.role === 'recruiter' ? 'rgba(192, 132, 252, 0.35)' : 'rgba(34, 211, 238, 0.35)'}`,
                  }}
                >
                  {user.role}
                </span>
              </div>

              {/* Sign Out Button */}
              <button
                onClick={logout}
                className="btn btn-ghost"
                style={{
                  fontSize: '0.85rem',
                  padding: '0.45rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: 'var(--text-secondary)',
                }}
                title="Sign out of your session"
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-ghost" style={{ fontSize: '0.9rem' }}>
                Sign In
              </Link>
              <Link
                to="/signup"
                className="btn btn-primary"
                style={{ fontSize: '0.9rem', padding: '0.55rem 1.15rem' }}
              >
                <span>Get Started</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
