import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CandidateDashboard from './CandidateDashboard';
import {
  Briefcase,
  Users,
  Sparkles,
  TrendingUp,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  // If the logged in user is a candidate (or default role), show the candidate dashboard
  if (user?.role === 'candidate') {
    return <CandidateDashboard />;
  }

  // Recruiter Dashboard View
  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem', minHeight: '80vh' }}>
      {/* Recruiter Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1.5rem',
          marginBottom: '2.5rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                padding: '0.3rem 0.75rem',
                borderRadius: '9999px',
                background: 'rgba(99, 102, 241, 0.15)',
                color: '#818cf8',
                border: '1px solid rgba(99, 102, 241, 0.3)',
              }}
            >
              🏢 Recruiter Workspace
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
              }}
            >
              Enterprise ATS Portal
            </span>
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '0.5rem' }}>
            Talent Acquisition & ATS Pipeline
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '650px', lineHeight: 1.5 }}>
            Welcome back, <strong style={{ color: 'var(--text-primary)' }}>{user?.name || 'Recruiter'}</strong>. Manage your open requisitions, view AI-ranked candidate scorecards, and progress talent across the interview lifecycle.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link
            to="/jobs"
            className="btn btn-outline"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
            }}
          >
            <Briefcase size={17} />
            Explore Requisitions
          </Link>
          <Link
            to="/jobs"
            className="btn btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
            }}
          >
            <PlusCircle size={17} />
            Post New Role
          </Link>
        </div>
      </div>

      {/* Recruiter Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
        }}
      >
        <div className="card-glass" style={{ padding: '1.5rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Job Postings</span>
            <Briefcase size={18} color="var(--accent-indigo)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>6</div>
          <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <TrendingUp size={14} /> 2 newly listed this week
          </div>
        </div>

        <div className="card-glass" style={{ padding: '1.5rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Applicants</span>
            <Users size={18} color="var(--accent-cyan)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>48</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Across all engineering openings
          </div>
        </div>

        <div className="card-glass" style={{ padding: '1.5rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Shortlisted Candidates</span>
            <CheckCircle2 size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>18</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            AI score &ge; 75% threshold
          </div>
        </div>

        <div className="card-glass" style={{ padding: '1.5rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Avg Gemini ATS Match</span>
            <Sparkles size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b' }}>79%</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Semantic vector alignment
          </div>
        </div>
      </div>

      {/* Recruiter Lifecycle Overview */}
      <div
        className="card-glass"
        style={{
          padding: '2.5rem',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '2.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <ShieldCheck size={24} color="var(--accent-indigo)" />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Recruiter ATS Lifecycle Pipeline</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem', maxWidth: '800px' }}>
          JobMatch AI uses the Gemini 2.5 Flash semantic engine to analyze incoming resumes against technical requirements, providing recruiters with instant multi-point scorecards, skill gap breakdowns, and structured recommendations.
        </p>

        {/* State Machine Stages */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
          }}
        >
          {[
            { stage: 'Applied', count: 18, color: '#38bdf8', desc: 'Fresh submissions awaiting recruiter review' },
            { stage: 'Shortlisted', count: 14, color: '#818cf8', desc: 'Passed automated Gemini AI match criteria' },
            { stage: 'Interview', count: 10, color: '#f59e0b', desc: 'Technical & behavioral rounds in progress' },
            { stage: 'Hired', count: 4, color: '#10b981', desc: 'Offer extended and accepted' },
            { stage: 'Rejected', count: 2, color: '#ef4444', desc: 'Candidate archived with feedback' },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                padding: '1.25rem',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderTop: `3px solid ${item.color}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: item.color }}>{item.stage}</span>
                <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)' }}>{item.count}</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4, margin: 0 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recruiter Quick Actions Card */}
      <div
        className="card-glass"
        style={{
          padding: '2rem',
          borderRadius: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.35rem' }}>Looking to explore live postings?</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            Inspect current listings, filter candidates by score, and monitor inbound applications.
          </p>
        </div>
        <Link
          to="/jobs"
          className="btn btn-primary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            fontWeight: 600,
          }}
        >
          View All Positions
          <ArrowRight size={17} />
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
