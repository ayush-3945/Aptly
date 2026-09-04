const fs = require('fs');
const path = require('path');
const Application = require('../models/Application');
const Job = require('../models/Job');
const { extractTextFromPDF } = require('../services/resumeParserService');
const { evaluateMatch } = require('../services/aiMatcherService');

// POST /api/applications - Apply for a job
const applyForJob = async (req, res) => {
  try {
    const { jobId, resumeUrl, resumeText: rawResumeText } = req.body;

    // Check if job exists
    const job = await Job.findById(jobId);
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

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/applications/my - Candidate views their applications with status and job details
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ candidate: req.user._id })
      .populate('job', 'title company location')
      .select('job status resumeUrl aiMatchScore recommendation fitSummary appliedAt updatedAt')
      .sort({ appliedAt: -1 });

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/applications/job/:jobId - Recruiter views applications for a job
const getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Verify the job exists and is owned by the logged-in recruiter
    const job = await Job.findById(jobId);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view applications for this job' });
    }

    const applications = await Application.find({ job: jobId })
      .populate('candidate', 'name email')
      .sort({ appliedAt: -1 });

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/applications/:id/status - Recruiter updates application status
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['applied', 'shortlisted', 'interview', 'rejected', 'hired'];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed statuses are: ${allowedStatuses.join(', ')}`,
      });
    }

    const application = await Application.findById(req.params.id).populate('job');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Verify the logged-in recruiter posted the job
    if (!application.job || application.job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update status for this application' });
    }

    application.status = status;
    await application.save();

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
