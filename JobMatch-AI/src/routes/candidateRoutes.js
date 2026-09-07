const express = require('express');
const router = express.Router();
const { upload } = require('../middlewares/uploadMiddleware');
const { protect, optionalProtect } = require('../middlewares/authMiddleware');
const {
  parseResume,
  getCandidateProfile,
  updateCandidateProfile,
} = require('../controllers/candidateController');

// POST /api/candidate/parse-resume - Upload & parse resume PDF with Gemini AI
router.post('/parse-resume', optionalProtect, upload.single('resume'), parseResume);

// Candidate profile endpoints
router.get('/profile', protect, getCandidateProfile);
router.put('/profile', protect, updateCandidateProfile);

module.exports = router;
