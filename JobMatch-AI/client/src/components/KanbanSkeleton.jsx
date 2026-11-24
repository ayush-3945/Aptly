import React from 'react';

export default function KanbanSkeleton() {
  const columns = ['Applied', 'Screened', 'Interviewing', 'Offered'];

  return (
    <div
      aria-busy="true"
      aria-label="Loading candidate pipeline board"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1.25rem',
        marginTop: '1.5rem',
      }}
    >
      {columns.map((colName) => (
        <div
          key={colName}
          style={{
            background: 'var(--bg-secondary)',
            borderRadius: '8px',
            border: '1px solid var(--border-default)',
            padding: '1rem',
            minHeight: '420px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
          }}
        >
          {/* Column Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: '0.5rem',
              borderBottom: '1px solid var(--border-default)',
            }}
          >
            <div
              className="skeleton-shimmer"
              style={{ height: '18px', width: '85px', borderRadius: '4px' }}
            />
            <div
              className="skeleton-shimmer"
              style={{ height: '20px', width: '28px', borderRadius: '10px' }}
            />
          </div>

          {/* Candidate Card Skeletons */}
          {[1, 2, 3].map((cardIdx) => (
            <div
              key={cardIdx}
              className="paper-card"
              style={{
                padding: '1rem',
                borderRadius: '6px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div
                  className="skeleton-shimmer"
                  style={{ height: '16px', width: '65%', borderRadius: '4px' }}
                />
                <div
                  className="skeleton-shimmer"
                  style={{ height: '22px', width: '42px', borderRadius: '4px' }}
                />
              </div>
              <div
                className="skeleton-shimmer"
                style={{ height: '13px', width: '45%', borderRadius: '3px' }}
              />
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem' }}>
                <div
                  className="skeleton-shimmer"
                  style={{ height: '18px', width: '48px', borderRadius: '4px' }}
                />
                <div
                  className="skeleton-shimmer"
                  style={{ height: '18px', width: '54px', borderRadius: '4px' }}
                />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
