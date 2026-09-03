const express = require('express');
const router = express.Router();
const { createJob, getJobs, getJobById, updateJob, deleteJob } = require('../controllers/jobController');
const { protect } = require('../middlewares/authMiddleware');
const { recruiterOnly } = require('../middlewares/roleMiddleware');

// POST /api/jobs - Protected (recruiter only)
router.post('/', protect, recruiterOnly, createJob);

// GET /api/jobs - Public
router.get('/', getJobs);

// GET /api/jobs/:id - Public
router.get('/:id', getJobById);

// PUT /api/jobs/:id - Protected (recruiter only, ownership checked in controller)
router.put('/:id', protect, recruiterOnly, updateJob);

// DELETE /api/jobs/:id - Protected (recruiter only, ownership checked in controller)
router.delete('/:id', protect, recruiterOnly, deleteJob);

module.exports = router;
