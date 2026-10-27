const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const { protect } = require('../middlewares/authMiddleware');
const { candidateOnly } = require('../middlewares/roleMiddleware');
const { aiUploadLimiter } = require('../middlewares/securityMiddleware');

const fs = require('fs');
const path = require('path');
const { extractTextFromPDF } = require('../services/resumeParserService');

// POST /api/resumes/upload - Upload a PDF resume
router.post('/upload', protect, candidateOnly, aiUploadLimiter, upload.single('resume'), async (req, res) => {
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
    fileId: req.file.filename,
    filePath: normalizedPath,
    fileUrl: normalizedPath,
    filename: req.file.filename,
    extractedText,
  });
});

// POST /api/resumes/parse - Safe PDF text extraction using server-resolved fileId
router.post('/parse', protect, candidateOnly, aiUploadLimiter, async (req, res) => {
  try {
    const fileId = req.body.fileId || req.body.filename;

    if (!fileId || typeof fileId !== 'string') {
      return res.status(400).json({ message: 'Please provide a valid fileId in request body' });
    }

    // 1. Sanitize to prevent directory traversal by stripping all directory sequences
    const safeFilename = path.basename(fileId);

    // 2. Enforce PDF extension
    if (!safeFilename.toLowerCase().endsWith('.pdf')) {
      return res.status(400).json({ message: 'Invalid file type: fileId must reference a .pdf document' });
    }

    // 3. Resolve path strictly within server uploads directory
    const uploadRoot = path.resolve(__dirname, '../../uploads/resumes');
    const safeFilePath = path.resolve(uploadRoot, safeFilename);

    // 4. Boundary check: ensure resolved path starts with the trusted uploadRoot
    if (!safeFilePath.startsWith(uploadRoot)) {
      return res.status(403).json({ message: 'Access denied: Directory traversal detected' });
    }

    if (!fs.existsSync(safeFilePath)) {
      return res.status(404).json({ message: 'Resume file not found' });
    }

    const { text, numPages } = await extractTextFromPDF(safeFilePath);

    res.status(200).json({
      success: true,
      fileId: safeFilename,
      numPages,
      characterCount: text.length,
      snippet: text.substring(0, 300),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
