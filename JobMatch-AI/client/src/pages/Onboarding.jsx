import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Briefcase, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import useDocumentTitle from '../hooks/useDocumentTitle';

const Onboarding = () => {
  useDocumentTitle(
    'Welcome to Aptly.AI',
    'Select your role to start discovering matching technical jobs or screening candidate pipelines.'
  );

  const navigate = useNavigate();
  const { user, updateUser, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [selectedRole, setSelectedRole] = useState(null); // 'candidate' | 'recruiter'
  const [submitting, setSubmitting] = useState(false);

  const handleContinue = async () => {
    if (!selectedRole || submitting) return;

    setSubmitting(true);
    try {
      // 1. Persist selected role to user profile in MongoDB
      if (isAuthenticated) {
        try {
          await api.put('/users/profile', { role: selectedRole });
        } catch (apiErr) {
          console.warn('[Onboarding] Backend sync error, persisting locally:', apiErr.message);
        }
      }

      // 2. Synchronize user state in AuthContext & localStorage
      if (user) {
        updateUser({ ...user, role: selectedRole });
      }

      showToast(
        `Welcome! Setting up your ${selectedRole === 'recruiter' ? 'recruiter studio' : 'job seeker workspace'}.`,
        'success'
      );

      // 3. Role-based intentional redirection
      if (selectedRole === 'recruiter') {
        navigate('/jobs/post');
      } else {
        navigate('/jobs');
      }
    } catch (err) {
      console.error('[Onboarding] Error continuing:', err);
      showToast('Could not save selection. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e, role) => {
    if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      setSelectedRole(role);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextRole = role === 'candidate' ? 'recruiter' : 'candidate';
      setSelectedRole(nextRole);
      document.getElementById(nextRole === 'candidate' ? 'role-card-candidate' : 'role-card-recruiter')?.focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevRole = role === 'candidate' ? 'recruiter' : 'candidate';
      setSelectedRole(prevRole);
      document.getElementById(prevRole === 'candidate' ? 'role-card-candidate' : 'role-card-recruiter')?.focus();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedRole) {
        handleContinue();
      } else {
        setSelectedRole(role);
      }
    }
  };

  return (
    <div
      className="animate-fade-in"
      style={{
        minHeight: 'calc(100vh - 68px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1.25rem',
        backgroundColor: 'var(--bg-primary, #F8F7F4)',
      }}
    >
      <div
        className="paper-card"
        style={{
          width: '100%',
          maxWidth: '680px',
          padding: '2.75rem 2.25rem',
          borderRadius: '12px',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-default, #E2E8F0)',
          boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.06)',
          textAlign: 'center',
        }}
      >
        {/* Step Indicator / Header */}
        <div style={{ marginBottom: '2rem' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              backgroundColor: 'var(--accent-teal-light, #F0FDFA)',
              color: 'var(--accent-teal, #0F766E)',
              border: '1px solid rgba(15, 118, 110, 0.2)',
              marginBottom: '1rem',
            }}
          >
            Welcome to Aptly
          </span>

          <h1
            style={{
              fontFamily: "'Newsreader', Georgia, serif",
              fontSize: '2.2rem',
              fontWeight: 800,
              color: 'var(--text-primary, #0F172A)',
              letterSpacing: '-0.025em',
              margin: '0 0 0.5rem 0',
            }}
          >
            How will you use Aptly?
          </h1>

          <p
            style={{
              fontSize: '0.98rem',
              color: 'var(--text-secondary, #64748B)',
              maxWidth: '460px',
              margin: '0 auto',
              lineHeight: 1.5,
            }}
          >
            Pick the option that fits you best.
          </p>
        </div>

        {/* Accessible Radiogroup Options */}
        <div
          role="radiogroup"
          aria-label="Role selection: how will you use Aptly?"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2.25rem',
            textAlign: 'left',
          }}
        >
          {/* Card 1: Candidate Option */}
          <div
            id="role-card-candidate"
            role="radio"
            aria-checked={selectedRole === 'candidate'}
            aria-label="Looking for a job: Get an AI match score for every role and track your applications"
            tabIndex={0}
            onClick={() => setSelectedRole('candidate')}
            onKeyDown={(e) => handleKeyDown(e, 'candidate')}
            style={{
              padding: '1.75rem 1.5rem',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
              border:
                selectedRole === 'candidate'
                  ? '2px solid var(--accent-teal, #0F766E)'
                  : '1.5px solid var(--border-default, #E2E8F0)',
              backgroundColor:
                selectedRole === 'candidate'
                  ? 'var(--accent-teal-light, #F0FDFA)'
                  : '#FFFFFF',
              boxShadow:
                selectedRole === 'candidate'
                  ? '0 6px 18px -3px rgba(15, 118, 110, 0.18)'
                  : '0 1px 3px rgba(0, 0, 0, 0.02)',
              outline: 'none',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '220px',
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = '2px solid var(--accent-teal, #0F766E)';
              e.currentTarget.style.outlineOffset = '2px';
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = 'none';
            }}
            onMouseEnter={(e) => {
              if (selectedRole !== 'candidate') {
                e.currentTarget.style.borderColor = 'var(--accent-teal, #0F766E)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedRole !== 'candidate') {
                e.currentTarget.style.borderColor = 'var(--border-default, #E2E8F0)';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '8px',
                    backgroundColor:
                      selectedRole === 'candidate' ? '#0F766E' : 'var(--accent-teal-light, #F0FDFA)',
                    color: selectedRole === 'candidate' ? '#FFFFFF' : 'var(--accent-teal, #0F766E)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <User size={22} />
                </div>

                {selectedRole === 'candidate' ? (
                  <CheckCircle2 size={22} color="var(--accent-teal, #0F766E)" />
                ) : (
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: '1.5px solid var(--border-default, #CBD5E1)',
                    }}
                  />
                )}
              </div>

              <h3
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: 'var(--text-primary, #0F172A)',
                  margin: '0 0 0.35rem 0',
                }}
              >
                I'm looking for a job
              </h3>
              <p
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary, #64748B)',
                  lineHeight: 1.45,
                  margin: '0 0 0.85rem 0',
                }}
              >
                Browse roles and get matched
              </p>

              {/* Feature Bullets */}
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.45rem',
                }}
              >
                <li
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.45rem',
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary, #475569)',
                    lineHeight: 1.4,
                  }}
                >
                  <span
                    style={{
                      color: 'var(--accent-teal, #0F766E)',
                      fontWeight: 700,
                      lineHeight: 1,
                      marginTop: '0.15rem',
                    }}
                  >
                    ✓
                  </span>
                  <span>Get an AI match score for every role</span>
                </li>
                <li
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.45rem',
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary, #475569)',
                    lineHeight: 1.4,
                  }}
                >
                  <span
                    style={{
                      color: 'var(--accent-teal, #0F766E)',
                      fontWeight: 700,
                      lineHeight: 1,
                      marginTop: '0.15rem',
                    }}
                  >
                    ✓
                  </span>
                  <span>Track your applications</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 2: Recruiter Option */}
          <div
            id="role-card-recruiter"
            role="radio"
            aria-checked={selectedRole === 'recruiter'}
            aria-label="Hiring talent: Post jobs and check JD quality, and rank candidates on a Kanban board"
            tabIndex={0}
            onClick={() => setSelectedRole('recruiter')}
            onKeyDown={(e) => handleKeyDown(e, 'recruiter')}
            style={{
              padding: '1.75rem 1.5rem',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
              border:
                selectedRole === 'recruiter'
                  ? '2px solid var(--accent-teal, #0F766E)'
                  : '1.5px solid var(--border-default, #E2E8F0)',
              backgroundColor:
                selectedRole === 'recruiter'
                  ? 'var(--accent-teal-light, #F0FDFA)'
                  : '#FFFFFF',
              boxShadow:
                selectedRole === 'recruiter'
                  ? '0 6px 18px -3px rgba(15, 118, 110, 0.18)'
                  : '0 1px 3px rgba(0, 0, 0, 0.02)',
              outline: 'none',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '220px',
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = '2px solid var(--accent-teal, #0F766E)';
              e.currentTarget.style.outlineOffset = '2px';
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = 'none';
            }}
            onMouseEnter={(e) => {
              if (selectedRole !== 'recruiter') {
                e.currentTarget.style.borderColor = 'var(--accent-teal, #0F766E)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedRole !== 'recruiter') {
                e.currentTarget.style.borderColor = 'var(--border-default, #E2E8F0)';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '8px',
                    backgroundColor:
                      selectedRole === 'recruiter' ? '#0F766E' : 'var(--accent-teal-light, #F0FDFA)',
                    color: selectedRole === 'recruiter' ? '#FFFFFF' : 'var(--accent-teal, #0F766E)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Briefcase size={22} />
                </div>

                {selectedRole === 'recruiter' ? (
                  <CheckCircle2 size={22} color="var(--accent-teal, #0F766E)" />
                ) : (
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: '1.5px solid var(--border-default, #CBD5E1)',
                    }}
                  />
                )}
              </div>

              <h3
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: 'var(--text-primary, #0F172A)',
                  margin: '0 0 0.35rem 0',
                }}
              >
                I'm hiring talent
              </h3>
              <p
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary, #64748B)',
                  lineHeight: 1.45,
                  margin: '0 0 0.85rem 0',
                }}
              >
                Post jobs and evaluate candidates
              </p>

              {/* Feature Bullets */}
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.45rem',
                }}
              >
                <li
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.45rem',
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary, #475569)',
                    lineHeight: 1.4,
                  }}
                >
                  <span
                    style={{
                      color: 'var(--accent-teal, #0F766E)',
                      fontWeight: 700,
                      lineHeight: 1,
                      marginTop: '0.15rem',
                    }}
                  >
                    ✓
                  </span>
                  <span>Post jobs and check JD quality</span>
                </li>
                <li
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.45rem',
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary, #475569)',
                    lineHeight: 1.4,
                  }}
                >
                  <span
                    style={{
                      color: 'var(--accent-teal, #0F766E)',
                      fontWeight: 700,
                      lineHeight: 1,
                      marginTop: '0.15rem',
                    }}
                  >
                    ✓
                  </span>
                  <span>Rank candidates on a Kanban board</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Continue Button & Informative Footer */}
        <div>
          <button
            type="button"
            onClick={handleContinue}
            disabled={!selectedRole || submitting}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '0.85rem 1.5rem',
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              cursor: !selectedRole || submitting ? 'not-allowed' : 'pointer',
              backgroundColor: !selectedRole
                ? '#8FAFA8'
                : 'var(--accent-teal, #0F6B5C)',
              color: '#FFFFFF',
              border: !selectedRole ? '1px solid #7FA29B' : '1px solid transparent',
              boxShadow: selectedRole && !submitting ? '0 4px 14px rgba(15, 107, 92, 0.25)' : 'none',
              transition: 'all 0.18s ease',
            }}
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Saving your workspace...</span>
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>

          <p
            style={{
              fontSize: '0.82rem',
              color: 'var(--text-muted, #64748B)',
              marginTop: '1.15rem',
              marginBottom: 0,
            }}
          >
            Your choice decides what you see in Aptly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
