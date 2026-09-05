const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Public Health Check Route
app.use('/api/health', require('./routes/healthRoutes'));

// Setup routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/resumes', require('./routes/resumeRoutes'));
app.use('/api/test', require('./routes/testRoute'));
// app.use('/api/candidates', require('./routes/candidateRoutes'));

// Global Error Handler Middleware
app.use(require('./middlewares/errorHandler'));

module.exports = app;
