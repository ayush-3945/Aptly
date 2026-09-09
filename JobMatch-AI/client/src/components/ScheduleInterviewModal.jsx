import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Video,
  Phone,
  MapPin,
  Link2,
  FileText,
  Loader2,
  CheckCircle2,
  User,
  Building2,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const DURATION_OPTIONS = [
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '60 min' },
  { value: 90, label: '90 min' },
];

const FORMAT_OPTIONS = [
  { value: 'Video Call', label: 'Video Call', icon: Video },
  { value: 'Phone', label: 'Phone', icon: Phone },
  { value: 'In-Person', label: 'In-Person', icon: MapPin },
];

const ScheduleInterviewModal = ({
  isOpen,
  onClose,
  application,
  job,
  onSuccess,
}) => {
  const { showToast } = useToast();

  // Helper to format default tomorrow date
  const getTomorrowDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const todayDate = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(getTomorrowDate());
  const [time, setTime] = useState('14:00');
  const [duration, setDuration] = useState(45);
  const [format, setFormat] = useState('Video Call');
  const [meetingLink, setMeetingLink] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setDate(getTomorrowDate());
      setTime('14:00');
      setDuration(45);
      setFormat('Video Call');
      setMeetingLink('');
      setNotes('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen || !application) return null;

  const candidate = application.candidate || {};
  const currentJob = job || application.job || {};
  const candidateName = candidate.name || 'Candidate';
  const jobTitle = currentJob.title || 'Engineering Role';
  const companyName = currentJob.company || 'Company';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!date || !time) {
      setError('Please select both an interview date and time.');
      return;
    }

    // Combine date and time
    const scheduledDateTime = new Date(`${date}T${time}:00`);
    if (isNaN(scheduledDateTime.getTime())) {
      setError('Invalid date or time selected.');
      return;
    }

    const payload = {
      jobId: currentJob._id || application.job?._id,
      candidateId: candidate._id,
      scheduledAt: scheduledDateTime.toISOString(),
      duration,
      format,
      meetingLink: meetingLink.trim(),
      notes: notes.trim(),
    };

    setSubmitting(true);

    try {
      const isDemo = String(application._id).startsWith('demo_') || !candidate._id;

      let createdInterview = null;
      if (!isDemo) {
        const res = await api.post('/interviews/schedule', payload);
        createdInterview = res.data?.interview;
      } else {
        // Simulated response for fallback demo applicants
        createdInterview = {
          _id: `sim_int_${Date.now()}`,
          jobId: currentJob,
          candidateId: candidate,
          scheduledAt: scheduledDateTime.toISOString(),
          duration,
          format,
          meetingLink: meetingLink.trim(),
          notes: notes.trim(),
          status: 'Scheduled',
        };
      }

      showToast('Interview scheduled — candidate notified via email', 'success');

      if (onSuccess) {
        onSuccess(createdInterview, application._id);
      }
      onClose();
    } catch (err) {
      console.error('Error scheduling interview:', err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to schedule interview.';
      setError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        background: 'rgba(20, 20, 20, 0.65)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="paper-card"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '10px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-elevated)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.5rem 1.75rem',
            background: 'var(--bg-primary)',
            borderBottom: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
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
              <h2
                style={{
                  margin: 0,
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  fontFamily: "'Newsreader', Georgia, serif",
                }}
              >
                Schedule Interview
              </h2>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Direct native booking with automated Clinical Teal email dispatch
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '0.35rem',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Candidate & Role Banner */}
        <div
          style={{
            padding: '0.9rem 1.75rem',
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            fontSize: '0.82rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={15} color="var(--accent-teal)" />
            <strong style={{ color: 'var(--text-primary)' }}>{candidateName}</strong>
            <span style={{ color: 'var(--text-muted)' }}>({candidate.email || 'applicant'})</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
            <Building2 size={14} color="var(--text-muted)" />
            <span>{jobTitle}</span>
          </div>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: '1.75rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {error && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                background: 'var(--danger-bg)',
                border: '1px solid var(--danger-border)',
                color: 'var(--danger-text)',
                fontSize: '0.85rem',
              }}
            >
              {error}
            </div>
          )}

          {/* Date & Time Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
            }}
          >
            {/* Native HTML Date Picker styled in teal */}
            <div>
              <label
                htmlFor="interview-date"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '0.45rem',
                }}
              >
                <Calendar size={14} color="var(--accent-teal)" />
                Interview Date *
              </label>
              <input
                id="interview-date"
                type="date"
                required
                min={todayDate}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-default)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  fontFamily: 'var(--font-main)',
                  outline: 'none',
                  transition: 'border-color 0.15s ease',
                  cursor: 'pointer',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent-teal)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-default)')}
              />
            </div>

            {/* Native HTML Time Picker styled in teal */}
            <div>
              <label
                htmlFor="interview-time"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '0.45rem',
                }}
              >
                <Clock size={14} color="var(--accent-teal)" />
                Interview Time *
              </label>
              <input
                id="interview-time"
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-default)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  fontFamily: 'var(--font-main)',
                  outline: 'none',
                  transition: 'border-color 0.15s ease',
                  cursor: 'pointer',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent-teal)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-default)')}
              />
            </div>
          </div>

          {/* Duration Selector (Pill Buttons) */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '0.45rem',
              }}
            >
              Session Duration
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {DURATION_OPTIONS.map((opt) => {
                const isSelected = duration === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDuration(opt.value)}
                    style={{
                      flex: 1,
                      minWidth: '70px',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.82rem',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                      border: isSelected
                        ? '1px solid var(--accent-teal)'
                        : '1px solid var(--border-default)',
                      background: isSelected
                        ? 'var(--accent-teal)'
                        : 'var(--bg-secondary)',
                      color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                      transition: 'all 0.15s ease',
                      textAlign: 'center',
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Format Selector (Pill Buttons) */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '0.45rem',
              }}
            >
              Interview Format
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              {FORMAT_OPTIONS.map((opt) => {
                const isSelected = format === opt.value;
                const IconComp = opt.icon;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormat(opt.value)}
                    style={{
                      padding: '0.55rem 0.6rem',
                      borderRadius: '9999px',
                      fontSize: '0.8rem',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                      border: isSelected
                        ? '1px solid var(--accent-teal)'
                        : '1px solid var(--border-default)',
                      background: isSelected
                        ? 'var(--accent-teal)'
                        : 'var(--bg-secondary)',
                      color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <IconComp size={14} />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Meeting Link */}
          <div>
            <label
              htmlFor="interview-meeting-link"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '0.45rem',
              }}
            >
              <Link2 size={14} color="var(--accent-teal)" />
              Meeting Link <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(Optional)</span>
            </label>
            <input
              id="interview-meeting-link"
              type="url"
              placeholder={
                format === 'Video Call'
                  ? 'https://meet.google.com/xyz-abcd-efg or Zoom link'
                  : format === 'Phone'
                  ? '+1 (555) 019-2834 or dial-in number'
                  : 'Room 4B, Aptly HQ or office address'
              }
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '6px',
                border: '1px solid var(--border-default)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                fontSize: '0.88rem',
                outline: 'none',
                transition: 'border-color 0.15s ease',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent-teal)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border-default)')}
            />
          </div>

          {/* Optional Notes Textarea */}
          <div>
            <label
              htmlFor="interview-notes"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '0.45rem',
              }}
            >
              <FileText size={14} color="var(--accent-teal)" />
              Notes & Preparation Guidelines <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(Optional)</span>
            </label>
            <textarea
              id="interview-notes"
              rows={3}
              placeholder="e.g. Please have your code portfolio ready. We will focus on full-stack system architecture..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '6px',
                border: '1px solid var(--border-default)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-main)',
                lineHeight: 1.5,
                outline: 'none',
                resize: 'vertical',
                transition: 'border-color 0.15s ease',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent-teal)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border-default)')}
            />
          </div>

          {/* Modal Action Buttons */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: '0.75rem',
              marginTop: '0.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-default)',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="btn btn-secondary"
              style={{
                padding: '0.6rem 1.2rem',
                fontSize: '0.88rem',
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '0.65rem 1.5rem',
                borderRadius: '6px',
                background: 'var(--accent-teal)',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 2px 6px rgba(15, 107, 92, 0.25)',
                transition: 'background-color 0.15s ease',
                opacity: submitting ? 0.75 : 1,
              }}
            >
              {submitting ? (
                <>
                  <Loader2 className="spin" size={16} />
                  <span>Scheduling & Notifying...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Schedule & notify candidate</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleInterviewModal;
