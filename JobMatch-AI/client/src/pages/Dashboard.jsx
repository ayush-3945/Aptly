import React from 'react';
import { useAuth } from '../context/AuthContext';
import CandidateDashboard from './CandidateDashboard';
import RecruiterJobs from '../components/RecruiterJobs';
import { ShieldCheck } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  // If the logged in user is a candidate (or default role), show the candidate dashboard
  if (user?.role === 'candidate') {
    return <CandidateDashboard />;
  }

  // Recruiter Dashboard View
  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem', minHeight: '80vh' }}>
      <RecruiterJobs />

      {/* Recruiter Lifecycle Overview Section */}
      <div
        className="card-glass"
        style={{
          marginTop: '3rem',
          padding: '2.5rem',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <ShieldCheck size={24} color="var(--accent-indigo)" />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>ATS Candidate Evaluation Lifecycle</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem', maxWidth: '800px' }}>
          JobMatch AI uses the Gemini 2.5 Flash semantic engine to analyze incoming resumes against technical requirements, providing recruiters with instant multi-point scorecards, skill gap breakdowns, and automated status transitions.
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
            { stage: 'Rejected', count: 2, color: '#ef4444', desc: 'Candidate archived with constructive feedback' },
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
    </div>
  );
};

export default Dashboard;
