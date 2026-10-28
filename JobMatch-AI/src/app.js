const express = require('express');
const cors = require('cors');
const {
  helmetMiddleware,
  generalLimiter,
  authLimiter,
  aiUploadLimiter,
  quickMatchLimiter,
} = require('./middlewares/securityMiddleware');

const app = express();

// Trust reverse proxy for accurate client IP resolution behind Vercel/Render/Nginx
app.set('trust proxy', 1);

// Validate critical security environment variables on startup
if (!process.env.JWT_SECRET && process.env.NODE_ENV !== 'test') {
  console.error('FATAL ERROR: JWT_SECRET environment variable is missing.');
  console.error('Please configure JWT_SECRET in your .env file before starting Aptly.AI.');
  process.exit(1);
}

// Security Headers
app.use(helmetMiddleware);

// Restrict CORS to explicitly configured client allowlist
const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];
const envOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((url) => url.trim().replace(/\/$/, '')).filter(Boolean)
  : [];
const allowedOrigins = [...new Set([...defaultAllowedOrigins, ...envOrigins])];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile clients, curl, server-to-server) or in whitelist
      if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ''))) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked: Origin ${origin} not permitted by Aptly.AI policy.`));
    },
    credentials: true,
  })
);
// Public Health Check Route (uncapped for monitoring probes)
app.use('/api/health', require('./routes/healthRoutes'));

// Public Playground Quick-Match Route (capped to 10 req / 15 min, 20kb JSON body limit, 0 DB writes, 0 AI cost)
app.use(
  '/api/public',
  express.json({ limit: '20kb' }),
  (err, req, res, next) => {
    if (err && (err.type === 'entity.too.large' || err.status === 413)) {
      return res.status(413).json({
        error: 'Payload size exceeds the 20KB limit for public quick-match. Please reduce the text length.',
      });
    }
    next(err);
  },
  quickMatchLimiter,
  require('./routes/publicRoutes')
);

// General body parser for remaining routes
app.use(express.json());

// Apply General Rate Limiter to all standard API routes
app.use('/api', generalLimiter);

// Setup routes with domain-specific rate limiting
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/applications', aiUploadLimiter, require('./routes/applicationRoutes'));
app.use('/api/interviews', require('./routes/interviewRoutes'));
app.use('/api/resumes', aiUploadLimiter, require('./routes/resumeRoutes'));
app.use('/api/candidate', aiUploadLimiter, require('./routes/candidateRoutes'));
app.use('/api/candidates', aiUploadLimiter, require('./routes/candidateRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

// Global Error Handler Middleware
app.use(require('./middlewares/errorHandler'));

module.exports = app;
