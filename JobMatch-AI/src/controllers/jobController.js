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
      postedBy: req.user._id, // Set the recruiter's ID from the token
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all jobs
const getJobs = async (req, res) => {
  try {
    // Populate postedBy to show recruiter name and email
    const jobs = await Job.find({}).populate('postedBy', 'name email');
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

module.exports = { createJob, getJobs, getJobById };
