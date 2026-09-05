import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initial session restoration
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (!storedToken) {
        setLoading(false);
        return;
      }

      setToken(storedToken);

      // Pre-populate with cached user if available for fast UI rendering
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (e) {
          console.warn('Could not parse cached user:', e);
        }
      }

      // If demo token, retain cached session without hitting network
      if (storedToken.startsWith('demo_jwt_token_')) {
        setLoading(false);
        return;
      }

      // Verify token with backend profile endpoint
      try {
        const response = await api.get('/users/profile');
        if (response.data) {
          setUser(response.data);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(response.data));
        }
      } catch (error) {
        console.warn('Session verification failed or expired:', error.response?.data?.message || error.message);
        // If 401 or invalid, clear state
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setToken(null);
          setIsAuthenticated(false);
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });

      // If backend responded with HTML (e.g. Vercel SPA rewrite fallback where API is not hosted on the same domain)
      if (typeof response.data === 'string' && response.data.trim().startsWith('<!doctype')) {
        throw new Error('Static host rewrite detected');
      }

      const { token: receivedToken, ...userData } = response.data;

      localStorage.setItem('token', receivedToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setToken(receivedToken);
      setUser(userData);
      setIsAuthenticated(true);

      return response.data;
    } catch (error) {
      // If server is unreachable or deployed on static host (Vercel client-only demo):
      // Provide instant demo authentication so reviewers and users can fully explore the UI!
      const isStaticHost =
        error.message === 'Static host rewrite detected' ||
        !error.response ||
        error.response?.status === 404 ||
        typeof error.response?.data === 'string';

      if (isStaticHost) {
        const isRecruiter = email.toLowerCase().includes('recruiter');
        const demoUser = {
          _id: isRecruiter ? 'demo-recruiter-101' : 'demo-candidate-101',
          name: isRecruiter
            ? 'Sarah Jenkins'
            : (email.toLowerCase().includes('ayush') ? 'Ayush Kumar Pandey' : 'Alex Morgan'),
          email: email.trim().toLowerCase(),
          role: isRecruiter ? 'recruiter' : 'candidate',
          headline: isRecruiter
            ? 'Lead Technical Recruiter @ TechPulse'
            : 'Full-Stack MERN & AI Systems Engineer',
        };
        const demoToken = `demo_jwt_token_${Date.now()}`;

        localStorage.setItem('token', demoToken);
        localStorage.setItem('user', JSON.stringify(demoUser));

        setToken(demoToken);
        setUser(demoUser);
        setIsAuthenticated(true);

        return { token: demoToken, ...demoUser };
      }

      throw error;
    }
  };

  // Register handler
  const register = async (userDataInput) => {
    try {
      const response = await api.post('/auth/signup', userDataInput);

      if (typeof response.data === 'string' && response.data.trim().startsWith('<!doctype')) {
        throw new Error('Static host rewrite detected');
      }

      const { token: receivedToken, ...userData } = response.data;

      localStorage.setItem('token', receivedToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setToken(receivedToken);
      setUser(userData);
      setIsAuthenticated(true);

      return response.data;
    } catch (error) {
      const isStaticHost =
        error.message === 'Static host rewrite detected' ||
        !error.response ||
        error.response?.status === 404 ||
        typeof error.response?.data === 'string';

      if (isStaticHost) {
        const demoUser = {
          _id: `demo-${userDataInput.role || 'candidate'}-${Date.now()}`,
          name: userDataInput.name || 'Demo User',
          email: userDataInput.email?.trim().toLowerCase() || 'user@example.com',
          role: userDataInput.role || 'candidate',
          headline: userDataInput.role === 'recruiter' ? 'Recruiter' : 'Candidate',
        };
        const demoToken = `demo_jwt_token_${Date.now()}`;

        localStorage.setItem('token', demoToken);
        localStorage.setItem('user', JSON.stringify(demoUser));

        setToken(demoToken);
        setUser(demoUser);
        setIsAuthenticated(true);

        return { token: demoToken, ...demoUser };
      }

      throw error;
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
