const Job = require('../models/Job');

// Create a new job
const createJob = async (req, res) => {
  try {
    const { title, description, company, requiredSkills, location } = req.body;

    const job = await Job.create({
      title,
      description,
      company,
      requiredSkills,
      location,
      postedBy: req.user._id,
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all jobs with optional keyword, location, and skill filtering
const getJobs = async (req, res) => {
  try {
    const { keyword, location, skill } = req.query;
    const query = {};

    // Keyword search across title, company, and description
    if (keyword && keyword.trim()) {
      const regex = new RegExp(keyword.trim(), 'i');
      query.$or = [
        { title: regex },
        { company: regex },
        { description: regex },
      ];
    }

    // Location filter
    if (location && location.trim() && location.toLowerCase() !== 'all') {
      query.location = new RegExp(location.trim(), 'i');
    }

    // Skill filter
    if (skill && skill.trim() && skill.toLowerCase() !== 'all') {
      query.requiredSkills = { $in: [new RegExp(`^${skill.trim()}$`, 'i')] };
    }

    const jobs = await Job.find(query)
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single job by ID
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name email');

    if (job) {
      res.status(200).json(job);
    } else {
      res.status(404).json({ message: 'Job not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a job (only the recruiter who posted it)
const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check ownership
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }

    const { title, description, company, requiredSkills, location } = req.body;

    job.title = title || job.title;
    job.description = description || job.description;
    job.company = company || job.company;
    job.requiredSkills = requiredSkills || job.requiredSkills;
    job.location = location || job.location;

    const updatedJob = await job.save();
    res.status(200).json(updatedJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a job (only the recruiter who posted it)
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check ownership
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    await job.deleteOne();
    res.status(200).json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const { previewProfileMatch } = require('../services/aiMatcherService');
const User = require('../models/User');

// POST /api/jobs/:jobId/preview-match - Preview match score between candidate profile and job requirements
const previewJobMatch = async (req, res) => {
  try {
    const { jobId } = req.params;
    let job = null;

    if (jobId && jobId.match(/^[0-9a-fA-F]{24}$/)) {
      job = await Job.findById(jobId);
    }

    // Fallback dictionary for mock/sample jobs if not found in database
    if (!job) {
      job = {
        _id: jobId,
        title: req.body.jobTitle || 'Software Engineer',
        company: req.body.jobCompany || 'Tech Solutions',
        location: req.body.jobLocation || 'Remote',
        requiredSkills: Array.isArray(req.body.requiredSkills) ? req.body.requiredSkills : ['React', 'Node.js', 'TypeScript', 'MongoDB'],
        description: 'Engineering role developing modern software applications.',
      };
    }

    // Extract candidate profile from request body
    const candidateProfile = {
      skills: Array.isArray(req.body.skills) ? req.body.skills : [],
      totalExperience: req.body.totalExperience || req.body.experience || '',
      education: Array.isArray(req.body.education) ? req.body.education : [],
      workHistory: Array.isArray(req.body.workHistory) ? req.body.workHistory : [],
      currentRole: req.body.currentRole || '',
    };

    // If candidate is logged in and some fields were omitted, supplement from MongoDB
    if (req.user && req.user._id) {
      const user = await User.findById(req.user._id);
      if (user) {
        if (!candidateProfile.skills.length && Array.isArray(user.skills) && user.skills.length) {
          candidateProfile.skills = user.skills;
        }
        if (!candidateProfile.totalExperience && user.totalExperience) {
          candidateProfile.totalExperience = user.totalExperience;
        }
        if (!candidateProfile.education.length && Array.isArray(user.education) && user.education.length) {
          candidateProfile.education = user.education;
        }
        if (!candidateProfile.workHistory.length && Array.isArray(user.workHistory) && user.workHistory.length) {
          candidateProfile.workHistory = user.workHistory;
        }
        if (!candidateProfile.currentRole && (user.currentRole || user.targetRole)) {
          candidateProfile.currentRole = user.currentRole || user.targetRole;
        }
      }
    }

    const matchData = await previewProfileMatch(job, candidateProfile);

    return res.status(200).json({
      success: true,
      data: matchData,
      job: {
        _id: job._id,
        title: job.title,
        company: job.company,
        requiredSkills: job.requiredSkills,
      },
    });
  } catch (error) {
    console.error('Error previewing match:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to preview match score',
    });
  }
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  previewJobMatch,
};

