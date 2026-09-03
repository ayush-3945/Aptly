const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const { protect } = require('../middlewares/authMiddleware');
const { candidateOnly } = require('../middlewares/roleMiddleware');

// POST /api/resumes/upload - Upload a PDF resume
router.post('/upload', protect, candidateOnly, upload.single('resume'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload a PDF resume' });
  }

  res.status(200).json({
    message: 'Resume uploaded successfully',
    filePath: req.file.path,
    filename: req.file.filename,
  });
});

module.exports = router;
