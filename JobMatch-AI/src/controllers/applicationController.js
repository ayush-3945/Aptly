const Application = require('../models/Application');
const Job = require('../models/Job');

// POST /api/applications - Apply for a job
const applyForJob = async (req, res) => {
  try {
    const { jobId, resumeUrl } = req.body;

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

    const application = await Application.create({
      job: jobId,
      candidate: req.user._id,
      resumeUrl,
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
      .select('job status resumeUrl appliedAt updatedAt')
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

module.exports = { applyForJob, getMyApplications, getJobApplications };
