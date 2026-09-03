const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route for testing
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'JobMatch AI API is running' });
});

// Setup routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/test', require('./routes/testRoute'));
// app.use('/api/candidates', require('./routes/candidateRoutes'));

module.exports = app;
