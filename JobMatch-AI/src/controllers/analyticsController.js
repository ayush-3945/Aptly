const analyticsService = require('../services/analyticsService');

/**
 * Controller: GET /api/analytics/overview
 * Recruiter-only single source of truth for all pipeline metrics,
 * stage counts, consecutive drop percentages, match tiers, and skill demand.
 */
const getAnalyticsOverview = async (req, res) => {
  try {
    const userId = req.user?._id;
    const userEmail = req.user?.email;
    const overview = await analyticsService.getPipelineOverview({ userId, userEmail });
    return res.status(200).json({
      success: true,
      data: overview,
    });
  } catch (error) {
    console.error('[AnalyticsController] Error fetching pipeline overview:', error.message);
    const sample = analyticsService.getVerifiedSampleOverview();
    return res.status(200).json({
      success: true,
      data: sample,
      warning: 'Verified sample data served due to processing error.',
    });
  }
};

/**
 * Controller: GET /api/analytics/insights
 * Returns pipeline metrics and talent insights (backward compatibility)
 */
const getPipelineInsights = async (req, res) => {
  try {
    const analytics = await analyticsService.getPipelineAnalytics();
    return res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error('[AnalyticsController] Error fetching pipeline insights:', error.message);
    const fallback = {
      aggregatedData: analyticsService.DEFAULT_BASELINE_TELEMETRY,
      aiInsights: analyticsService.generateFallbackInsights(analyticsService.DEFAULT_BASELINE_TELEMETRY),
      lastUpdated: new Date().toISOString(),
    };
    return res.status(200).json({
      success: true,
      data: fallback,
      warning: 'Baseline analytics provided due to telemetry processing error.',
    });
  }
};

module.exports = {
  getAnalyticsOverview,
  getPipelineInsights,
};
