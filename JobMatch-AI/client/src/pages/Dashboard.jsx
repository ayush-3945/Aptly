import React from 'react';
import { LayoutDashboard } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="container" style={{ padding: '4rem 1.5rem', minHeight: '60vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <LayoutDashboard color="var(--accent-indigo)" size={28} />
        <h1>Candidate & Recruiter Dashboard</h1>
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Track your applied roles, AI evaluations, and recruitment status in one unified pipeline.
      </p>
      <div className="card-glass" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
        <h3 style={{ marginBottom: '0.5rem' }}>Dashboard Module Initializing...</h3>
        <p style={{ color: 'var(--text-muted)' }}>
          Recruiter applicant sorting and candidate status tracking will be wired in Days 19–20.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
