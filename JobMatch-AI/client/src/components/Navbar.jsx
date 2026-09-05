import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sparkles,
  Briefcase,
  LayoutDashboard,
  ArrowRight,
  User,
  LogOut,
  PlusCircle,
  Menu,
  X,
} from 'lucide-react';
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
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        backgroundColor: 'rgba(7, 9, 14, 0.85)',
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

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav" style={{ alignItems: 'center', gap: '1.5rem' }}>
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

        {/* Desktop Dynamic User Authentication Actions */}
        <div className="desktop-auth" style={{ alignItems: 'center', gap: '0.85rem' }}>
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

        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="mobile-toggle-btn"
          aria-label={mobileOpen ? 'Close menu' : 'Open navigation menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            top: '74px',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
          onClick={() => setMobileOpen(false)}
        >
          <div
            style={{
              backgroundColor: 'rgba(13, 17, 26, 0.98)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '1.5rem',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)',
              animation: 'slideDown 0.22s ease-out forwards',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
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
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.5), rgba(6, 182, 212, 0.5))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                    }}
                  >
                    <User size={17} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
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
                    background: user.role === 'recruiter' ? 'rgba(138, 43, 226, 0.25)' : 'rgba(6, 182, 212, 0.25)',
                    color: user.role === 'recruiter' ? '#C084FC' : '#22D3EE',
                    border: `1px solid ${user.role === 'recruiter' ? 'rgba(192, 132, 252, 0.4)' : 'rgba(34, 211, 238, 0.4)'}`,
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
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: isActive('/jobs') ? 'var(--accent-cyan)' : 'var(--text-primary)',
                  background: isActive('/jobs') ? 'rgba(6, 182, 212, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                  border: `1px solid ${isActive('/jobs') ? 'rgba(6, 182, 212, 0.3)' : 'transparent'}`,
                  transition: 'var(--transition)',
                }}
              >
                <Briefcase size={18} color={isActive('/jobs') ? 'var(--accent-cyan)' : 'var(--text-secondary)'} />
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
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: isActive('/dashboard') ? '#818cf8' : 'var(--text-primary)',
                  background: isActive('/dashboard') ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                  border: `1px solid ${isActive('/dashboard') ? 'rgba(99, 102, 241, 0.3)' : 'transparent'}`,
                  transition: 'var(--transition)',
                }}
              >
                <LayoutDashboard size={18} color={isActive('/dashboard') ? '#818cf8' : 'var(--text-secondary)'} />
                <span>ATS Pipeline</span>
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
                    borderRadius: '10px',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    color: isActive('/jobs/post') ? '#C084FC' : 'var(--text-primary)',
                    background: isActive('/jobs/post') ? 'rgba(138, 43, 226, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${isActive('/jobs/post') ? 'rgba(138, 43, 226, 0.35)' : 'transparent'}`,
                    transition: 'var(--transition)',
                  }}
                >
                  <PlusCircle size={18} color={isActive('/jobs/post') ? '#C084FC' : 'var(--text-secondary)'} />
                  <span>Post a Job Opening</span>
                </Link>
              )}
            </div>

            {/* Mobile Auth Actions */}
            <div style={{ paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
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
                    color: '#f87171',
                    borderColor: 'rgba(239, 68, 68, 0.3)',
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
