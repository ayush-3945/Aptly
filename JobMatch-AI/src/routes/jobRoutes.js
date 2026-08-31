const express = require('express');
const router = express.Router();
const { createJob, getJobs, getJobById } = require('../controllers/jobController');
const { protect } = require('../middlewares/authMiddleware');
const { recruiterOnly } = require('../middlewares/roleMiddleware');

// POST /api/jobs - Protected (recruiter only)
router.post('/', protect, recruiterOnly, createJob);

// GET /api/jobs - Public
router.get('/', getJobs);

// GET /api/jobs/:id - Public
router.get('/:id', getJobById);

module.exports = router;
