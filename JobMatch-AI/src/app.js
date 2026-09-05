const express = require('express');
const cors = require('cors');
const {
  helmetMiddleware,
  generalLimiter,
  authLimiter,
  aiUploadLimiter,
} = require('./middlewares/securityMiddleware');

const app = express();

// Trust reverse proxy for accurate client IP resolution behind Vercel/Render/Nginx
app.set('trust proxy', 1);

// Security Headers
app.use(helmetMiddleware);

// Middleware
app.use(cors());
app.use(express.json());

// Public Health Check Route (uncapped for monitoring probes)
app.use('/api/health', require('./routes/healthRoutes'));

// Apply General Rate Limiter to all standard API routes
app.use('/api', generalLimiter);

// Setup routes with domain-specific rate limiting
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/applications', aiUploadLimiter, require('./routes/applicationRoutes'));
app.use('/api/resumes', aiUploadLimiter, require('./routes/resumeRoutes'));
app.use('/api/test', require('./routes/testRoute'));
// app.use('/api/candidates', require('./routes/candidateRoutes'));

// Global Error Handler Middleware
app.use(require('./middlewares/errorHandler'));

module.exports = app;
