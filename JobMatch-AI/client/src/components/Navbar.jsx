import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Briefcase,
  LayoutDashboard,
  ArrowRight,
  User,
  LogOut,
  PlusCircle,
  Menu,
  X,
} from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on route transition
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--border-subtle)',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '70px',
        }}
      >
        {/* Brand Logo with Clinical Diagnostic Seal */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Logo size={34} />
          <div>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.45rem',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                color: '#0F172A',
              }}
            >
              Aptly<span style={{ color: 'var(--accent-teal)', fontStyle: 'italic' }}>.AI</span>
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
          <Link
            to="/jobs"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.92rem',
              fontWeight: 500,
              color: isActive('/jobs') ? 'var(--accent-teal)' : 'var(--text-secondary)',
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
              gap: '0.45rem',
              fontSize: '0.92rem',
              fontWeight: 500,
              color: isActive('/dashboard') ? 'var(--accent-teal)' : 'var(--text-secondary)',
              transition: 'var(--transition)',
            }}
          >
            <LayoutDashboard size={16} />
            <span>Diagnostic Pipeline</span>
          </Link>

          {user?.role === 'recruiter' && (
            <Link
              to="/jobs/post"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.92rem',
                fontWeight: 600,
                color: isActive('/jobs/post') ? 'var(--accent-teal)' : 'var(--text-secondary)',
                transition: 'var(--transition)',
              }}
            >
              <PlusCircle size={16} />
              <span>Post Job Opening</span>
            </Link>
          )}
        </nav>

        {/* Desktop Dynamic User Authentication Actions */}
        <div className="desktop-auth" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {isAuthenticated && user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              {/* User Profile Card */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '8px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: '#F0FDFA',
                    border: '1px solid #99F6E4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-teal)',
                  }}
                >
                  <User size={14} />
                </div>
                <span
                  style={{
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    maxWidth: '130px',
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
                    padding: '0.15rem 0.5rem',
                    borderRadius: '9999px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    background: user.role === 'recruiter' ? '#F0FDFA' : '#F1F5F9',
                    color: user.role === 'recruiter' ? '#0F766E' : '#475569',
                    border: `1px solid ${user.role === 'recruiter' ? '#CCFBF1' : '#E2E8F0'}`,
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
                  fontSize: '0.84rem',
                  padding: '0.45rem 0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  color: 'var(--text-muted)',
                }}
                title="Sign out of your session"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-ghost" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Sign In
              </Link>
              <Link
                to="/signup"
                className="btn btn-primary"
                style={{
                  fontSize: '0.9rem',
                  padding: '0.55rem 1.15rem',
                  borderRadius: '8px',
                }}
              >
                <span>Get Started</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="mobile-toggle-btn"
          aria-label={mobileOpen ? 'Close menu' : 'Open navigation menu'}
          aria-expanded={mobileOpen}
          style={{ color: '#0F172A' }}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            top: '70px',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99,
            backgroundColor: 'rgba(15, 23, 42, 0.35)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setMobileOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderBottom: '1px solid var(--border-subtle)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              boxShadow: '0 20px 30px rgba(15, 23, 42, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* User Info Bar if Logged In */}
            {isAuthenticated && user && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  background: '#F8FAFC',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#F0FDFA',
                      border: '1px solid #99F6E4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-teal)',
                    }}
                  >
                    <User size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {user.name || 'User'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{user.email}</div>
                  </div>
                </div>

                <span
                  style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: '9999px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    background: user.role === 'recruiter' ? '#F0FDFA' : '#F1F5F9',
                    color: user.role === 'recruiter' ? '#0F766E' : '#475569',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  {user.role}
                </span>
              </div>
            )}

            {/* Mobile Nav Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link
                to="/jobs"
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.85rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: isActive('/jobs') ? 'var(--accent-teal)' : 'var(--text-primary)',
                  background: isActive('/jobs') ? '#F0FDFA' : 'transparent',
                  border: `1px solid ${isActive('/jobs') ? '#CCFBF1' : 'transparent'}`,
                }}
              >
                <Briefcase size={17} />
                <span>Explore Jobs</span>
              </Link>

              <Link
                to="/dashboard"
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.85rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: isActive('/dashboard') ? 'var(--accent-teal)' : 'var(--text-primary)',
                  background: isActive('/dashboard') ? '#F0FDFA' : 'transparent',
                  border: `1px solid ${isActive('/dashboard') ? '#CCFBF1' : 'transparent'}`,
                }}
              >
                <LayoutDashboard size={17} />
                <span>Diagnostic Pipeline</span>
              </Link>

              {user?.role === 'recruiter' && (
                <Link
                  to="/jobs/post"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.85rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    color: isActive('/jobs/post') ? 'var(--accent-teal)' : 'var(--text-primary)',
                    background: isActive('/jobs/post') ? '#F0FDFA' : 'transparent',
                    border: `1px solid ${isActive('/jobs/post') ? '#CCFBF1' : 'transparent'}`,
                  }}
                >
                  <PlusCircle size={17} />
                  <span>Post Job Opening</span>
                </Link>
              )}
            </div>

            {/* Mobile Auth Actions */}
            <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
              {isAuthenticated && user ? (
                <button
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  className="btn btn-secondary"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    color: '#E11D48',
                    borderColor: '#FECDD3',
                    background: '#FFF1F2',
                  }}
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="btn btn-secondary"
                    style={{ width: '100%', padding: '0.75rem', textAlign: 'center' }}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span>Get Started</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
