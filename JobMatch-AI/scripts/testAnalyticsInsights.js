#!/usr/bin/env node
/**
 * Verification test for Talent Pipeline Analytics & Intelligence
 */
require('dotenv').config();
const { getPipelineAnalytics } = require('../src/services/analyticsService');

async function testAnalytics() {
  console.log('🧪 Testing getPipelineAnalytics()...\n');
  try {
    const result = await getPipelineAnalytics();
    console.log('✔ Pipeline analytics fetched successfully!');
    console.log('\n--- Aggregated Data Summary ---');
    console.log(`Total Applicants: ${result.aggregatedData.totalApplicants}`);
    console.log(`Conversion Rate: ${result.aggregatedData.conversionRate}% (${result.aggregatedData.conversionTrend})`);
    console.log(`Avg AI Match Score: ${result.aggregatedData.avgAiMatchScore}%`);
    console.log(`Funnel Stages: ${result.aggregatedData.funnelSteps.map(f => `${f.stage}: ${f.count} (${f.dropOff}% drop)`).join(' -> ')}`);
    console.log(`Top Skills: ${result.aggregatedData.topSkills.map(s => `${s.skill} (${s.demandScore}pts, ${s.trend})`).join(', ')}`);

    console.log('\n--- AI Insights ---');
    console.log(`Pipeline Health: ${result.aiInsights.pipelineHealth}`);
    console.log(`Key Insights Count: ${result.aiInsights.keyInsights.length}`);
    console.log(`Bottleneck Stage: ${result.aiInsights.bottleneck.stage} (${result.aiInsights.bottleneck.dropOffRate}% drop-off)`);
    console.log(`Bottleneck Reason: ${result.aiInsights.bottleneck.reason}`);
    console.log(`Recommendations Count: ${result.aiInsights.recommendations.length}`);
    result.aiInsights.recommendations.forEach((r, idx) => {
      console.log(`  ${idx + 1}. [${r.priority.toUpperCase()}] ${r.title} -> ${r.expectedImpact}`);
    });

    console.log('\n✨ Backend Verification PASSED!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  }
}

testAnalytics();
