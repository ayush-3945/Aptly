const express = require('express');
const router = express.Router();
const { createJob, getJobs, getJobById, updateJob, deleteJob, previewJobMatch } = require('../controllers/jobController');
const { applyForJob } = require('../controllers/applicationController');
const { protect, optionalProtect } = require('../middlewares/authMiddleware');
const { recruiterOnly, candidateOnly } = require('../middlewares/roleMiddleware');

// POST /api/jobs - Protected (recruiter only)
router.post('/', protect, recruiterOnly, createJob);

// GET /api/jobs - Public
router.get('/', getJobs);

// POST /api/jobs/:jobId/preview-match - Real-time match score preview before submitting
router.post('/:jobId/preview-match', optionalProtect, previewJobMatch);

// POST /api/jobs/:jobId/apply - Candidate applies to a specific job
router.post('/:jobId/apply', protect, candidateOnly, applyForJob);

// GET /api/jobs/:id - Public
router.get('/:id', getJobById);

// PUT /api/jobs/:id - Protected (recruiter only, ownership checked in controller)
router.put('/:id', protect, recruiterOnly, updateJob);

// DELETE /api/jobs/:id - Protected (recruiter only, ownership checked in controller)
router.delete('/:id', protect, recruiterOnly, deleteJob);

module.exports = router;
