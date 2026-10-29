const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect, optionalProtect } = require('../middlewares/authMiddleware');
const { recruiterOnly } = require('../middlewares/roleMiddleware');

// GET /api/analytics/overview (recruiter-only single source of truth)
router.get('/overview', protect, recruiterOnly, analyticsController.getAnalyticsOverview);

// GET /api/analytics/insights (backward compatibility)
router.get('/insights', optionalProtect, analyticsController.getPipelineInsights);

module.exports = router;
