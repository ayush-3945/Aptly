import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Zap,
  Target,
  Terminal,
  FileCheck,
  UserCheck,
  Briefcase,
  Sparkles,
  Loader2,
  HelpCircle,
  RotateCcw,
  Sliders,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// 3 Archetype Candidate Profiles for Sample Switcher
const SAMPLE_CANDIDATES = {
  strong: {
    id: 'strong',
    label: 'Strong match',
    badgeText: 'Strong Match',
    badgeBg: 'rgba(45, 122, 58, 0.1)',
    badgeColor: 'var(--semantic-green)',
    badgeBorder: '1px solid rgba(45, 122, 58, 0.25)',
    roleTitle: 'Full-Stack MERN Systems Engineer',
    targetScore: 88,
    formulaMath: '90×0.4 + 85×0.3 + 90×0.2 + 80×0.1 = 88%',
    subScores: {
      skills: 90,
      experience: 85,
      domain: 90,
      education: 80,
    },
    matchedSkills: [
      { name: 'React.js', reason: 'Demonstrates 4+ years building high-throughput UI client architectures.' },
      { name: 'Node.js', reason: 'Extensive production experience developing asynchronous RESTful microservices.' },
      { name: 'Express', reason: 'Used extensively for modular middleware, route guards, and payload validation.' },
      { name: 'MongoDB', reason: 'Hands-on aggregation pipelines and index optimization on high-volume collections.' },
      { name: 'PostgreSQL', reason: 'Solid relational database schema modeling and transaction management.' },
      { name: 'REST APIs', reason: 'Designed clean, versioned public and internal API specifications.' },
      { name: 'Git', reason: 'Proficient with trunk-based development, branch protection, and code reviews.' },
    ],
    missingSkills: [
      {
        name: 'Docker Containerization',
        reason: 'Required by role for container orchestration, but not listed in candidate resume.',
        tip: 'Build a multi-container Docker Compose setup for a React + Node app and push to GitHub.',
      },
      {
        name: 'Kubernetes Orchestration',
        reason: 'Production cluster management needed for enterprise deployment pipeline.',
        tip: 'Practice deploying a local Minikube cluster with deployment manifests and service ingresses.',
      },
    ],
    summary:
      'Subject candidate profile demonstrates robust technical proficiency across full-stack MERN engineering, asynchronous API architectures, and REST services. Strong alignment with target role requirements.',
  },
  moderate: {
    id: 'moderate',
    label: 'Moderate match',
    badgeText: 'Moderate Match',
    badgeBg: 'rgba(180, 83, 9, 0.1)',
    badgeColor: 'var(--semantic-amber)',
    badgeBorder: '1px solid rgba(180, 83, 9, 0.25)',
    roleTitle: 'Full-Stack Software Engineer',
    targetScore: 66,
    formulaMath: '65×0.4 + 70×0.3 + 60×0.2 + 70×0.1 = 66%',
    subScores: {
      skills: 65,
      experience: 70,
      domain: 60,
      education: 70,
    },
    matchedSkills: [
      { name: 'React.js', reason: 'Demonstrated frontend SPA component development and state management.' },
      { name: 'Node.js', reason: 'Practical backend runtime usage for lightweight services and scripts.' },
      { name: 'REST APIs', reason: 'Consumed and built standard CRUD endpoints for internal tools.' },
      { name: 'Git', reason: 'Familiar with standard GitHub PR workflows and version control.' },
    ],
    missingSkills: [
      {
        name: 'MongoDB',
        reason: 'Core primary database for the platform; candidate primarily used SQLite.',
        tip: 'Complete MongoDB University free fundamentals and model a realistic document schema.',
      },
      {
        name: 'PostgreSQL',
        reason: 'Complex queries and relational joins required for financial reporting.',
        tip: 'Write complex SQL queries involving window functions and explain-plan analysis.',
      },
      {
        name: 'Docker Containerization',
        reason: 'Mandatory for local dev parity and CI/CD staging environments.',
        tip: 'Containerize an existing Node.js API with a lightweight Alpine Dockerfile.',
      },
      {
        name: 'System Design',
        reason: 'Role requires designing for high concurrency and distributed caching.',
        tip: 'Study distributed caching patterns using Redis and message queues.',
      },
    ],
    summary:
      'Solid frontend and JavaScript foundation with practical REST API experience. Needs further hands-on experience with production database optimization and containerized deployment.',
  },
  low: {
    id: 'low',
    label: 'Low match',
    badgeText: 'Low Match',
    badgeBg: 'rgba(185, 28, 28, 0.08)',
    badgeColor: 'var(--semantic-red)',
    badgeBorder: '1px solid rgba(185, 28, 28, 0.22)',
    roleTitle: 'Junior Web Developer',
    targetScore: 38,
    formulaMath: '35×0.4 + 40×0.3 + 30×0.2 + 60×0.1 = 38%',
    subScores: {
      skills: 35,
      experience: 40,
      domain: 30,
      education: 60,
    },
    matchedSkills: [
      { name: 'HTML/CSS', reason: 'Good understanding of semantic markup and responsive flexbox layouts.' },
      { name: 'JavaScript', reason: 'Basic ES6 scripting and DOM manipulation on frontend landing pages.' },
      { name: 'Git', reason: 'Familiar with commit, push, pull, and basic GitHub repository usage.' },
    ],
    missingSkills: [
      {
        name: 'React.js',
        reason: 'Role requires advanced hooks, context, and modern component architecture.',
        tip: 'Build 2 full-stack React projects utilizing custom hooks, Vite, and state managers.',
      },
      {
        name: 'Node.js & Express',
        reason: 'Backend services require robust middleware, authentication, and error handling.',
        tip: 'Construct an end-to-end Express REST API with JWT authentication and rate limiting.',
      },
      {
        name: 'MongoDB & PostgreSQL',
        reason: 'Required for schema design, indexing, and data persistence layers.',
        tip: 'Build a database-backed CRUD application using Mongoose or Prisma ORM.',
      },
      {
        name: 'Docker',
        reason: 'Platform relies on containerized microservices deployment.',
        tip: 'Learn container basics and run multi-service development stacks locally.',
      },
    ],
    summary:
      'Early-career background with foundational web development skills. Lacks required depth in production backend frameworks and scalable database architectures.',
  },
};

/**
 * Interactive Skill Chip with Accessible Hover & Mobile Tap Tooltip
 */
const SkillChip = ({ skill, isGap }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={() => setShowTooltip((prev) => !prev)}
    >
      <button
        type="button"
        aria-label={`${skill.name}: ${isGap ? 'Skill gap' : 'Matched skill'}`}
        style={{
          fontSize: '0.76rem',
          padding: '0.22rem 0.6rem',
          background: isGap ? 'rgba(185, 28, 28, 0.08)' : 'var(--accent-teal-light)',
          border: `1px solid ${isGap ? 'rgba(185, 28, 28, 0.25)' : 'rgba(15, 107, 92, 0.25)'}`,
          borderRadius: '4px',
          color: isGap ? 'var(--semantic-red)' : 'var(--accent-teal)',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          transition: 'all 0.15s ease',
        }}
      >
        <span>{skill.name}</span>
        <HelpCircle size={11} style={{ opacity: 0.65 }} />
      </button>

      {showTooltip && (
        <div
          role="tooltip"
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'clamp(210px, 75vw, 280px)',
            background: '#1E293B',
            color: '#F8FAFC',
            padding: '0.65rem 0.8rem',
            borderRadius: '6px',
            fontSize: '0.74rem',
            lineHeight: 1.45,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
            zIndex: 100,
            pointerEvents: 'none',
            textAlign: 'left',
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: '0.76rem',
              marginBottom: '0.2rem',
              color: isGap ? '#FCA5A5' : '#5EEAD4',
            }}
          >
            {isGap ? 'Missing Skill Gap' : 'Matched Skill'}
          </div>
          <div style={{ color: '#E2E8F0', marginBottom: isGap ? '0.35rem' : 0 }}>
            {skill.reason}
          </div>
          {isGap && skill.tip && (
            <div
              style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                paddingTop: '0.35rem',
                color: '#93C5FD',
                fontSize: '0.72rem',
              }}
            >
              💡 <strong>Learning tip:</strong> {skill.tip}
            </div>
          )}
          {/* Arrow */}
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              borderWidth: '5px',
              borderStyle: 'solid',
              borderColor: '#1E293B transparent transparent transparent',
            }}
          />
        </div>
      )}
    </div>
  );
};

const Hero = () => {
  const [demoRoleLoading, setDemoRoleLoading] = useState(null); // 'recruiter' | 'candidate' | null
  const [wakeUpNotice, setWakeUpNotice] = useState(false);

  // 1. Interactive Sample Card Switcher & Animation State
  const [activeTab, setActiveTab] = useState('strong'); // 'strong' | 'moderate' | 'low'
  const currentCandidate = SAMPLE_CANDIDATES[activeTab];

  const cardRef = useRef(null);
  const [isCardInView, setIsCardInView] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);
  const [barsFilled, setBarsFilled] = useState(false);

  // 2. "How It Works" Auto-Advance State
  const [activeStep, setActiveStep] = useState(0);
  const [isStepPaused, setIsStepPaused] = useState(false);

  // 3. Free Match Playground State
  const [jobDescription, setJobDescription] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [playgroundLoading, setPlaygroundLoading] = useState(false);
  const [playgroundWakeUpNotice, setPlaygroundWakeUpNotice] = useState(false);
  const [playgroundResult, setPlaygroundResult] = useState(null);
  const [playgroundError, setPlaygroundError] = useState(null);

  const navigate = useNavigate();
  const { user, isAuthenticated, login } = useAuth();
  const { showToast } = useToast();

  // Scroll Reveal Observer
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
        el.classList.add('is-revealed');
      });
      return;
    }

    const elements = document.querySelectorAll('.reveal-on-scroll');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Card In-View Observer for Count-Up Trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsCardInView(true);
        }
      },
      { threshold: 0.25 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Animated Count-Up & Sub-Score Progress Fill
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setDisplayScore(currentCandidate.targetScore);
      setBarsFilled(true);
      return;
    }

    if (!isCardInView) return;

    setBarsFilled(false);
    setDisplayScore(0);

    const target = currentCandidate.targetScore;
    const duration = 750; // ms
    const startTime = performance.now();

    let animationFrame;
    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // Ease out cubic
      setDisplayScore(Math.round(ease * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      } else {
        setDisplayScore(target);
        setBarsFilled(true);
      }
    };

    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [isCardInView, activeTab]);

  // "How It Works" Auto-Advance (Every 3 seconds, paused on hover)
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || isStepPaused) return;

    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 3000);

    return () => clearInterval(timer);
  }, [isStepPaused]);

  // 1-Click Demo Login Handler
  const handle1ClickDemo = async (role) => {
    setDemoRoleLoading(role);
    setWakeUpNotice(false);

    const noticeTimer = setTimeout(() => {
      setWakeUpNotice(true);
    }, 2500);

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT')), 60000)
    );

    try {
      const email = role === 'recruiter' ? 'recruiter@aptly.ai' : 'candidate@aptly.ai';
      const loginPromise = login(email, 'password123');
      const res = await Promise.race([loginPromise, timeoutPromise]);
      clearTimeout(noticeTimer);
      showToast(`Signed in as demo ${role} (${res.name})!`, 'success');
      navigate('/dashboard');
    } catch (err) {
      clearTimeout(noticeTimer);
      console.error('Demo login error:', err);
      if (err.message === 'TIMEOUT') {
        showToast('Server is taking longer than expected to wake up. Please retry in a few seconds.', 'warning');
      } else {
        showToast('Server is waking up or temporarily busy. Please retry in a moment, or visit /login.', 'error');
      }
    } finally {
      setDemoRoleLoading(null);
      setWakeUpNotice(false);
    }
  };

  // Playground Sample Loaders
  const loadPlaygroundSenior = () => {
    setJobDescription(
      'Senior Full-Stack Engineer @ Acme Payments.\nRequirements:\n- 4+ years production experience with React and Node.js\n- Deep knowledge of Express, MongoDB, and PostgreSQL\n- Experience deploying with Docker containerization\n- Strong background in building REST APIs and Git workflows\n- B.S. in Computer Science or equivalent practical experience'
    );
    setResumeText(
      'Alex Rivera — Senior Software Engineer (5+ years)\n\nSummary: Full-stack engineer specialized in high-performance web applications and asynchronous API architectures.\n\nTechnical Skills: React, Node.js, Express, MongoDB, PostgreSQL, REST APIs, Git, JavaScript, TypeScript.\n\nExperience: Led backend architecture at a fintech startup, building high-throughput payment processing APIs handling 25k daily requests. Engineered component library in React.\n\nEducation: Bachelor of Science in Computer Science, 2020.'
    );
    setPlaygroundError(null);
    setPlaygroundResult(null);
  };

  const loadPlaygroundJunior = () => {
    setJobDescription(
      'Junior Full-Stack Developer @ Nova Logistics.\nRequirements:\n- 1-2 years experience with web development\n- Proficiency in JavaScript, HTML, CSS\n- Familiarity with React and Node.js\n- Experience with Git version control and REST APIs'
    );
    setResumeText(
      'Jordan Lee — Junior Web Developer (1 year)\n\nSkills: HTML, CSS, JavaScript, Git, Tailwind, basic React.\n\nExperience: Junior Developer at a creative agency building responsive websites and consuming third-party REST APIs. Maintained client portals and optimized page speed.\n\nEducation: Associate Degree in Information Technology, 2023.'
    );
    setPlaygroundError(null);
    setPlaygroundResult(null);
  };

  const handlePlaygroundSubmit = async (e) => {
    e.preventDefault();
    if (!jobDescription.trim() || !resumeText.trim()) {
      setPlaygroundError('Please provide both a job description and resume text to check match.');
      return;
    }

    setPlaygroundLoading(true);
    setPlaygroundError(null);
    setPlaygroundResult(null);
    setPlaygroundWakeUpNotice(false);

    const wakeUpTimer = setTimeout(() => {
      setPlaygroundWakeUpNotice(true);
    }, 2500);

    try {
      const response = await fetch('/api/public/quick-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription, resumeText }),
      });

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After') || data.retryAfterSeconds;
          const mins = retryAfter ? Math.max(1, Math.ceil(Number(retryAfter) / 60)) : data.minutesRemaining || 15;
          throw new Error(
            data.error ||
              `Quick-check limit reached (10 requests per 15 minutes). Please wait ~${mins} minute${mins > 1 ? 's' : ''} before trying again, or sign in for full AI evaluation.`
          );
        }
        if (response.status === 413) {
          throw new Error(
            data.error || 'Text size exceeds the 20KB limit for public quick-match. Please reduce the length.'
          );
        }
        throw new Error(data.error || 'Failed to compute match score.');
      }

      setPlaygroundResult(data);
    } catch (err) {
      setPlaygroundError(err.message || 'Error running match check. Please retry.');
    } finally {
      clearTimeout(wakeUpTimer);
      setPlaygroundLoading(false);
      setPlaygroundWakeUpNotice(false);
    }
  };

  return (
    <section style={{ padding: '4.5rem 0 5rem', position: 'relative', background: 'var(--bg-primary)' }}>
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* =========================================================================
            SECTION 1: Hero Title, Subtitle, Built with Strip, Demo Actions
            ========================================================================= */}
        <div className="reveal-on-scroll" style={{ textAlign: 'center', maxWidth: '880px', margin: '0 auto 3rem' }}>
          <h1
            style={{
              fontFamily: "'Newsreader', 'Charter', Georgia, serif",
              fontSize: 'clamp(2.5rem, 5.5vw, 4.2rem)',
              lineHeight: 1.12,
              marginBottom: '1.35rem',
              letterSpacing: '-0.025em',
              color: 'var(--text-primary)',
            }}
          >
            Stop Losing Top Talent to <br />
            <span style={{ color: 'var(--accent-teal)', fontWeight: 700 }}>Blind ATS Keyword Filters</span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(1.05rem, 2vw, 1.22rem)',
              color: 'var(--text-secondary)',
              maxWidth: '680px',
              margin: '0 auto 1.5rem',
              lineHeight: 1.6,
            }}
          >
            Aptly.AI scores candidates on real skills, not just keywords, and shows them exactly what to improve.
          </p>

          {/* Built with Strip - Appears only once */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.35rem 0.95rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              color: 'var(--text-secondary)',
              marginBottom: '2rem',
              boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
            }}
          >
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Built with:</span>
            <span>React 19</span>
            <span style={{ opacity: 0.4 }}>•</span>
            <span>Node.js / Express</span>
            <span style={{ opacity: 0.4 }}>•</span>
            <span>MongoDB</span>
            <span style={{ opacity: 0.4 }}>•</span>
            <span style={{ color: 'var(--accent-teal)', fontWeight: 600 }}>Google Gemini</span>
          </div>

          {/* Hero Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {isAuthenticated && user ? (
              <Link
                to="/dashboard"
                className="btn btn-primary"
                style={{
                  padding: '0.8rem 1.85rem',
                  fontSize: '0.98rem',
                  borderRadius: '4px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span>Go to Dashboard</span>
                <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <button
                  type="button"
                  disabled={Boolean(demoRoleLoading)}
                  onClick={() => handle1ClickDemo('recruiter')}
                  className="btn btn-primary"
                  style={{
                    padding: '0.8rem 1.65rem',
                    fontSize: '0.95rem',
                    borderRadius: '4px',
                    fontWeight: 600,
                    cursor: demoRoleLoading ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  {demoRoleLoading === 'recruiter' ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <Briefcase size={16} />
                      <span>Try Demo as Recruiter</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={Boolean(demoRoleLoading)}
                  onClick={() => handle1ClickDemo('candidate')}
                  className="btn btn-secondary"
                  style={{
                    padding: '0.8rem 1.65rem',
                    fontSize: '0.95rem',
                    borderRadius: '4px',
                    fontWeight: 600,
                    cursor: demoRoleLoading ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  {demoRoleLoading === 'candidate' ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <UserCheck size={16} color="var(--accent-teal)" />
                      <span>Try Demo as Candidate</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>

          {/* Cold-start wake-up notification */}
          {demoRoleLoading && wakeUpNotice && (
            <div
              style={{
                marginTop: '1rem',
                fontSize: '0.84rem',
                color: 'var(--accent-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontWeight: 500,
              }}
            >
              <Loader2 size={15} className="animate-spin" />
              <span>Waking up server... this can take up to a minute</span>
            </div>
          )}
        </div>

        {/* =========================================================================
            SECTION 2: Interactive Animated Sample Card & 3-Tab Switcher
            ========================================================================= */}
        <div id="preview" className="reveal-on-scroll" style={{ maxWidth: '940px', margin: '0 auto' }}>
          {/* 3 Tabs Switcher */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
              marginBottom: '0.85rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <Sliders size={14} color="var(--accent-teal)" />
              <span style={{ fontWeight: 600 }}>Interactive candidate archetypes:</span>
            </div>

            <div
              role="tablist"
              aria-label="Candidate Archetypes"
              style={{
                display: 'inline-flex',
                flexWrap: 'wrap',
                maxWidth: '100%',
                background: 'var(--bg-secondary)',
                padding: '0.25rem',
                borderRadius: '6px',
                border: '1px solid var(--border-default)',
                gap: '0.25rem',
              }}
            >
              {Object.values(SAMPLE_CANDIDATES).map((cand) => {
                const isActive = activeTab === cand.id;
                return (
                  <button
                    key={cand.id}
                    id={`tab-${cand.id}`}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls="sample-evaluation-panel"
                    tabIndex={isActive ? 0 : -1}
                    type="button"
                    onClick={() => setActiveTab(cand.id)}
                    style={{
                      border: 'none',
                      background: isActive ? '#FFFFFF' : 'transparent',
                      color: isActive ? 'var(--accent-teal)' : 'var(--text-secondary)',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '0.8rem',
                      padding: '0.35rem 0.85rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <span>{cand.label}</span>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        opacity: 0.8,
                        fontFamily: 'monospace',
                        fontWeight: 700,
                      }}
                    >
                      ({cand.targetScore}%)
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sample Card */}
          <div
            ref={cardRef}
            id="sample-evaluation-panel"
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
            className="paper-card interactive-card"
            style={{
              padding: '1.75rem',
              border: '1px solid var(--border-default)',
              borderRadius: '6px',
              background: 'var(--bg-card)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
            }}
          >
            {/* Header of preview card */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                borderBottom: '1px solid var(--border-default)',
                paddingBottom: '1.15rem',
                marginBottom: '1.35rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '4px',
                    background: 'var(--accent-teal-light)',
                    border: '1px solid rgba(15, 107, 92, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Terminal size={18} color="var(--accent-teal)" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                    <h4 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {currentCandidate.roleTitle}
                    </h4>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        padding: '0.12rem 0.5rem',
                        background: 'rgba(15, 107, 92, 0.08)',
                        color: 'var(--accent-teal)',
                        borderRadius: '3px',
                        fontWeight: 700,
                        letterSpacing: '0.03em',
                        textTransform: 'uppercase',
                      }}
                    >
                      Sample evaluation
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Sample candidate • Acme Payments
                  </div>
                </div>
              </div>

              {/* Animated Target Match Score */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.3rem 0.75rem',
                    borderRadius: '4px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    background: currentCandidate.badgeBg,
                    color: currentCandidate.badgeColor,
                    border: currentCandidate.badgeBorder,
                  }}
                >
                  <CheckCircle2 size={13} />
                  {currentCandidate.badgeText}
                </span>

                <div
                  style={{
                    padding: '0.3rem 0.75rem',
                    background: 'var(--accent-teal-light)',
                    border: '1px solid rgba(15, 107, 92, 0.25)',
                    borderRadius: '4px',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    color: 'var(--accent-teal)',
                    fontFamily: 'monospace',
                    minWidth: '78px',
                    textAlign: 'center',
                  }}
                >
                  {displayScore}% Fit
                </div>
              </div>
            </div>

            {/* Sub-Score Breakdown: Real 40/30/20/10 Formula Math */}
            <div
              style={{
                marginBottom: '1.35rem',
                padding: '0.95rem 1.15rem',
                background: 'var(--bg-primary)',
                borderRadius: '4px',
                border: '1px solid var(--border-default)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.75rem',
                  flexWrap: 'wrap',
                  gap: '0.4rem',
                }}
              >
                <span
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  How the score is built
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-teal)', fontWeight: 600, fontFamily: 'monospace' }}>
                  {currentCandidate.formulaMath}
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '0.85rem',
                }}
              >
                {/* Skills 40% */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Skills (40%)</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{currentCandidate.subScores.skills}%</span>
                  </div>
                  <div style={{ height: '5px', background: 'var(--border-default)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: barsFilled ? `${currentCandidate.subScores.skills}%` : '0%',
                        height: '100%',
                        background: 'var(--accent-teal)',
                        borderRadius: '3px',
                        transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    />
                  </div>
                </div>

                {/* Experience 30% */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Experience (30%)</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{currentCandidate.subScores.experience}%</span>
                  </div>
                  <div style={{ height: '5px', background: 'var(--border-default)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: barsFilled ? `${currentCandidate.subScores.experience}%` : '0%',
                        height: '100%',
                        background: 'var(--accent-teal)',
                        borderRadius: '3px',
                        transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    />
                  </div>
                </div>

                {/* Domain 20% */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Domain (20%)</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{currentCandidate.subScores.domain}%</span>
                  </div>
                  <div style={{ height: '5px', background: 'var(--border-default)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: barsFilled ? `${currentCandidate.subScores.domain}%` : '0%',
                        height: '100%',
                        background: 'var(--accent-teal)',
                        borderRadius: '3px',
                        transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    />
                  </div>
                </div>

                {/* Education 10% */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Education (10%)</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{currentCandidate.subScores.education}%</span>
                  </div>
                  <div style={{ height: '5px', background: 'var(--border-default)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: barsFilled ? `${currentCandidate.subScores.education}%` : '0%',
                        height: '100%',
                        background: 'var(--accent-teal)',
                        borderRadius: '3px',
                        transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Skills Grid with Hover/Tap Tooltips */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
                gap: '1.35rem',
                marginBottom: '1.35rem',
              }}
            >
              <div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.01em' }}>
                  Skills you have (hover or tap for details):
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginTop: '0.6rem' }}>
                  {currentCandidate.matchedSkills.map((skill) => (
                    <SkillChip key={skill.name} skill={skill} isGap={false} />
                  ))}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.01em' }}>
                  Missing skills (hover or tap for action tips):
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginTop: '0.6rem' }}>
                  {currentCandidate.missingSkills.map((skill) => (
                    <SkillChip key={skill.name} skill={skill} isGap={true} />
                  ))}
                </div>
              </div>
            </div>

            {/* AI Summary Quotebox */}
            <div
              style={{
                background: 'var(--bg-primary)',
                borderRadius: '4px',
                padding: '0.9rem 1.15rem',
                borderLeft: '3px solid var(--accent-teal)',
                borderTop: '1px solid var(--border-default)',
                borderRight: '1px solid var(--border-default)',
                borderBottom: '1px solid var(--border-default)',
                fontSize: '0.88rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.55,
              }}
            >
              <span
                style={{
                  color: 'var(--accent-teal)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'block',
                  marginBottom: '0.3rem',
                }}
              >
                AI summary:
              </span>
              {currentCandidate.summary}
            </div>

            {/* Card Action Bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                marginTop: '1.35rem',
                paddingTop: '1.15rem',
                borderTop: '1px solid var(--border-default)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <ShieldCheck size={15} color="var(--accent-teal)" />
                <span>AI Evaluation Engine • Graceful fallback if AI is offline</span>
              </div>

              <div>
                <a
                  href="#playground"
                  className="btn btn-primary"
                  style={{
                    fontSize: '0.84rem',
                    padding: '0.5rem 1.25rem',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                  }}
                >
                  <span>Try it with your own resume</span>
                  <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION 3: "How It Works" 3-Step Auto-Advancing Pipeline
            ========================================================================= */}
        <div className="reveal-on-scroll" style={{ marginTop: '4.5rem', textAlign: 'center' }}>
          <div
            style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--accent-teal)',
              marginBottom: '0.4rem',
            }}
          >
            Evaluation Pipeline
          </div>
          <h2
            style={{
              fontFamily: "'Newsreader', 'Charter', Georgia, serif",
              fontSize: 'clamp(1.75rem, 3.2vw, 2.3rem)',
              color: 'var(--text-primary)',
              marginBottom: '0.6rem',
              letterSpacing: '-0.02em',
            }}
          >
            How Aptly.AI Works
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Auto-advances every 3s • Hover or focus to pause • Click any step to inspect
          </p>

          <div
            onMouseEnter={() => setIsStepPaused(true)}
            onMouseLeave={() => setIsStepPaused(false)}
            onFocus={() => setIsStepPaused(true)}
            onBlur={() => setIsStepPaused(false)}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
              gap: '1.35rem',
              textAlign: 'left',
            }}
          >
            {/* Step 1 */}
            <div
              tabIndex={0}
              role="button"
              aria-label={`Step 1: Upload & Parse${activeStep === 0 ? ' (selected)' : ''}`}
              onClick={() => setActiveStep(0)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveStep(0);
                }
              }}
              className="paper-card interactive-card"
              style={{
                padding: '1.6rem',
                background: 'var(--bg-card)',
                border: activeStep === 0 ? '1.5px solid var(--accent-teal)' : '1px solid var(--border-default)',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: activeStep === 0 ? '0 6px 20px rgba(15, 107, 92, 0.12)' : 'none',
                position: 'relative',
                transition: 'all 0.2s ease',
              }}
            >
              {activeStep === 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'var(--accent-teal)',
                    borderRadius: '6px 6px 0 0',
                  }}
                />
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '4px',
                    background: activeStep === 0 ? 'var(--accent-teal)' : 'var(--accent-teal-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <FileCheck size={18} color={activeStep === 0 ? '#FFFFFF' : 'var(--accent-teal)'} />
                </div>
                <span
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                    color: 'var(--accent-teal)',
                    opacity: activeStep === 0 ? 1 : 0.4,
                  }}
                >
                  01
                </span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                1. Upload & Parse
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: 1.55, margin: 0 }}>
                Upload your PDF resume. Aptly extracts machine text from your PDF and parses your experience.
              </p>
            </div>

            {/* Step 2 */}
            <div
              tabIndex={0}
              role="button"
              aria-label={`Step 2: AI Semantic Matching${activeStep === 1 ? ' (selected)' : ''}`}
              onClick={() => setActiveStep(1)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveStep(1);
                }
              }}
              className="paper-card interactive-card"
              style={{
                padding: '1.6rem',
                background: 'var(--bg-card)',
                border: activeStep === 1 ? '1.5px solid var(--accent-teal)' : '1px solid var(--border-default)',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: activeStep === 1 ? '0 6px 20px rgba(15, 107, 92, 0.12)' : 'none',
                position: 'relative',
                transition: 'all 0.2s ease',
              }}
            >
              {activeStep === 1 && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'var(--accent-teal)',
                    borderRadius: '6px 6px 0 0',
                  }}
                />
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '4px',
                    background: activeStep === 1 ? 'var(--semantic-green)' : 'rgba(45, 122, 58, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Sparkles size={18} color={activeStep === 1 ? '#FFFFFF' : 'var(--semantic-green)'} />
                </div>
                <span
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                    color: 'var(--semantic-green)',
                    opacity: activeStep === 1 ? 1 : 0.4,
                  }}
                >
                  02
                </span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                2. AI Semantic Matching
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: 1.55, margin: 0 }}>
                Evaluates your real skills, project depth, and experience against role requirements.
              </p>
            </div>

            {/* Step 3 */}
            <div
              tabIndex={0}
              role="button"
              aria-label={`Step 3: Scorecard & Pipeline${activeStep === 2 ? ' (selected)' : ''}`}
              onClick={() => setActiveStep(2)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveStep(2);
                }
              }}
              className="paper-card interactive-card"
              style={{
                padding: '1.6rem',
                background: 'var(--bg-card)',
                border: activeStep === 2 ? '1.5px solid var(--accent-teal)' : '1px solid var(--border-default)',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: activeStep === 2 ? '0 6px 20px rgba(15, 107, 92, 0.12)' : 'none',
                position: 'relative',
                transition: 'all 0.2s ease',
              }}
            >
              {activeStep === 2 && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'var(--accent-teal)',
                    borderRadius: '6px 6px 0 0',
                  }}
                />
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '4px',
                    background: activeStep === 2 ? 'var(--accent-teal)' : 'var(--accent-teal-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Target size={18} color={activeStep === 2 ? '#FFFFFF' : 'var(--accent-teal)'} />
                </div>
                <span
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                    color: 'var(--accent-teal)',
                    opacity: activeStep === 2 ? 1 : 0.4,
                  }}
                >
                  03
                </span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                3. Scorecard & Pipeline
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: 1.55, margin: 0 }}>
                Recruiters view ranked candidates in a Kanban pipeline; candidates see clear feedback and next steps.
              </p>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION 4: Free Interactive Playground ("Try it now", no login needed)
            ========================================================================= */}
        <div id="playground" className="reveal-on-scroll" style={{ marginTop: '5rem', maxWidth: '940px', margin: '5rem auto 0' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--accent-teal)',
                marginBottom: '0.4rem',
              }}
            >
              Public Sandbox
            </div>
            <h2
              style={{
                fontFamily: "'Newsreader', 'Charter', Georgia, serif",
                fontSize: 'clamp(1.8rem, 3.2vw, 2.35rem)',
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                marginBottom: '0.6rem',
              }}
            >
              Try the ATS Matcher Live
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', maxWidth: '620px', margin: '0 auto' }}>
              Paste any job description and resume snippet below to test rule-based keyword matching instantly. No signup required.
            </p>

            {/* Quick Fill Sample Buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={loadPlaygroundSenior}
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem' }}
              >
                <span>Sample: Senior MERN Engineer</span>
              </button>
              <button
                type="button"
                onClick={loadPlaygroundJunior}
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem' }}
              >
                <span>Sample: Junior Developer</span>
              </button>
              {(jobDescription || resumeText) && (
                <button
                  type="button"
                  onClick={() => {
                    setJobDescription('');
                    setResumeText('');
                    setPlaygroundResult(null);
                    setPlaygroundError(null);
                  }}
                  className="btn btn-ghost"
                  style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}
                >
                  <RotateCcw size={13} />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          <form
            onSubmit={handlePlaygroundSubmit}
            className="paper-card"
            style={{
              padding: '1.85rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: '6px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
              {/* Job Description Textarea */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label htmlFor="playground-jd" style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Job Description / Prerequisites
                  </label>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      color: jobDescription.length > 2800 ? 'var(--semantic-red)' : 'var(--text-muted)',
                      fontFamily: 'monospace',
                    }}
                  >
                    {jobDescription.length}/3000
                  </span>
                </div>
                <textarea
                  id="playground-jd"
                  rows={6}
                  maxLength={3000}
                  placeholder="Paste target job prerequisites (e.g. React, Node.js, Express, MongoDB, Docker, 4+ years experience)..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '0.86rem', resize: 'vertical', minHeight: '140px', lineHeight: 1.5 }}
                />
              </div>

              {/* Resume Text Textarea */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label htmlFor="playground-resume" style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Resume Experience & Skills
                  </label>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      color: resumeText.length > 2800 ? 'var(--semantic-red)' : 'var(--text-muted)',
                      fontFamily: 'monospace',
                    }}
                  >
                    {resumeText.length}/3000
                  </span>
                </div>
                <textarea
                  id="playground-resume"
                  rows={6}
                  maxLength={3000}
                  placeholder="Paste candidate background or skills summary (e.g. 4 years of experience with React, Node.js, Express, Bachelor in CS)..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '0.86rem', resize: 'vertical', minHeight: '140px', lineHeight: 1.5 }}
                />
              </div>
            </div>

            {/* Privacy Notice Under Textareas */}
            <div
              style={{
                fontSize: '0.76rem',
                color: 'var(--text-muted)',
                marginBottom: '1.15rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <span>🔒 Don't paste personal data. Text is not saved.</span>
            </div>

            {/* Error Notification */}
            {playgroundError && (
              <div
                style={{
                  background: 'rgba(185, 28, 28, 0.08)',
                  border: '1px solid rgba(185, 28, 28, 0.25)',
                  borderRadius: '4px',
                  padding: '0.75rem 1rem',
                  fontSize: '0.82rem',
                  color: 'var(--semantic-red)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1.25rem',
                }}
              >
                <AlertTriangle size={15} style={{ flexShrink: 0 }} />
                <span>{playgroundError}</span>
              </div>
            )}

            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Rule-based matcher • 10 req / 15 min per IP • 0 data stored
              </div>

              <button
                type="submit"
                disabled={playgroundLoading || !jobDescription.trim() || !resumeText.trim()}
                className="btn btn-primary"
                style={{
                  padding: '0.65rem 1.45rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  opacity: playgroundLoading || !jobDescription.trim() || !resumeText.trim() ? 0.6 : 1,
                  cursor: playgroundLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {playgroundLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Analyzing Match...</span>
                  </>
                ) : (
                  <>
                    <Zap size={15} />
                    <span>Check Match</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Playground Result Card */}
          {playgroundLoading && (
            <div
              className="paper-card"
              style={{
                marginTop: '1.5rem',
                padding: '2rem',
                border: '1px dashed var(--border-default)',
                borderRadius: '6px',
                textAlign: 'center',
                background: 'var(--bg-card)',
              }}
            >
              <Loader2 size={28} className="animate-spin" style={{ color: 'var(--accent-teal)', margin: '0 auto 0.75rem' }} />
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Checking keyword alignment against prerequisites...
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Rule-based keyword matching (Skills evaluation)
              </div>

              {playgroundWakeUpNotice && (
                <div
                  style={{
                    marginTop: '1.15rem',
                    fontSize: '0.82rem',
                    color: 'var(--accent-teal)',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.35rem 0.75rem',
                    background: 'var(--accent-teal-light)',
                    borderRadius: '4px',
                    border: '1px solid rgba(15, 107, 92, 0.25)',
                  }}
                >
                  <Loader2 size={14} className="animate-spin" />
                  <span>Waking up server... this can take up to a minute</span>
                </div>
              )}
            </div>
          )}

          {!playgroundLoading && playgroundResult && (
            <div style={{ marginTop: '1.5rem' }}>
              {/* Label above the playground result */}
              <div
                style={{
                  marginBottom: '0.85rem',
                  padding: '0.65rem 1rem',
                  background: 'rgba(15, 107, 92, 0.08)',
                  border: '1px solid rgba(15, 107, 92, 0.22)',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  color: 'var(--accent-teal)',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Sliders size={15} style={{ flexShrink: 0 }} />
                <span>Quick check (rule-based keyword matching). Full AI evaluation runs after login.</span>
              </div>

              <div
                className="paper-card"
                style={{
                  padding: '1.65rem',
                  border: '1px solid var(--border-default)',
                  borderRadius: '6px',
                  background: 'var(--bg-card)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                  animation: 'fadeIn 0.25s ease-out forwards',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid var(--border-default)',
                    paddingBottom: '1rem',
                    marginBottom: '1.25rem',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Quick Check Scorecard
                    </h4>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Rule-based keyword match result
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.3rem 0.75rem',
                        borderRadius: '4px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        background:
                          (playgroundResult.scoreBreakdown?.skills ?? playgroundResult.matchScore) >= 75
                            ? 'rgba(45, 122, 58, 0.1)'
                            : (playgroundResult.scoreBreakdown?.skills ?? playgroundResult.matchScore) >= 45
                            ? 'rgba(180, 83, 9, 0.1)'
                            : 'rgba(185, 28, 28, 0.08)',
                        color:
                          (playgroundResult.scoreBreakdown?.skills ?? playgroundResult.matchScore) >= 75
                            ? 'var(--semantic-green)'
                            : (playgroundResult.scoreBreakdown?.skills ?? playgroundResult.matchScore) >= 45
                            ? 'var(--semantic-amber)'
                            : 'var(--semantic-red)',
                        border: `1px solid ${
                          (playgroundResult.scoreBreakdown?.skills ?? playgroundResult.matchScore) >= 75
                            ? 'rgba(45, 122, 58, 0.25)'
                            : (playgroundResult.scoreBreakdown?.skills ?? playgroundResult.matchScore) >= 45
                            ? 'rgba(180, 83, 9, 0.25)'
                            : 'rgba(185, 28, 28, 0.22)'
                        }`,
                      }}
                    >
                      <CheckCircle2 size={13} />
                      {playgroundResult.recommendation}
                    </span>

                    <div
                      style={{
                        padding: '0.3rem 0.75rem',
                        background: 'var(--accent-teal-light)',
                        border: '1px solid rgba(15, 107, 92, 0.25)',
                        borderRadius: '4px',
                        fontWeight: 700,
                        fontSize: '0.92rem',
                        color: 'var(--accent-teal)',
                        fontFamily: 'monospace',
                      }}
                    >
                      {playgroundResult.scoreBreakdown?.skills ?? playgroundResult.matchScore}% Skills Match
                    </div>
                  </div>
                </div>

                {/* Single Skills Match Progress Bar - Experience, Domain and Education hidden since they lack real relational signals in rule matcher */}
                <div
                  style={{
                    marginBottom: '1.25rem',
                    padding: '0.95rem 1.15rem',
                    background: 'var(--bg-primary)',
                    borderRadius: '4px',
                    border: '1px solid var(--border-default)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Skills Match (Keyword Overlap)
                    </span>
                    <span style={{ fontSize: '0.84rem', color: 'var(--accent-teal)', fontWeight: 700, fontFamily: 'monospace' }}>
                      {playgroundResult.scoreBreakdown?.skills ?? playgroundResult.matchScore}%
                    </span>
                  </div>

                  <div style={{ height: '7px', background: 'var(--border-default)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${playgroundResult.scoreBreakdown?.skills ?? playgroundResult.matchScore}%`,
                        height: '100%',
                        background: 'var(--accent-teal)',
                        borderRadius: '4px',
                        transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.45rem' }}>
                    Based on {playgroundResult.matchedSkills?.length || 0} matched of {(playgroundResult.matchedSkills?.length || 0) + (playgroundResult.missingSkills?.length || 0)} detected required skills. Experience depth, domain nuance, and education are evaluated via AI after signing in.
                  </div>
                </div>

              {/* Matched & Missing Skills */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                    Matched Skills ({playgroundResult.matchedSkills?.length || 0}):
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                    {playgroundResult.matchedSkills && playgroundResult.matchedSkills.length > 0 ? (
                      playgroundResult.matchedSkills.map((s) => (
                        <span
                          key={s}
                          style={{
                            fontSize: '0.76rem',
                            padding: '0.2rem 0.55rem',
                            background: 'var(--accent-teal-light)',
                            border: '1px solid rgba(15, 107, 92, 0.25)',
                            borderRadius: '3px',
                            color: 'var(--accent-teal)',
                            fontWeight: 600,
                          }}
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>None detected</span>
                    )}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                    Missing Skills ({playgroundResult.missingSkills?.length || 0}):
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                    {playgroundResult.missingSkills && playgroundResult.missingSkills.length > 0 ? (
                      playgroundResult.missingSkills.map((s) => (
                        <span
                          key={s}
                          style={{
                            fontSize: '0.76rem',
                            padding: '0.2rem 0.55rem',
                            background: 'rgba(185, 28, 28, 0.08)',
                            border: '1px solid rgba(185, 28, 28, 0.22)',
                            borderRadius: '3px',
                            color: 'var(--semantic-red)',
                            fontWeight: 600,
                          }}
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: 'var(--semantic-green)' }}>
                        ✓ All required skills matched!
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div
                style={{
                  background: 'var(--bg-primary)',
                  borderRadius: '4px',
                  padding: '0.85rem 1.15rem',
                  borderLeft: '3px solid var(--accent-teal)',
                  fontSize: '0.86rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                }}
              >
                <strong style={{ color: 'var(--accent-teal)', display: 'block', marginBottom: '0.2rem' }}>
                  Summary feedback:
                </strong>
                {playgroundResult.summary}
              </div>
            </div>
          </div>
        )}
        </div>

        {/* =========================================================================
            SECTION 5: Feature Highlights Grid - Concise One-Liners
            ========================================================================= */}
        <div
          className="reveal-on-scroll"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
            gap: '1.35rem',
            marginTop: '5rem',
          }}
        >
          <div
            className="paper-card interactive-card"
            style={{
              padding: '1.5rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: '6px',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '4px',
                background: 'var(--accent-teal-light)',
                border: '1px solid rgba(15, 107, 92, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.9rem',
              }}
            >
              <Zap size={18} color="var(--accent-teal)" />
            </div>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '0.35rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Semantic Parsing
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: 1.55, margin: 0 }}>
              Extracts technical skills and experience without blind keyword rejections.
            </p>
          </div>

          <div
            className="paper-card interactive-card"
            style={{
              padding: '1.5rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: '6px',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '4px',
                background: 'rgba(45, 122, 58, 0.1)',
                border: '1px solid rgba(45, 122, 58, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.9rem',
              }}
            >
              <Target size={18} color="var(--semantic-green)" />
            </div>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '0.35rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Actionable Skill Gaps
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: 1.55, margin: 0 }}>
              Shows candidates exact skill alignment and personalized learning roadmaps.
            </p>
          </div>

          <div
            className="paper-card interactive-card"
            style={{
              padding: '1.5rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: '6px',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '4px',
                background: 'var(--accent-teal-light)',
                border: '1px solid rgba(15, 107, 92, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.9rem',
              }}
            >
              <ShieldCheck size={18} color="var(--accent-teal)" />
            </div>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '0.35rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Recruiter Kanban Pipeline
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: 1.55, margin: 0 }}>
              Filter by match score threshold and transition applicants through hiring stages.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
