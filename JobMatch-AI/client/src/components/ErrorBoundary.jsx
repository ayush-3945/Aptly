import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="container"
          style={{
            padding: '4rem 1.5rem',
            textAlign: 'center',
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            className="paper-card"
            style={{
              padding: '2.5rem',
              borderRadius: '8px',
              maxWidth: '520px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
            }}
          >
            <h2
              style={{
                fontFamily: "'Newsreader', Georgia, serif",
                fontSize: '1.6rem',
                color: 'var(--text-primary)',
                marginBottom: '0.75rem',
              }}
            >
              Something went wrong
            </h2>
            <p
              style={{
                color: 'var(--text-secondary)',
                fontSize: '0.92rem',
                lineHeight: 1.5,
                marginBottom: '1.5rem',
              }}
            >
              An unexpected error occurred while rendering this page. Please try refreshing or return to home.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => (window.location.href = '/')}
              >
                Go to home
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => window.location.reload()}
              >
                Reload page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
