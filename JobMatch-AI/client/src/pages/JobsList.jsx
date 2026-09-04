import React from 'react';
import { Briefcase } from 'lucide-react';

const JobsList = () => {
  return (
    <div className="container" style={{ padding: '4rem 1.5rem', minHeight: '60vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <Briefcase color="var(--accent-purple)" size={28} />
        <h1>Explore Open Opportunities</h1>
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Browse production engineering roles and evaluate your resume match score in real-time.
      </p>
      <div className="card-glass" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
        <h3 style={{ marginBottom: '0.5rem' }}>Job Explorer Pipeline Connecting...</h3>
        <p style={{ color: 'var(--text-muted)' }}>
          Full interactive job feed and search filters will be active in Day 18.
        </p>
      </div>
    </div>
  );
};

export default JobsList;
