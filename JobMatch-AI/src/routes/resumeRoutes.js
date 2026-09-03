const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const { protect } = require('../middlewares/authMiddleware');
const { candidateOnly } = require('../middlewares/roleMiddleware');

const { extractTextFromPDF } = require('../services/resumeParserService');

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

// POST /api/resumes/parse - Test PDF text extraction
router.post('/parse', protect, candidateOnly, async (req, res) => {
  try {
    const { filePath } = req.body;

    if (!filePath) {
      return res.status(400).json({ message: 'Please provide filePath in request body' });
    }

    const { text, numPages } = await extractTextFromPDF(filePath);

    res.status(200).json({
      success: true,
      numPages,
      characterCount: text.length,
      snippet: text.substring(0, 300),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
