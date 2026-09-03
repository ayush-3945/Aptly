const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Configure multer diskStorage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/resumes/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const userId = req.user && req.user._id ? req.user._id : 'anonymous';
    cb(null, `resume-${userId}-${Date.now()}.pdf`);
  },
});

// File filter: accept only PDF files
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

// Limits: max 5MB
const limits = {
  fileSize: 5 * 1024 * 1024,
};

const upload = multer({
  storage,
  fileFilter,
  limits,
});

module.exports = upload;
module.exports.upload = upload;
