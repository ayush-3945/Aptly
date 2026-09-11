const fs = require('fs');
const path = require('path');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
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

    if (existingApplication && ['interview', 'offer', 'hired', 'rejected'].includes(existingApplication.status)) {
      return res.status(400).json({ message: 'You have already applied for this job and it is currently in active review.' });
    }

    // Extract text from resume PDF if available
    let resumeText = rawResumeText || '';
    if (!resumeText && resumeUrl) {
      try {
        const normalized = resumeUrl.replace(/\\/g, '/');
        const candidatesToCheck = [
          resumeUrl,
          normalized,
          path.join(process.cwd(), normalized),
          path.resolve(process.cwd(), normalized),
          path.join(process.cwd(), 'uploads', 'resumes', path.basename(normalized)),
        ];

        for (const p of candidatesToCheck) {
          if (fs.existsSync(p)) {
            const parsed = await extractTextFromPDF(p);
            if (parsed && parsed.text && parsed.text.trim().length >= 30) {
              resumeText = parsed.text;
              break;
            }
          }
        }
      } catch (parseError) {
        console.warn('Resume text extraction failed during application submission:', parseError.message);
      }
    }

    // If resumeText is still empty or minimal, fall back to candidate's stored profile or rich demo CV
    if (!resumeText || resumeText.trim().length < 30) {
      if (resumeUrl && resumeUrl.includes('demo')) {
        // High quality MERN & AI engineer profile for 1-Click Demo CV
        resumeText = `Alex Morgan
Senior Full-Stack MERN & AI Engineer
Email: candidate@jobmatch.ai | Phone: +1-555-0199 | Location: San Francisco, CA

PROFESSIONAL SUMMARY
Results-driven Full-Stack Engineer with 5+ years of experience specializing in React, Node.js, Express, MongoDB, and Gemini AI integration. Proven track record building scalable microservices, high-performance web applications, and ATS candidate screening workflows with Docker containerization and CI/CD pipelines.

CORE TECHNICAL SKILLS
- Frontend: React, Redux Toolkit, JavaScript (ES6+), TypeScript, Tailwind CSS, HTML5/CSS3
- Backend: Node.js, Express, REST APIs, GraphQL, Microservices architecture
- Databases: MongoDB, Mongoose ODM, PostgreSQL, Redis caching
- AI & ML: Google Gemini AI API, LLM prompt engineering, AI resume parsing, NLP
- DevOps & Tools: Docker, Git/GitHub, AWS (S3, EC2), Postman, Jest, CI/CD

PROFESSIONAL EXPERIENCE
Senior Full-Stack Engineer | TechPulse Solutions | 2022 - Present
- Architected enterprise ATS pipeline featuring AI candidate match scoring using React and Node.js.
- Developed real-time REST APIs with Express and MongoDB, serving 50k+ daily candidate requests.
- Integrated Google Gemini AI models for automatic document evaluation and semantic skill extraction.
- Containerized frontend and backend services using Docker for seamless cloud deployments.

Full-Stack Developer | CloudSphere Innovations | 2020 - 2022
- Built responsive React dashboards and high-throughput Node.js microservices.
- Optimized MongoDB aggregation pipelines, cutting database query latency by 40%.

EDUCATION
Bachelor of Technology in Computer Science & Engineering | 2016 - 2020`;
      } else if (req.user) {
        const candidateUser = await User.findById(req.user._id);
        if (candidateUser) {
          const skillsList = Array.isArray(candidateUser.skills) && candidateUser.skills.length > 0
            ? candidateUser.skills.join(', ')
            : 'React, Node.js, Express, MongoDB, JavaScript';
          const historyList = Array.isArray(candidateUser.workHistory) && candidateUser.workHistory.length > 0
            ? candidateUser.workHistory.map((w) => `${w.role || ''} at ${w.company || ''}: ${w.description || ''}`).join('\n')
            : '';
          const eduList = Array.isArray(candidateUser.education) && candidateUser.education.length > 0
            ? candidateUser.education.map((e) => `${e.degree || ''} from ${e.institution || ''} (${e.year || ''})`).join('\n')
            : '';

          const candidateProfileText = [
            `Candidate Name: ${candidateUser.name || 'Candidate'}`,
            `Role: ${candidateUser.currentRole || candidateUser.targetRole || 'Full-Stack Developer'}`,
            `Skills: ${skillsList}`,
            `Total Experience: ${candidateUser.totalExperience || '3+ years'}`,
            `Bio: ${candidateUser.bio || 'Full-stack software engineer building web applications.'}`,
            historyList ? `Work History:\n${historyList}` : '',
            eduList ? `Education:\n${eduList}` : '',
          ].filter(Boolean).join('\n\n');

          if (candidateProfileText.length >= 30) {
            resumeText = candidateProfileText;
          }
        }
      }
    }

    // Evaluate candidate fit against the job using Gemini AI
    const evaluation = await evaluateMatch(job, resumeText);

    let application;
    if (existingApplication) {
      // Update existing application when re-evaluating / benchmarking
      existingApplication.resumeUrl = resumeUrl || existingApplication.resumeUrl;
      existingApplication.aiMatchScore = evaluation.matchScore;
      existingApplication.matchedSkills = evaluation.matchedSkills;
      existingApplication.missingSkills = evaluation.missingSkills;
      existingApplication.fitSummary = evaluation.fitSummary;
      existingApplication.experienceFit = evaluation.experienceFit;
      existingApplication.recommendation = evaluation.recommendation;
      await existingApplication.save();
      application = existingApplication;
    } else {
      application = await Application.create({
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
    }

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
    const allowedStatuses = ['applied', 'shortlisted', 'interview', 'offer', 'rejected', 'hired'];

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

// PATCH /api/applications/:id/stage - Recruiter updates application stage via Kanban drag-and-drop
const updateApplicationStage = async (req, res) => {
  try {
    const { stage } = req.body;
    const allowedStages = ['applied', 'shortlisted', 'interview', 'offer', 'hired', 'rejected'];

    if (!stage || !allowedStages.includes(stage)) {
      return res.status(400).json({
        message: `Invalid stage. Allowed stages are: ${allowedStages.join(', ')}`,
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
      return res.status(403).json({ message: 'Not authorized to update stage for this application' });
    }

    const previousStatus = application.status;
    application.status = stage;
    await application.save();

    const appUrl = process.env.APP_URL || 'http://localhost:3000';

    // Trigger email notifications based on the new stage
    if (application.candidate && application.candidate.email) {
      if (stage === 'shortlisted' && previousStatus !== 'shortlisted') {
        const shortlistedHtml = applicationShortlistedTemplate({
          candidateName: application.candidate.name || 'Candidate',
          jobTitle: application.job.title,
          companyName: application.job.company,
          nextSteps: 'Our recruiting team will reach out shortly regarding interview scheduling and next steps.',
          dashboardUrl: `${appUrl}/dashboard`,
        });

        sendEmail(
          application.candidate.email,
          `Congratulations: Shortlisted for ${application.job.title} at ${application.job.company}`,
          shortlistedHtml
        ).catch(err => console.warn('[updateApplicationStage] Error sending shortlisted email:', err.message));
      } else if (stage === 'interview' && previousStatus !== 'interview') {
        const interviewHtml = interviewScheduledTemplate({
          candidateName: application.candidate.name || 'Candidate',
          jobTitle: application.job.title,
          companyName: application.job.company,
          interviewDate: 'To be confirmed',
          interviewTime: 'To be confirmed',
          interviewerName: req.user.name || 'Hiring Team',
          meetingLink: null,
          dashboardUrl: `${appUrl}/dashboard`,
        });

        sendEmail(
          application.candidate.email,
          `Interview Scheduled: ${application.job.title} at ${application.job.company}`,
          interviewHtml
        ).catch(err => console.warn('[updateApplicationStage] Error sending interview email:', err.message));
      }
    }

    res.status(200).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  applyForJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  updateApplicationStage,
  withdrawApplication,
};
