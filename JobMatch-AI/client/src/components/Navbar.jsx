import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Briefcase, LayoutDashboard, UserCheck, ArrowRight } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      backgroundColor: 'rgba(7, 9, 14, 0.75)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '74px'
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--accent-glow)'
          }}>
            <Sparkles size={20} color="#FFFFFF" />
          </div>
          <div>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.4rem',
              fontWeight: 800,
              letterSpacing: '-0.03em'
            }}>
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
              transition: 'var(--transition)'
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
              transition: 'var(--transition)'
            }}
          >
            <LayoutDashboard size={16} />
            <span>ATS Pipeline</span>
          </Link>
        </nav>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/login" className="btn btn-ghost" style={{ fontSize: '0.9rem' }}>
            Sign In
          </Link>
          <Link to="/signup" className="btn btn-primary" style={{ fontSize: '0.9rem', padding: '0.55rem 1.15rem' }}>
            <span>Get Started</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
