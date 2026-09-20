import React, { useState, useEffect, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Users,
  Star,
  MessageSquare,
  Gift,
  CheckCircle2,
  XCircle,
  FileText,
  GripVertical,
  Calendar,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const KANBAN_STAGES = [
  {
    id: 'applied',
    title: 'Applied',
    icon: Users,
    color: 'var(--accent-teal)',
    accentBg: 'var(--accent-teal-light)',
  },
  {
    id: 'shortlisted',
    title: 'Shortlisted',
    icon: Star,
    color: 'var(--accent-teal-mid, var(--accent-teal))',
    accentBg: 'var(--accent-teal-light)',
  },
  {
    id: 'interview',
    title: 'Interview',
    icon: MessageSquare,
    color: 'var(--accent-teal)',
    accentBg: 'var(--accent-teal-light)',
  },
  {
    id: 'offer',
    title: 'Offer',
    icon: Gift,
    color: 'var(--semantic-green)',
    accentBg: 'rgba(45, 122, 58, 0.1)',
  },
  {
    id: 'hired',
    title: 'Hired',
    icon: CheckCircle2,
    color: 'var(--semantic-green)',
    accentBg: 'rgba(45, 122, 58, 0.1)',
  },
  {
    id: 'rejected',
    title: 'Rejected',
    icon: XCircle,
    color: 'var(--text-muted)',
    accentBg: 'var(--bg-secondary)',
  },
];

const STAGE_LABELS = {
  applied: 'Applied',
  shortlisted: 'Shortlisted',
  interview: 'Interview',
  offer: 'Offer',
  hired: 'Hired',
  rejected: 'Rejected',
};

// Draggable candidate card
const DraggableCard = ({ application, onViewResume, onScheduleInterview, onGenerateKit, job: propJob }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: application._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    cursor: 'pointer',
  };

  const fullName =
    application.candidateName ||
    application.candidate?.fullName ||
    application.candidate?.name ||
    'Anonymous Candidate';

  const firstName =
    application.candidate?.firstName ||
    fullName.trim().split(' ')[0] ||
    fullName;

  if (!application.candidateName) {
    application.candidateName = fullName;
  }

  const candidate = {
    ...application.candidate,
    name: fullName,
    fullName: fullName,
    firstName,
  };
  const score = application.aiMatchScore || 0;
  const scoreColor =
    score >= 75
      ? 'var(--semantic-green)'
      : score >= 50
      ? 'var(--semantic-amber)'
      : 'var(--semantic-red)';
  const scoreBg =
    score >= 75
      ? 'rgba(45, 122, 58, 0.1)'
      : score >= 50
      ? 'rgba(180, 83, 9, 0.1)'
      : 'rgba(185, 28, 28, 0.1)';
  const scoreBorder =
    score >= 75
      ? 'rgba(45, 122, 58, 0.25)'
      : score >= 50
      ? 'rgba(180, 83, 9, 0.25)'
      : 'rgba(185, 28, 28, 0.25)';

  const appliedDate = application.appliedAt
    ? new Date(application.appliedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : '';

  const job = {
    ...(typeof propJob === 'object' ? propJob : {}),
    ...(typeof application.job === 'object' ? application.job : {}),
    title:
      (typeof application.job === 'object' && application.job?.title) ||
      propJob?.title ||
      candidate.profile?.targetRole ||
      'Engineering Role',
  };

  const hasScheduleBtn = application.status === 'shortlisted' && Boolean(onScheduleInterview);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="kanban-card"
    >
      {/* Drag handle + candidate name */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
        <div
          {...attributes}
          {...listeners}
          style={{
            cursor: 'grab',
            color: 'var(--text-muted)',
            padding: '0.15rem 0',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
          }}
          title="Drag to move"
        >
          <GripVertical size={14} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h4
            title={application.candidateName}
            style={{
              fontSize: '0.9rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: 0,
              lineHeight: 1.3,
              fontFamily: "'Newsreader', Georgia, serif",
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {firstName}
          </h4>
          <span
            title={job.title}
            style={{
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              display: 'block',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%',
            }}
          >
            {job.title}
          </span>
        </div>

        {/* AI Score badge */}
        <span
          style={{
            padding: '0.2rem 0.5rem',
            borderRadius: '4px',
            background: scoreBg,
            border: `1px solid ${scoreBorder}`,
            color: scoreColor,
            fontSize: '0.72rem',
            fontWeight: 800,
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {score}%
        </span>
      </div>

      {/* Bottom row: date + action buttons */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '0.5rem',
          paddingTop: '0.45rem',
          borderTop: '1px solid var(--border-default)',
          gap: '0.35rem',
        }}
      >
        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
          {appliedDate}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
          {onGenerateKit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onGenerateKit(application);
              }}
              className="kanban-kit-btn"
              title="Generate Interview Kit"
            >
              <FileText size={11} style={{ flexShrink: 0 }} />
              {!hasScheduleBtn && <span style={{ whiteSpace: 'nowrap' }}>Kit</span>}
            </button>
          )}

          {hasScheduleBtn && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onScheduleInterview(application);
              }}
              style={{
                padding: '0.22rem 0.55rem',
                borderRadius: '4px',
                background: 'var(--accent-teal)',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '0.68rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
              title="Schedule interview for this candidate"
            >
              <Calendar size={11} style={{ flexShrink: 0 }} />
              <span>Schedule</span>
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewResume(application);
            }}
            className="kanban-scorecard-btn"
            title="Scorecard"
            style={{
              padding: '0.2rem 0.5rem',
              borderRadius: '3px',
              background: 'transparent',
              border: '1px solid var(--border-default)',
              color: 'var(--accent-teal)',
              fontSize: '0.68rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <FileText size={11} style={{ flexShrink: 0 }} />
            {!hasScheduleBtn && <span style={{ whiteSpace: 'nowrap' }}>Scorecard</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

// Static card for DragOverlay
const CardOverlay = ({ application }) => {
  const candidate = application.candidate || {};
  const fullName =
    application.candidateName ||
    candidate.fullName ||
    candidate.name ||
    'Candidate';
  const firstName =
    candidate.firstName ||
    fullName.trim().split(' ')[0] ||
    fullName;
  const score = application.aiMatchScore || 0;
  const scoreColor =
    score >= 75 ? 'var(--semantic-green)' : score >= 50 ? 'var(--semantic-amber)' : 'var(--semantic-red)';

  return (
    <div
      style={{
        padding: '0.85rem 1rem',
        borderRadius: '6px',
        background: 'var(--bg-card)',
        border: '2px solid var(--accent-teal)',
        boxShadow: '0 12px 28px rgba(0, 0, 0, 0.15)',
        transform: 'scale(1.03)',
        width: '240px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <h4
          title={fullName}
          style={{
            fontSize: '0.9rem',
            fontWeight: 700,
            margin: 0,
            fontFamily: "'Newsreader', Georgia, serif",
            color: 'var(--text-primary)',
            flex: 1,
          }}
        >
          {firstName}
        </h4>
        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: scoreColor }}>
          {score}%
        </span>
      </div>
    </div>
  );
};

// Droppable column
const KanbanColumn = ({ stage, applications, onViewResume, onScheduleInterview, onGenerateKit, job }) => {
  const IconComponent = stage.icon;
  const isRejected = stage.id === 'rejected';

  return (
    <div
      style={{
        borderRadius: '8px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-default)',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minWidth: '160px',
        maxWidth: '220px',
      }}
    >
      {/* Column header */}
      <div
        style={{
          padding: '0.85rem 1rem',
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-default)',
          borderRadius: '8px 8px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: stage.accentBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: stage.color,
            }}
          >
            <IconComponent size={15} />
          </div>
          <h3
            style={{
              fontSize: '0.88rem',
              fontWeight: 700,
              margin: 0,
              color: 'var(--text-primary)',
              fontFamily: "'Newsreader', Georgia, serif",
            }}
          >
            {stage.title}
          </h3>
        </div>

        <span
          style={{
            padding: '0.15rem 0.55rem',
            borderRadius: '4px',
            background: isRejected ? 'rgba(185, 28, 28, 0.08)' : 'var(--accent-teal-light)',
            border: `1px solid ${isRejected ? 'rgba(185, 28, 28, 0.25)' : 'rgba(15, 107, 92, 0.25)'}`,
            fontSize: '0.72rem',
            fontWeight: 700,
            color: isRejected ? 'rgba(185, 28, 28, 0.7)' : 'var(--accent-teal)',
          }}
        >
          {applications.length}
        </span>
      </div>

      {/* Scrollable cards area */}
      <SortableContext
        items={applications.map((a) => a._id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          style={{
            padding: '0.65rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem',
            flex: 1,
            minHeight: '120px',
            maxHeight: '520px',
            overflowY: 'auto',
          }}
        >
          {applications.length === 0 ? (
            <div
              style={{
                padding: '2.25rem 0.75rem',
                textAlign: 'center',
                borderRadius: '6px',
                border: '1.5px dashed var(--border-default, #D1D5DB)',
                color: 'var(--text-muted, #9CA3AF)',
                fontSize: '0.8rem',
                fontWeight: 500,
                backgroundColor: 'rgba(0,0,0,0.01)',
              }}
            >
              Drop candidates here
            </div>
          ) : (
            applications.map((app) => (
              <DraggableCard
                key={app._id}
                application={app}
                onViewResume={onViewResume}
                onScheduleInterview={onScheduleInterview}
                onGenerateKit={onGenerateKit}
                job={job}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
};

// Main KanbanBoard component
const KanbanBoard = ({ applicants, setApplicants, onViewResume, onScheduleInterview, onGenerateKit, job }) => {
  const { showToast } = useToast();
  const [activeId, setActiveId] = useState(null);

  // Mobile responsiveness check (max-width: 768px)
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );

  const [expandedStages, setExpandedStages] = useState({
    applied: true,
    shortlisted: true,
    interview: true,
    offer: true,
    hired: false,
    rejected: false,
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleStage = (stageId) => {
    setExpandedStages((prev) => ({
      ...prev,
      [stageId]: !prev[stageId],
    }));
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  // Group applications by stage
  const columnData = useMemo(() => {
    const groups = {};
    KANBAN_STAGES.forEach((s) => (groups[s.id] = []));

    applicants.forEach((app) => {
      const stage = app.status || 'applied';
      if (groups[stage]) {
        groups[stage].push(app);
      } else {
        groups.applied.push(app);
      }
    });

    return groups;
  }, [applicants]);

  const activeApplication = useMemo(
    () => applicants.find((a) => a._id === activeId),
    [activeId, applicants]
  );

  // Find which column an application ID belongs to
  const findContainer = (id) => {
    // Check if the id is a column id
    if (KANBAN_STAGES.some((s) => s.id === id)) return id;
    // Find which column contains this application
    for (const [stageId, apps] of Object.entries(columnData)) {
      if (apps.some((a) => a._id === id)) return stageId;
    }
    return null;
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = () => {
    // Visual feedback handled by DndContext automatically
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeContainer = findContainer(active.id);
    let overContainer = findContainer(over.id);

    // If dropping on a card, use that card's container
    if (!overContainer) overContainer = over.id;
    // If the over target is a stage ID itself
    if (KANBAN_STAGES.some((s) => s.id === over.id)) {
      overContainer = over.id;
    }

    if (!overContainer || activeContainer === overContainer) return;

    const applicationId = active.id;
    const newStage = overContainer;
    const app = applicants.find((a) => a._id === applicationId);
    const candidateName = app?.candidate?.name || 'Candidate';
    const previousStatus = app?.status || 'applied';

    // Optimistic UI update
    setApplicants((prev) =>
      prev.map((a) => (a._id === applicationId ? { ...a, status: newStage } : a))
    );

    showToast(
      `${candidateName} moved to ${STAGE_LABELS[newStage] || newStage}`,
      'success'
    );

    // API call — revert on failure
    try {
      if (!applicationId.toString().startsWith('demo_')) {
        await api.patch(`/applications/${applicationId}/stage`, { stage: newStage });
      }
    } catch (err) {
      console.error('Stage update failed, reverting:', err.message);
      // Revert
      setApplicants((prev) =>
        prev.map((a) =>
          a._id === applicationId ? { ...a, status: previousStatus } : a
        )
      );
      showToast('Failed to update stage. Reverted.', 'error');
    }
  };

  // Mobile Accordion View on <= 768px
  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2.5rem' }}>
        {KANBAN_STAGES.map((stage) => {
          const apps = columnData[stage.id] || [];
          const isOpen = Boolean(expandedStages[stage.id]);
          const isRejected = stage.id === 'rejected';

          return (
            <div
              key={stage.id}
              style={{
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-default, #E2E8F0)',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}
            >
              {/* Accordion Header */}
              <button
                type="button"
                onClick={() => toggleStage(stage.id)}
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: isOpen ? 'var(--bg-secondary, #FAF9F5)' : '#FFFFFF',
                  border: 'none',
                  borderBottom: isOpen ? '1px solid var(--border-default, #E2E8F0)' : 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span
                    style={{
                      width: '9px',
                      height: '9px',
                      borderRadius: '50%',
                      backgroundColor: stage.color,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "'Newsreader', Georgia, serif",
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      color: 'var(--text-primary, #0F172A)',
                    }}
                  >
                    {stage.title}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span
                    style={{
                      padding: '0.15rem 0.55rem',
                      borderRadius: '4px',
                      background: isRejected ? 'rgba(185, 28, 28, 0.08)' : 'var(--accent-teal-light, #F0FDFA)',
                      border: `1px solid ${isRejected ? 'rgba(185, 28, 28, 0.25)' : 'rgba(15, 107, 92, 0.25)'}`,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: isRejected ? 'rgba(185, 28, 28, 0.7)' : 'var(--accent-teal, #0F766E)',
                    }}
                  >
                    {apps.length}
                  </span>
                  {isOpen ? (
                    <ChevronUp size={16} color="var(--text-muted, #64748B)" />
                  ) : (
                    <ChevronDown size={16} color="var(--text-muted, #64748B)" />
                  )}
                </div>
              </button>

              {/* Accordion Body */}
              {isOpen && (
                <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {apps.length === 0 ? (
                    <div
                      style={{
                        padding: '2rem 0.75rem',
                        textAlign: 'center',
                        borderRadius: '6px',
                        border: '1.5px dashed var(--border-default, #D1D5DB)',
                        color: 'var(--text-muted, #9CA3AF)',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        backgroundColor: 'rgba(0,0,0,0.01)',
                      }}
                    >
                      Drop candidates here
                    </div>
                  ) : (
                    apps.map((app) => (
                      <DraggableCard
                        key={app._id}
                        application={app}
                        onViewResume={onViewResume}
                        onScheduleInterview={onScheduleInterview}
                        onGenerateKit={onGenerateKit}
                        job={job}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Desktop Horizontal 6-Column Layout
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div
        style={{
          display: 'flex',
          width: '100%',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '1rem',
          marginBottom: '2rem',
        }}
      >
        {KANBAN_STAGES.map((stage) => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            applications={columnData[stage.id] || []}
            onViewResume={onViewResume}
            onScheduleInterview={onScheduleInterview}
            onGenerateKit={onGenerateKit}
            job={job}
          />
        ))}
      </div>

      <DragOverlay>
        {activeApplication ? (
          <CardOverlay application={activeApplication} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanBoard;
