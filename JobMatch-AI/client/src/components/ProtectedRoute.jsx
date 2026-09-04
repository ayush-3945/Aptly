import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * ProtectedRoute Wrapper
 * Guards private routes and enforces role-based access control (RBAC).
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string[]} [props.allowedRoles] - Optional array of authorized roles, e.g. ['recruiter'] or ['candidate']
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '65vh',
          gap: '1rem',
          color: 'var(--text-secondary)',
        }}
      >
        <Loader2 className="spin" size={36} color="var(--accent-indigo)" />
        <p style={{ fontSize: '0.95rem' }}>Verifying authenticated session...</p>
      </div>
    );
  }

  // Not logged in -> redirect to /login preserving target destination
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check: logged in, but not authorized for this specific role
  if (allowedRoles && allowedRoles.length > 0 && (!user || !allowedRoles.includes(user.role))) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
