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
        borderBottom: '1px solid var(--border-default)',
        boxShadow: '0 1px 3px rgba(20, 20, 20, 0.04)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '68px',
        }}
      >
        {/* Brand Logo with Clinical Geometric Mark */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Logo size={32} />
          <div>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.4rem',
                fontWeight: 600,
                letterSpacing: '-0.025em',
                color: 'var(--text-primary)',
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
              fontSize: '0.9rem',
              fontWeight: 500,
              color: isActive('/jobs') ? 'var(--accent-teal)' : 'var(--text-secondary)',
              transition: 'var(--transition)',
            }}
          >
            <Briefcase size={15} />
            <span>Explore Jobs</span>
          </Link>

          <Link
            to="/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.9rem',
              fontWeight: 500,
              color: isActive('/dashboard') ? 'var(--accent-teal)' : 'var(--text-secondary)',
              transition: 'var(--transition)',
            }}
          >
            <LayoutDashboard size={15} />
            <span>ATS Pipeline</span>
          </Link>

          {user?.role === 'recruiter' && (
            <Link
              to="/jobs/post"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: isActive('/jobs/post') ? 'var(--accent-teal)' : 'var(--text-secondary)',
                transition: 'var(--transition)',
              }}
            >
              <PlusCircle size={15} />
              <span>Post a Job</span>
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
                  gap: '0.6rem',
                  padding: '0.3rem 0.65rem',
                  borderRadius: '6px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-default)',
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '4px',
                    background: 'var(--accent-teal-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-teal)',
                  }}
                >
                  <User size={13} />
                </div>
                <span
                  style={{
                    fontSize: '0.84rem',
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
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    background: user.role === 'recruiter' ? 'var(--accent-teal-light)' : '#F1F5F9',
                    color: user.role === 'recruiter' ? 'var(--accent-teal)' : 'var(--text-secondary)',
                    border: `1px solid ${user.role === 'recruiter' ? 'rgba(15, 107, 92, 0.25)' : 'var(--border-default)'}`,
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
                  fontSize: '0.82rem',
                  padding: '0.4rem 0.75rem',
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
              <Link to="/login" className="btn btn-ghost" style={{ fontSize: '0.88rem' }}>
                Sign In
              </Link>
              <Link
                to="/signup"
                className="btn btn-primary"
                style={{
                  fontSize: '0.88rem',
                  padding: '0.5rem 1.05rem',
                  borderRadius: '6px',
                }}
              >
                <span>Get Started</span>
                <ArrowRight size={14} />
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
          style={{
            display: 'none',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-primary)',
          }}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            top: '68px',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99,
            backgroundColor: 'rgba(20, 20, 20, 0.45)',
          }}
          onClick={() => setMobileOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderBottom: '1px solid var(--border-default)',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
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
                  padding: '0.65rem 0.85rem',
                  borderRadius: '6px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-default)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '4px',
                      background: 'var(--accent-teal-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-teal)',
                    }}
                  >
                    <User size={14} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {user.name || 'User'}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{user.email}</div>
                  </div>
                </div>

                <span
                  style={{
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    background: user.role === 'recruiter' ? 'var(--accent-teal-light)' : '#F1F5F9',
                    color: user.role === 'recruiter' ? 'var(--accent-teal)' : 'var(--text-secondary)',
                    border: '1px solid var(--border-default)',
                  }}
                >
                  {user.role}
                </span>
              </div>
            )}

            {/* Mobile Nav Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <Link
                to="/jobs"
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.75rem 0.85rem',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: isActive('/jobs') ? 'var(--accent-teal)' : 'var(--text-primary)',
                  background: isActive('/jobs') ? 'var(--accent-teal-light)' : 'transparent',
                  border: `1px solid ${isActive('/jobs') ? 'rgba(15, 107, 92, 0.25)' : 'transparent'}`,
                }}
              >
                <Briefcase size={16} />
                <span>Explore Jobs</span>
              </Link>

              <Link
                to="/dashboard"
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.75rem 0.85rem',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: isActive('/dashboard') ? 'var(--accent-teal)' : 'var(--text-primary)',
                  background: isActive('/dashboard') ? 'var(--accent-teal-light)' : 'transparent',
                  border: `1px solid ${isActive('/dashboard') ? 'rgba(15, 107, 92, 0.25)' : 'transparent'}`,
                }}
              >
                <LayoutDashboard size={16} />
                <span>ATS Pipeline</span>
              </Link>

              {user?.role === 'recruiter' && (
                <Link
                  to="/jobs/post"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.75rem 0.85rem',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: isActive('/jobs/post') ? 'var(--accent-teal)' : 'var(--text-primary)',
                    background: isActive('/jobs/post') ? 'var(--accent-teal-light)' : 'transparent',
                    border: `1px solid ${isActive('/jobs/post') ? 'rgba(15, 107, 92, 0.25)' : 'transparent'}`,
                  }}
                >
                  <PlusCircle size={16} />
                  <span>Post a Job Opening</span>
                </Link>
              )}
            </div>

            {/* Mobile Auth Actions */}
            <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-default)' }}>
              {isAuthenticated && user ? (
                <button
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  className="btn btn-secondary"
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    color: 'var(--semantic-red)',
                    borderColor: 'rgba(185, 28, 28, 0.3)',
                  }}
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="btn btn-secondary"
                    style={{ width: '100%', padding: '0.65rem', textAlign: 'center' }}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span>Get Started</span>
                    <ArrowRight size={15} />
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
