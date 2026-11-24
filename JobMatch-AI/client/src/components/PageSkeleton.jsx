import React from 'react';

export default function PageSkeleton() {
  return (
    <div
      className="container"
      style={{
        padding: '2.5rem 1.5rem',
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
      }}
      aria-busy="true"
      aria-label="Loading page content"
    >
      {/* Skeleton Page Header */}
      <div style={{ maxWidth: '600px' }}>
        <div
          className="skeleton-shimmer"
          style={{ height: '36px', width: '55%', marginBottom: '0.85rem' }}
        />
        <div
          className="skeleton-shimmer"
          style={{ height: '18px', width: '90%', marginBottom: '0.45rem' }}
        />
        <div
          className="skeleton-shimmer"
          style={{ height: '18px', width: '65%' }}
        />
      </div>

      {/* Skeleton Content Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="paper-card"
            style={{
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid var(--border-default)',
              background: 'var(--bg-card)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div
                className="skeleton-shimmer"
                style={{ width: '42px', height: '42px', borderRadius: '6px' }}
              />
              <div
                className="skeleton-shimmer"
                style={{ width: '70px', height: '22px', borderRadius: '4px' }}
              />
            </div>
            <div
              className="skeleton-shimmer"
              style={{ height: '20px', width: '80%' }}
            />
            <div
              className="skeleton-shimmer"
              style={{ height: '14px', width: '50%' }}
            />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
              <div
                className="skeleton-shimmer"
                style={{ height: '24px', width: '65px', borderRadius: '4px' }}
              />
              <div
                className="skeleton-shimmer"
                style={{ height: '24px', width: '75px', borderRadius: '4px' }}
              />
              <div
                className="skeleton-shimmer"
                style={{ height: '24px', width: '55px', borderRadius: '4px' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
