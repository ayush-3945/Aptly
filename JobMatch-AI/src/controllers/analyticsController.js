const analyticsService = require('../services/analyticsService');

/**
 * Controller: GET /api/analytics/insights
 * Returns pipeline metrics and Gemini 2.5 Flash talent insights
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
    // Graceful fallback with baseline data
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
  getPipelineInsights,
};
