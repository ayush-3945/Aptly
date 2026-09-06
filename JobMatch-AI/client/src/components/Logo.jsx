import React from 'react';

const Logo = ({ size = 30 }) => {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${size}px`,
        height: `${size}px`,
        border: '1px solid rgba(15, 107, 92, 0.3)',
        background: 'var(--accent-teal-light)',
        borderRadius: '6px',
        flexShrink: 0,
      }}
      aria-label="Aptly.AI"
    >
      <svg
        width={Math.round(size * 0.62)}
        height={Math.round(size * 0.62)}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#0F6B5C"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Technical Corner Framing Brackets */}
        <path d="M4 8V4h4" />
        <path d="M16 4h4v4" />
        <path d="M20 16v4h-4" />
        <path d="M8 20H4v-4" />
        {/* Geometric Monogram A */}
        <path d="M7.5 17L12 7l4.5 10" />
        <path d="M9.2 13.5h5.6" />
      </svg>
    </div>
  );
};

export default Logo;
