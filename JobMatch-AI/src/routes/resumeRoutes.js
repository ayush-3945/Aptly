const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const { protect } = require('../middlewares/authMiddleware');
const { candidateOnly } = require('../middlewares/roleMiddleware');

const { extractTextFromPDF } = require('../services/resumeParserService');

// POST /api/resumes/upload - Upload a PDF resume
router.post('/upload', protect, candidateOnly, upload.single('resume'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload a PDF resume' });
  }

  const normalizedPath = req.file.path.replace(/\\/g, '/');
  let extractedText = '';

  try {
    const parsed = await extractTextFromPDF(req.file.path);
    if (parsed && parsed.text) {
      extractedText = parsed.text;
    }
  } catch (parseErr) {
    console.warn('PDF text extraction error on upload:', parseErr.message);
  }

  res.status(200).json({
    message: 'Resume uploaded successfully',
    filePath: normalizedPath,
    fileUrl: normalizedPath,
    filename: req.file.filename,
    extractedText,
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
