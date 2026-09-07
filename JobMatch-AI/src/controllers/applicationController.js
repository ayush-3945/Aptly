const fs = require('fs');
const path = require('path');
const Application = require('../models/Application');
const Job = require('../models/Job');
const { extractTextFromPDF } = require('../services/resumeParserService');
const { evaluateMatch } = require('../services/aiMatcherService');

const { sendEmail } = require('../utils/emailService');
const {
  applicationReceivedTemplate,
  applicationShortlistedTemplate,
  interviewScheduledTemplate,
  newApplicationAlertTemplate,
} = require('../emails/templates');

// POST /api/applications or POST /api/jobs/:jobId/apply - Apply for a job
const applyForJob = async (req, res) => {
  try {
    const jobId = req.params.jobId || req.body.jobId;
    const { resumeUrl, resumeText: rawResumeText } = req.body;

    if (!jobId) {
      return res.status(400).json({ message: 'jobId is required' });
    }

    // Check if job exists and populate recruiter details
    const job = await Job.findById(jobId).populate('postedBy', 'name email');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if candidate already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      candidate: req.user._id,
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Extract text from resume PDF if available
    let resumeText = rawResumeText || '';
    if (!resumeText && resumeUrl) {
      try {
        let candidatePath = resumeUrl;
        if (!fs.existsSync(candidatePath)) {
          const relativeToCwd = path.join(process.cwd(), candidatePath);
          if (fs.existsSync(relativeToCwd)) {
            candidatePath = relativeToCwd;
          }
        }

        if (fs.existsSync(candidatePath)) {
          const parsed = await extractTextFromPDF(candidatePath);
          resumeText = parsed.text;
        }
      } catch (parseError) {
        console.warn('Resume text extraction failed during application submission:', parseError.message);
      }
    }

    // Evaluate candidate fit against the job using Gemini AI
    const evaluation = await evaluateMatch(job, resumeText);

    const application = await Application.create({
      job: jobId,
      candidate: req.user._id,
      resumeUrl,
      aiMatchScore: evaluation.matchScore,
      matchedSkills: evaluation.matchedSkills,
      missingSkills: evaluation.missingSkills,
      fitSummary: evaluation.fitSummary,
      experienceFit: evaluation.experienceFit,
      recommendation: evaluation.recommendation,
    });

    // 1. Send confirmation email to Candidate
    if (req.user && req.user.email) {
      const candidateHtml = applicationReceivedTemplate({
        candidateName: req.user.name || 'Candidate',
        jobTitle: job.title,
        companyName: job.company,
        matchScore: evaluation.matchScore,
        dashboardUrl: `${process.env.APP_URL || 'http://localhost:3000'}/dashboard`,
      });

      sendEmail(
        req.user.email,
        `Application Received: ${job.title} at ${job.company}`,
        candidateHtml
      ).catch(err => console.warn('[applyForJob] Error sending candidate email:', err.message));
    }

    // 2. Send pipeline alert email to Recruiter
    if (job.postedBy && job.postedBy.email) {
      const recruiterHtml = newApplicationAlertTemplate({
        recruiterName: job.postedBy.name || 'Recruiter',
        candidateName: req.user.name || 'Applicant',
        jobTitle: job.title,
        matchScore: evaluation.matchScore,
        scorecardUrl: `${process.env.APP_URL || 'http://localhost:3000'}/recruiter/pipeline`,
      });

      sendEmail(
        job.postedBy.email,
        `New Candidate: ${req.user.name || 'Applicant'} applied for ${job.title}`,
        recruiterHtml
      ).catch(err => console.warn('[applyForJob] Error sending recruiter alert:', err.message));
    }

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/applications/my - Candidate views their applications with status and job details
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ candidate: req.user._id })
      .populate('job', 'title company location requiredSkills')
      .select('job status resumeUrl aiMatchScore matchedSkills missingSkills fitSummary experienceFit recommendation appliedAt updatedAt')
      .sort({ appliedAt: -1 });

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/applications/job/:jobId - Recruiter views applications for a job with AI sorting, filtering & pagination
const getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;
    const {
      sortBy = 'aiMatchScore',
      order,
      sortOrder,
      minScore,
      maxScore,
      status,
      recommendation,
      page,
      limit,
    } = req.query;

    // Verify the job exists and is owned by the logged-in recruiter
    const job = await Job.findById(jobId);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view applications for this job' });
    }

    // Build filter query
    const filter = { job: jobId };

    // Filter by application status if provided
    if (status) {
      filter.status = status;
    }

    // Filter by recommendation tier if provided
    if (recommendation) {
      filter.recommendation = recommendation;
    }

    // Filter by AI match score range
    if (minScore !== undefined || maxScore !== undefined) {
      filter.aiMatchScore = {};
      if (minScore !== undefined && !isNaN(Number(minScore))) {
        filter.aiMatchScore.$gte = Number(minScore);
      }
      if (maxScore !== undefined && !isNaN(Number(maxScore))) {
        filter.aiMatchScore.$lte = Number(maxScore);
      }
    }

    // Build sort options
    const effectiveOrder = (sortOrder || order || 'desc').toLowerCase() === 'asc' ? 1 : -1;
    const sort = {};
    if (sortBy === 'aiMatchScore') {
      // Primary sort by score, secondary sort by application date
      sort.aiMatchScore = effectiveOrder;
      sort.appliedAt = -1;
    } else if (sortBy === 'appliedAt') {
      sort.appliedAt = effectiveOrder;
    } else {
      sort[sortBy] = effectiveOrder;
    }

    // Handle pagination if requested
    const isPaginated = Boolean(page || limit);
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const totalApplications = await Application.countDocuments(filter);

    let query = Application.find(filter)
      .populate('candidate', 'name email profile')
      .sort(sort);

    if (isPaginated) {
      query = query.skip(skip).limit(limitNum);
    }

    const applications = await query;

    if (isPaginated) {
      return res.status(200).json({
        total: totalApplications,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalApplications / limitNum),
        count: applications.length,
        applications,
      });
    }

    return res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/applications/:id/status - Recruiter updates application status
const updateApplicationStatus = async (req, res) => {
  try {
    const {
      status,
      nextSteps,
      interviewDate,
      interviewTime,
      interviewerName,
      meetingLink,
    } = req.body;
    const allowedStatuses = ['applied', 'shortlisted', 'interview', 'rejected', 'hired'];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed statuses are: ${allowedStatuses.join(', ')}`,
      });
    }

    const application = await Application.findById(req.params.id)
      .populate('job')
      .populate('candidate', 'name email');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Verify the logged-in recruiter posted the job
    if (!application.job || application.job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update status for this application' });
    }

    const previousStatus = application.status;
    application.status = status;
    await application.save();

    const appUrl = process.env.APP_URL || 'http://localhost:3000';

    // Trigger candidate emails based on the new status
    if (application.candidate && application.candidate.email) {
      if (status === 'shortlisted' && previousStatus !== 'shortlisted') {
        const shortlistedHtml = applicationShortlistedTemplate({
          candidateName: application.candidate.name || 'Candidate',
          jobTitle: application.job.title,
          companyName: application.job.company,
          nextSteps: nextSteps || 'Our recruiting team will reach out shortly regarding interview scheduling and next steps.',
          dashboardUrl: `${appUrl}/dashboard`,
        });

        sendEmail(
          application.candidate.email,
          `Congratulations: Shortlisted for ${application.job.title} at ${application.job.company}`,
          shortlistedHtml
        ).catch(err => console.warn('[updateApplicationStatus] Error sending shortlisted email:', err.message));
      } else if (status === 'interview' && previousStatus !== 'interview') {
        const interviewHtml = interviewScheduledTemplate({
          candidateName: application.candidate.name || 'Candidate',
          jobTitle: application.job.title,
          companyName: application.job.company,
          interviewDate: interviewDate || 'To be confirmed',
          interviewTime: interviewTime || 'To be confirmed',
          interviewerName: interviewerName || req.user.name || 'Hiring Team',
          meetingLink: meetingLink || null,
          dashboardUrl: `${appUrl}/dashboard`,
        });

        sendEmail(
          application.candidate.email,
          `Interview Scheduled: ${application.job.title} at ${application.job.company}`,
          interviewHtml
        ).catch(err => console.warn('[updateApplicationStatus] Error sending interview email:', err.message));
      }
    }

    res.status(200).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/applications/:id - Candidate withdraws an application
const withdrawApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Verify application belongs to candidate
    if (application.candidate.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to withdraw this application' });
    }

    await application.deleteOne();

    res.status(200).json({ message: 'Application withdrawn successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  applyForJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  withdrawApplication,
};
