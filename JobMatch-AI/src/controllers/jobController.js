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

module.exports = { createJob, getJobs, getJobById, updateJob, deleteJob };

