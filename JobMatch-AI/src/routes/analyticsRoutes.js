const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { optionalProtect } = require('../middlewares/authMiddleware');

// GET /api/analytics/insights
router.get('/insights', optionalProtect, analyticsController.getPipelineInsights);

module.exports = router;
