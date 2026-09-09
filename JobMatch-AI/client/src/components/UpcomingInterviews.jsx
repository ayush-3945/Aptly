import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Video,
  Phone,
  MapPin,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Building2,
  User,
  Loader2,
  FileText,
  AlertCircle,
  MoreVertical,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const SAMPLE_INTERVIEWS = [
  {
    _id: 'demo_int_1',
    candidateId: { name: 'Elena Rostova', email: 'elena.rostova@gmail.com' },
    recruiterId: { name: 'Dr. Sarah Lin', email: 'sarah@techpulse.io' },
    jobId: {
      title: 'Senior Full-Stack MERN & AI Engineer',
      company: 'TechPulse Solutions',
      location: 'Remote',
    },
    scheduledAt: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
    duration: 45,
    format: 'Video Call',
    meetingLink: 'https://meet.google.com/aptly-mern-round',
    notes: 'Technical architecture deep-dive and live Gemini model prompt integration.',
    status: 'Scheduled',
  },
  {
    _id: 'demo_int_2',
    candidateId: { name: 'Marcus Chen', email: 'marcus.chen@outlook.com' },
    recruiterId: { name: 'Dr. Sarah Lin', email: 'sarah@techpulse.io' },
    jobId: {
      title: 'Frontend AI Interface Architect',
      company: 'HyperScale AI',
      location: 'San Francisco, CA',
    },
    scheduledAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
    duration: 60,
    format: 'Video Call',
    meetingLink: 'https://meet.google.com/aptly-frontend-round',
    notes: 'Interactive UI portfolio review and component design system questions.',
    status: 'Scheduled',
  },
];

const UpcomingInterviews = ({ viewMode = 'recruiter' }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'Scheduled', 'Completed', 'Cancelled'
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const res = await api.get('/interviews');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setInterviews(res.data);
      } else {
        setInterviews(SAMPLE_INTERVIEWS);
      }
    } catch (err) {
      console.warn('Could not fetch interviews from API, using demo sessions:', err.message);
      setInterviews(SAMPLE_INTERVIEWS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const handleStatusUpdate = async (interviewId, newStatus) => {
    setActionLoadingId(interviewId);
    try {
      if (!interviewId.toString().startsWith('demo_')) {
        if (newStatus === 'Cancelled') {
          await api.delete(`/interviews/${interviewId}`, {
            data: { reason: 'Cancelled by recruiter from dashboard.' },
          });
        } else {
          await api.patch(`/interviews/${interviewId}`, { status: newStatus });
        }
      }

      setInterviews((prev) =>
        prev.map((item) =>
          item._id === interviewId ? { ...item, status: newStatus } : item
        )
      );

      showToast(
        newStatus === 'Cancelled'
          ? 'Interview cancelled and candidate notified.'
          : `Interview marked as ${newStatus}.`,
        'success'
      );
    } catch (err) {
      console.error('Error updating interview status:', err);
      showToast(err.response?.data?.message || err.message, 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Date/Time formatting helpers
  const formatDateTime = (isoDateString) => {
    if (!isoDateString) return { dateStr: 'Date TBD', timeStr: '' };
    try {
      const d = new Date(isoDateString);
      const dateStr = d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
      const timeStr = d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      return { dateStr, timeStr };
    } catch (_e) {
      return { dateStr: isoDateString, timeStr: '' };
    }
  };

  const getFormatBadge = (format) => {
    switch (format) {
      case 'Phone':
        return {
          icon: Phone,
          bg: 'rgba(180, 83, 9, 0.08)',
          color: 'var(--semantic-amber)',
          border: 'rgba(180, 83, 9, 0.25)',
        };
      case 'In-Person':
        return {
          icon: MapPin,
          bg: 'rgba(55, 65, 81, 0.08)',
          color: '#374151',
          border: 'rgba(55, 65, 81, 0.2)',
        };
      case 'Video Call':
      default:
        return {
          icon: Video,
          bg: 'var(--accent-teal-light)',
          color: 'var(--accent-teal)',
          border: 'rgba(15, 107, 92, 0.25)',
        };
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Completed':
        return {
          bg: 'rgba(45, 122, 58, 0.08)',
          color: 'var(--semantic-green)',
          border: 'rgba(45, 122, 58, 0.25)',
        };
      case 'Cancelled':
        return {
          bg: 'rgba(185, 28, 28, 0.08)',
          color: 'var(--semantic-red)',
          border: 'rgba(185, 28, 28, 0.25)',
        };
      case 'Rescheduled':
        return {
          bg: 'rgba(180, 83, 9, 0.08)',
          color: 'var(--semantic-amber)',
          border: 'rgba(180, 83, 9, 0.25)',
        };
      case 'Scheduled':
      default:
        return {
          bg: 'var(--accent-teal-light)',
          color: 'var(--accent-teal)',
          border: 'rgba(15, 107, 92, 0.25)',
        };
    }
  };

  const filteredInterviews = interviews.filter((item) => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const isRecruiter = viewMode === 'recruiter' || user?.role === 'recruiter';

  return (
    <div
      className="paper-card"
      style={{
        marginTop: '2.5rem',
        padding: '2rem',
        borderRadius: '8px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Section Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid var(--border-default)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '6px',
              background: 'var(--accent-teal-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-teal)',
              border: '1px solid rgba(15, 107, 92, 0.25)',
            }}
          >
            <Calendar size={20} />
          </div>
          <div>
            <h3
              style={{
                fontSize: '1.3rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                fontFamily: "'Newsreader', Georgia, serif",
                margin: 0,
              }}
            >
              Upcoming Interviews
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
              {isRecruiter
                ? 'Scheduled candidate conversations and technical evaluation rounds'
                : 'Your upcoming interview sessions with hiring teams'}
            </p>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {['all', 'Scheduled', 'Completed', 'Cancelled'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilter(st)}
              className={filter === st ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{
                fontSize: '0.78rem',
                padding: '0.35rem 0.8rem',
                textTransform: 'capitalize',
              }}
            >
              {st === 'all' ? `All (${interviews.length})` : st}
            </button>
          ))}
        </div>
      </div>

      {/* Content Body */}
      {loading ? (
        <div
          style={{
            padding: '3rem 1rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            color: 'var(--text-secondary)',
          }}
        >
          <Loader2 className="spin" size={28} color="var(--accent-teal)" />
          <span style={{ fontSize: '0.9rem' }}>Loading scheduled sessions...</span>
        </div>
      ) : filteredInterviews.length === 0 ? (
        <div
          style={{
            padding: '3rem 1.5rem',
            textAlign: 'center',
            borderRadius: '6px',
            border: '1px dashed var(--border-default)',
            background: 'var(--bg-primary)',
            color: 'var(--text-muted)',
          }}
        >
          <Calendar size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
          <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', margin: '0 0 0.35rem 0' }}>
            No {filter !== 'all' ? filter.toLowerCase() : ''} interviews found
          </h4>
          <p style={{ fontSize: '0.82rem', margin: 0, maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
            {isRecruiter
              ? 'Shortlist applicants from your ATS pipeline and click "Schedule Interview" to book sessions.'
              : 'When hiring managers advance your application, your scheduled interview rounds will appear here.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredInterviews.map((item) => {
            const candidate = item.candidateId || {};
            const recruiter = item.recruiterId || {};
            const currentJob = item.jobId || {};
            const { dateStr, timeStr } = formatDateTime(item.scheduledAt);
            const formatBadge = getFormatBadge(item.format);
            const FormatIcon = formatBadge.icon;
            const statusStyle = getStatusStyle(item.status);
            const isActing = actionLoadingId === item._id;

            return (
              <div
                key={item._id}
                style={{
                  padding: '1.25rem 1.5rem',
                  borderRadius: '6px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-default)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1.25rem',
                  transition: 'border-color 0.15s ease',
                }}
              >
                {/* Left: Date/Time Badge & Primary Details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', minWidth: '280px', flex: 1 }}>
                  {/* Calendar Date Block */}
                  <div
                    style={{
                      padding: '0.6rem 0.85rem',
                      borderRadius: '6px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-default)',
                      textAlign: 'center',
                      minWidth: '85px',
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-teal)', textTransform: 'uppercase' }}>
                      {dateStr.split(',')[0]}
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {dateStr.split(' ')[1] || dateStr}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {timeStr}
                    </div>
                  </div>

                  {/* Title & Metadata */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                      <h4
                        style={{
                          margin: 0,
                          fontSize: '1rem',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          fontFamily: "'Newsreader', Georgia, serif",
                        }}
                      >
                        {isRecruiter ? candidate.name || 'Candidate' : currentJob.title || 'Engineering Role'}
                      </h4>

                      {/* Status Badge */}
                      <span
                        style={{
                          padding: '0.15rem 0.55rem',
                          borderRadius: '3px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          background: statusStyle.bg,
                          color: statusStyle.color,
                          border: `1px solid ${statusStyle.border}`,
                        }}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        flexWrap: 'wrap',
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Building2 size={13} color="var(--text-muted)" />
                        {currentJob.company || 'Company'} • {currentJob.title || 'Role'}
                      </span>

                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Clock size={13} color="var(--text-muted)" />
                        {item.duration || 45} mins
                      </span>

                      {/* Format Badge */}
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '0.15rem 0.55rem',
                          borderRadius: '9999px',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          background: formatBadge.bg,
                          color: formatBadge.color,
                          border: `1px solid ${formatBadge.border}`,
                        }}
                      >
                        <FormatIcon size={12} />
                        {item.format}
                      </span>
                    </div>

                    {item.notes && (
                      <p
                        style={{
                          margin: '0.45rem 0 0 0',
                          fontSize: '0.78rem',
                          color: 'var(--text-secondary)',
                          fontStyle: 'italic',
                          maxWidth: '520px',
                        }}
                      >
                        "{item.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Action CTAs */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                  {item.meetingLink && (
                    <a
                      href={item.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                      style={{
                        padding: '0.45rem 0.95rem',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        background: 'var(--accent-teal)',
                        textDecoration: 'none',
                      }}
                    >
                      <Video size={13} />
                      <span>Join Meeting</span>
                      <ExternalLink size={12} />
                    </a>
                  )}

                  {isRecruiter && item.status === 'Scheduled' && (
                    <>
                      <button
                        type="button"
                        disabled={isActing}
                        onClick={() => handleStatusUpdate(item._id, 'Completed')}
                        style={{
                          padding: '0.45rem 0.85rem',
                          borderRadius: '4px',
                          background: 'rgba(45, 122, 58, 0.1)',
                          border: '1px solid rgba(45, 122, 58, 0.25)',
                          color: 'var(--semantic-green)',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: isActing ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                        title="Mark Completed"
                      >
                        <CheckCircle2 size={13} />
                        <span>Complete</span>
                      </button>

                      <button
                        type="button"
                        disabled={isActing}
                        onClick={() => handleStatusUpdate(item._id, 'Cancelled')}
                        style={{
                          padding: '0.45rem 0.85rem',
                          borderRadius: '4px',
                          background: 'rgba(185, 28, 28, 0.08)',
                          border: '1px solid rgba(185, 28, 28, 0.25)',
                          color: 'var(--semantic-red)',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: isActing ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                        title="Cancel Interview & Notify Candidate"
                      >
                        <XCircle size={13} />
                        <span>Cancel</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UpcomingInterviews;
