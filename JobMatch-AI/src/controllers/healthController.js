const mongoose = require('mongoose');
const { isGeminiConfigured } = require('../config/aiConfig');

/**
 * @desc    Get system health and service telemetry
 * @route   GET /api/health
 * @access  Public
 */
const getHealth = (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;

  res.status(200).json({
    status: 'healthy',
    service: 'JobMatch AI (Aptly) Backend',
    uptime: Math.floor(process.uptime()),
    database: {
      status: isDbConnected ? 'connected' : 'disconnected',
      readyState: mongoose.connection.readyState,
    },
    aiEngine: {
      status: 'active',
      provider: 'Google Gemini',
      mode: isGeminiConfigured() ? 'live_gemini_2.5_flash' : 'deterministic_heuristic_fallback',
    },
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  getHealth,
};
