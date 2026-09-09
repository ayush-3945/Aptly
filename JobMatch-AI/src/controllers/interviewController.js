const Interview = require('../models/Interview');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');
const {
  interviewScheduledTemplate,
  interviewCancelledTemplate,
} = require('../emails/templates');

/**
 * Format a Date object into a readable date string: e.g. "Wednesday, September 16, 2026"
 */
function formatReadableDate(dateObj) {
  try {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(dateObj);
  } catch (_e) {
    return dateObj.toDateString();
  }
}

/**
 * Format a Date object into a readable time string: e.g. "02:30 PM UTC"
 */
function formatReadableTime(dateObj) {
  try {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZoneName: 'short',
    }).format(dateObj);
  } catch (_e) {
    return dateObj.toTimeString().split(' ')[0];
  }
}

// POST /api/interviews/schedule — Recruiter books an interview with a candidate
const scheduleInterview = async (req, res) => {
  try {
    const {
      jobId,
      candidateId,
      scheduledAt,
      duration = 45,
      format = 'Video Call',
      meetingLink = '',
      notes = '',
    } = req.body;

    if (!jobId || !candidateId || !scheduledAt) {
      return res.status(400).json({
        message: 'jobId, candidateId, and scheduledAt are required fields.',
      });
    }

    const parsedDate = new Date(scheduledAt);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: 'Invalid scheduledAt date format.' });
    }

    // Verify Job exists and recruiter is authorized
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Not authorized to schedule interviews for this job.',
      });
    }

    // Verify Candidate exists
    const candidate = await User.findById(candidateId).select('name email');
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate user not found.' });
    }

    // Validate duration & format
    const validDurations = [30, 45, 60, 90];
    const finalDuration = validDurations.includes(Number(duration)) ? Number(duration) : 45;

    const validFormats = ['Video Call', 'Phone', 'In-Person'];
    const finalFormat = validFormats.includes(format) ? format : 'Video Call';

    // Create the Interview document
    const interview = await Interview.create({
      jobId,
      candidateId,
      recruiterId: req.user._id,
      scheduledAt: parsedDate,
      duration: finalDuration,
      format: finalFormat,
      meetingLink: meetingLink ? meetingLink.trim() : '',
      notes: notes ? notes.trim() : '',
      status: 'Scheduled',
    });

    // Automatically synchronize ATS Pipeline: advance candidate's Application status to 'interview'
    try {
      await Application.findOneAndUpdate(
        { job: jobId, candidate: candidateId },
        { status: 'interview' }
      );
    } catch (appErr) {
      console.warn('[scheduleInterview] Warning updating Application status:', appErr.message);
    }

    // Send Clinical Teal Interview Scheduled Email to Candidate
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const emailHtml = interviewScheduledTemplate({
      candidateName: candidate.name || 'Candidate',
      jobTitle: job.title,
      companyName: job.company,
      interviewDate: formatReadableDate(parsedDate),
      interviewTime: formatReadableTime(parsedDate),
      duration: finalDuration,
      format: finalFormat,
      interviewerName: req.user.name || 'Hiring Team',
      meetingLink: meetingLink || null,
      notes: notes || '',
      dashboardUrl: `${appUrl}/dashboard`,
    });

    sendEmail(
      candidate.email,
      `Interview Scheduled: ${job.title} at ${job.company}`,
      emailHtml
    ).catch((err) =>
      console.warn('[scheduleInterview] Email dispatch error:', err.message)
    );

    // Populate references for rich response
    await interview.populate([
      { path: 'jobId', select: 'title company location' },
      { path: 'candidateId', select: 'name email' },
      { path: 'recruiterId', select: 'name email' },
    ]);

    res.status(201).json({
      message: 'Interview scheduled successfully. Candidate notified via email.',
      interview,
    });
  } catch (error) {
    console.error('[scheduleInterview] Exception:', error);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/interviews — Get all scheduled interviews for logged in user (recruiter or candidate)
const getInterviews = async (req, res) => {
  try {
    const isRecruiter = req.user.role === 'recruiter';
    const query = isRecruiter
      ? { recruiterId: req.user._id }
      : { candidateId: req.user._id };

    // Optional status filter e.g. ?status=Scheduled
    if (req.query.status) {
      query.status = req.query.status;
    }

    const interviews = await Interview.find(query)
      .populate('jobId', 'title company location')
      .populate('candidateId', 'name email profile')
      .populate('recruiterId', 'name email')
      .sort({ scheduledAt: 1 });

    res.status(200).json(interviews);
  } catch (error) {
    console.error('[getInterviews] Exception:', error);
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/interviews/:id — Update status or reschedule
const updateInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      scheduledAt,
      duration,
      format,
      meetingLink,
      notes,
      rescheduleReason,
    } = req.body;

    const interview = await Interview.findById(id)
      .populate('jobId', 'title company')
      .populate('candidateId', 'name email')
      .populate('recruiterId', 'name email');

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found.' });
    }

    // Verify user is either the recruiter who scheduled it or the candidate
    const userIdStr = req.user._id.toString();
    const isRecruiter = interview.recruiterId._id.toString() === userIdStr;
    const isCandidate = interview.candidateId._id.toString() === userIdStr;

    if (!isRecruiter && !isCandidate) {
      return res.status(403).json({ message: 'Not authorized to modify this interview.' });
    }

    const previousStatus = interview.status;

    if (status) {
      const validStatuses = ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid interview status.' });
      }
      interview.status = status;
    }

    let dateChanged = false;
    if (scheduledAt) {
      const parsedDate = new Date(scheduledAt);
      if (!isNaN(parsedDate.getTime())) {
        interview.scheduledAt = parsedDate;
        dateChanged = true;
      }
    }

    if (duration && [30, 45, 60, 90].includes(Number(duration))) {
      interview.duration = Number(duration);
    }

    if (format && ['Video Call', 'Phone', 'In-Person'].includes(format)) {
      interview.format = format;
    }

    if (meetingLink !== undefined) {
      interview.meetingLink = meetingLink.trim();
    }

    if (notes !== undefined) {
      interview.notes = notes.trim();
    }

    await interview.save();

    const appUrl = process.env.APP_URL || 'http://localhost:3000';

    // If status transitioned to Cancelled, dispatch cancellation notice
    if (interview.status === 'Cancelled' && previousStatus !== 'Cancelled') {
      const cancelHtml = interviewCancelledTemplate({
        candidateName: interview.candidateId?.name || 'Candidate',
        jobTitle: interview.jobId?.title || 'Position',
        companyName: interview.jobId?.company || 'Company',
        interviewDate: formatReadableDate(interview.scheduledAt),
        reason: rescheduleReason || 'The session was cancelled by the hiring manager.',
        dashboardUrl: `${appUrl}/dashboard`,
      });

      sendEmail(
        interview.candidateId?.email,
        `Interview Cancelled: ${interview.jobId?.title || 'Position'}`,
        cancelHtml
      ).catch((err) => console.warn('[updateInterview] Cancel email error:', err.message));
    } else if (dateChanged) {
      // If rescheduled, send updated confirmation
      const reschedHtml = interviewScheduledTemplate({
        candidateName: interview.candidateId?.name || 'Candidate',
        jobTitle: interview.jobId?.title || 'Position',
        companyName: interview.jobId?.company || 'Company',
        interviewDate: formatReadableDate(interview.scheduledAt),
        interviewTime: formatReadableTime(interview.scheduledAt),
        duration: interview.duration,
        format: interview.format,
        interviewerName: interview.recruiterId?.name || 'Hiring Team',
        meetingLink: interview.meetingLink || null,
        notes: interview.notes || '',
        dashboardUrl: `${appUrl}/dashboard`,
      });

      sendEmail(
        interview.candidateId?.email,
        `Interview Rescheduled: ${interview.jobId?.title || 'Position'}`,
        reschedHtml
      ).catch((err) => console.warn('[updateInterview] Reschedule email error:', err.message));
    }

    res.status(200).json({
      message: 'Interview updated successfully.',
      interview,
    });
  } catch (error) {
    console.error('[updateInterview] Exception:', error);
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/interviews/:id — Cancel and delete/archive interview, notify candidate
const cancelInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = 'Cancelled by recruiter.' } = req.body || {};

    const interview = await Interview.findById(id)
      .populate('jobId', 'title company')
      .populate('candidateId', 'name email')
      .populate('recruiterId', 'name email');

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found.' });
    }

    // Verify user is authorized recruiter
    if (interview.recruiterId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this interview.' });
    }

    interview.status = 'Cancelled';
    await interview.save();

    // Send cancellation email to candidate
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const cancelHtml = interviewCancelledTemplate({
      candidateName: interview.candidateId?.name || 'Candidate',
      jobTitle: interview.jobId?.title || 'Position',
      companyName: interview.jobId?.company || 'Company',
      interviewDate: formatReadableDate(interview.scheduledAt),
      reason,
      dashboardUrl: `${appUrl}/dashboard`,
    });

    sendEmail(
      interview.candidateId?.email,
      `Interview Cancelled: ${interview.jobId?.title || 'Position'}`,
      cancelHtml
    ).catch((err) => console.warn('[cancelInterview] Email error:', err.message));

    res.status(200).json({
      message: 'Interview cancelled successfully. Candidate notified via email.',
      interview,
    });
  } catch (error) {
    console.error('[cancelInterview] Exception:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  scheduleInterview,
  getInterviews,
  updateInterview,
  cancelInterview,
};
