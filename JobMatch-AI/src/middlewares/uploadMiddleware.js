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

// Strict file filter: validate both MIME type and file extension
const fileFilter = (req, file, cb) => {
  const isPdfMime = file.mimetype === 'application/pdf';
  const isPdfExt = path.extname(file.originalname || '').toLowerCase() === '.pdf';

  if (isPdfMime && isPdfExt) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only machine-readable PDF documents (.pdf) up to 5MB are permitted.'), false);
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
