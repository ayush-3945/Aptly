const express = require('express');
const router = express.Router();
const { applyForJob, getMyApplications, getJobApplications } = require('../controllers/applicationController');
const { protect } = require('../middlewares/authMiddleware');
const { candidateOnly, recruiterOnly } = require('../middlewares/roleMiddleware');

// POST /api/applications - Candidate applies to a job
router.post('/', protect, candidateOnly, applyForJob);

// GET /api/applications/my - Candidate views their own applications
router.get('/my', protect, candidateOnly, getMyApplications);

// GET /api/applications/job/:jobId - Recruiter views applications for their job
router.get('/job/:jobId', protect, recruiterOnly, getJobApplications);

module.exports = router;
