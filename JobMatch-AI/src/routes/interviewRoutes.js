const express = require('express');
const router = express.Router();
const {
  scheduleInterview,
  getInterviews,
  updateInterview,
  cancelInterview,
  generateQuestions,
} = require('../controllers/interviewController');
const { protect, optionalProtect } = require('../middlewares/authMiddleware');
const { recruiterOnly } = require('../middlewares/roleMiddleware');

// POST /api/interviews/generate-questions — Generate AI personalized interview question kit
router.post('/generate-questions', optionalProtect, generateQuestions);

// POST /api/interviews/schedule — Recruiter schedules an interview with a candidate
router.post('/schedule', protect, recruiterOnly, scheduleInterview);

// GET /api/interviews — Get all scheduled interviews for logged-in user (recruiter or candidate)
router.get('/', protect, getInterviews);

// PATCH /api/interviews/:id — Update status or reschedule interview
router.patch('/:id', protect, updateInterview);

// DELETE /api/interviews/:id — Cancel interview and send cancellation email
router.delete('/:id', protect, recruiterOnly, cancelInterview);

module.exports = router;

