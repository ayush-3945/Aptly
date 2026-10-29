import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CandidateDashboard from './CandidateDashboard';
import RecruiterJobs from '../components/RecruiterJobs';
import RecruiterAnalytics from '../components/RecruiterAnalytics';
import UpcomingInterviews from '../components/UpcomingInterviews';
import { Briefcase, Calendar, BarChart2 } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // If the logged in user is a candidate, show candidate dashboard
  if (user?.role === 'candidate') {
    return <CandidateDashboard />;
  }

  // Active tab synchronized with URL (?tab=jobs | interviews | analytics)
  const tabParam = (searchParams.get('tab') || 'jobs').toLowerCase();
  const activeTab = ['jobs', 'interviews', 'analytics'].includes(tabParam) ? tabParam : 'jobs';

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 5rem', minHeight: '80vh' }}>
      {/* Recruiter Header & Simplified Subtitle */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.02em',
              padding: '0.2rem 0.6rem',
              borderRadius: '4px',
              background: 'var(--accent-teal-light)',
              color: 'var(--accent-teal)',
              border: '1px solid rgba(15, 107, 92, 0.25)',
              textTransform: 'uppercase',
            }}
          >
            Recruiter command center
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Logged in as <strong style={{ color: 'var(--text-primary)' }}>{user?.name || 'Recruiter'}</strong>
          </span>
        </div>

        <h1
          style={{
            fontFamily: "'Newsreader', Georgia, serif",
            fontSize: '2.3rem',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            margin: '0 0 0.4rem 0',
            color: 'var(--text-primary)',
          }}
        >
          Recruiter Workspace
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', margin: 0, maxWidth: '720px', lineHeight: 1.5 }}>
          Hiring funnel, match quality and skill demand across your open roles.
        </p>
      </div>

      {/* 3 Recruiter Tabs (Jobs, Interviews, Analytics) */}
      <div
        role="tablist"
        aria-label="Recruiter workspace sections"
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border-default)',
          marginBottom: '2.5rem',
        }}
      >
        <button
          role="tab"
          id="tab-jobs"
          aria-selected={activeTab === 'jobs'}
          aria-controls="panel-jobs"
          onClick={() => handleTabChange('jobs')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.55rem',
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'jobs' ? '3px solid var(--accent-teal)' : '3px solid transparent',
            color: activeTab === 'jobs' ? 'var(--accent-teal)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'jobs' ? 700 : 500,
            fontSize: '0.92rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            marginBottom: '-1px',
          }}
        >
          <Briefcase size={16} />
          <span>Jobs</span>
        </button>

        <button
          role="tab"
          id="tab-interviews"
          aria-selected={activeTab === 'interviews'}
          aria-controls="panel-interviews"
          onClick={() => handleTabChange('interviews')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.55rem',
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'interviews' ? '3px solid var(--accent-teal)' : '3px solid transparent',
            color: activeTab === 'interviews' ? 'var(--accent-teal)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'interviews' ? 700 : 500,
            fontSize: '0.92rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            marginBottom: '-1px',
          }}
        >
          <Calendar size={16} />
          <span>Interviews</span>
        </button>

        <button
          role="tab"
          id="tab-analytics"
          aria-selected={activeTab === 'analytics'}
          aria-controls="panel-analytics"
          onClick={() => handleTabChange('analytics')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.55rem',
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'analytics' ? '3px solid var(--accent-teal)' : '3px solid transparent',
            color: activeTab === 'analytics' ? 'var(--accent-teal)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'analytics' ? 700 : 500,
            fontSize: '0.92rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            marginBottom: '-1px',
          }}
        >
          <BarChart2 size={16} />
          <span>Analytics</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'jobs' && (
        <div role="tabpanel" id="panel-jobs" aria-labelledby="tab-jobs">
          <RecruiterJobs />
        </div>
      )}

      {activeTab === 'interviews' && (
        <div role="tabpanel" id="panel-interviews" aria-labelledby="tab-interviews">
          <UpcomingInterviews viewMode="recruiter" />
        </div>
      )}

      {activeTab === 'analytics' && (
        <div role="tabpanel" id="panel-analytics" aria-labelledby="tab-analytics">
          <RecruiterAnalytics />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
