const express = require('express');
const router = express.Router();
const { evaluateRuleBasedMatch } = require('../services/ruleBasedMatcher');

/**
 * Public Free Playground Endpoint: Rule-based Instant Match
 * POST /api/public/quick-match
 * - Zero external API costs (shared rule-based matcher)
 * - Zero database writes
 * - Strict 3000 character validation per field
 * - Transparent skills-driven matchScore (no fabricated sub-scores)
 */
router.post('/quick-match', (req, res) => {
  try {
    const { jobDescription, resumeText } = req.body || {};

    if (!jobDescription || !jobDescription.trim()) {
      return res.status(400).json({ error: 'Job description text is required.' });
    }
    if (!resumeText || !resumeText.trim()) {
      return res.status(400).json({ error: 'Resume text is required.' });
    }

    if (jobDescription.length > 3000) {
      return res.status(400).json({
        error: `Job description exceeds 3,000 characters limit (received ${jobDescription.length}).`,
      });
    }
    if (resumeText.length > 3000) {
      return res.status(400).json({
        error: `Resume text exceeds 3,000 characters limit (received ${resumeText.length}).`,
      });
    }

    const evaluation = evaluateRuleBasedMatch({
      job: jobDescription,
      resumeText,
      reason: 'Public quick-check sandbox',
    });

    return res.status(200).json(evaluation);
  } catch (err) {
    // Only log error message - never log user-submitted resume or job description text
    console.error('[Public Quick-Match Error]:', err.message || 'Unexpected failure');
    return res.status(500).json({ error: 'Failed to evaluate match. Please try again.' });
  }
});

module.exports = router;
