import React from 'react';

const Logo = ({ size = 32 }) => {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '8px',
        background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
        boxShadow: '0 2px 8px rgba(13, 148, 136, 0.25)',
        flexShrink: 0,
      }}
      aria-label="Aptly Diagnostic Evaluation"
    >
      <svg
        width={Math.round(size * 0.58)}
        height={Math.round(size * 0.58)}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Precision Diagnostic Verification Ring */}
        <circle cx="12" cy="12" r="9" strokeWidth="1.8" stroke="rgba(255, 255, 255, 0.45)" />
        <path d="M8.5 12.2l2.3 2.3 4.7-4.7" strokeWidth="2.4" />
      </svg>
    </div>
  );
};

export default Logo;
