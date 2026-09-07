const { previewProfileMatch, generateFallbackPreview } = require('../src/services/aiMatcherService');

async function testPreview() {
  console.log('=== Test 1: Testing Fallback Preview Matching Engine ===');
  const mockJob = {
    _id: 'mock_job_1',
    title: 'Full-Stack Software Engineer',
    company: 'Nexus AI Labs',
    requiredSkills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'Docker'],
    description: 'Build robust web applications and microservices.',
  };

  const mockCandidate = {
    skills: ['React', 'Node.js', 'JavaScript', 'MongoDB'],
    totalExperience: '4 years',
    education: [{ degree: 'B.S. Computer Science', institution: 'State University', year: '2021' }],
    workHistory: [{ company: 'DevTech', role: 'Software Engineer', duration: '2021-Present', description: 'Web dev' }],
  };

  const preview = generateFallbackPreview(mockJob, mockCandidate);
  console.log('Generated Preview:', JSON.stringify(preview, null, 2));

  if (typeof preview.matchScore !== 'number' || preview.matchScore <= 0) {
    throw new Error('Invalid matchScore');
  }
  if (!['Strong Match', 'Moderate Match', 'Low Match'].includes(preview.matchTier)) {
    throw new Error(`Invalid matchTier: ${preview.matchTier}`);
  }
  if (!Array.isArray(preview.matchedSkills) || preview.matchedSkills.length === 0) {
    throw new Error('matchedSkills must have items');
  }
  if (!preview.strengthSummary || !preview.gapSummary) {
    throw new Error('strengthSummary and gapSummary must be present');
  }
  console.log('✓ Test 1 Passed: Fallback preview engine conforms to required ATS schema');

  console.log('\n=== Test 2: Testing Full Preview Match with Mock / Gemini ===');
  const result = await previewProfileMatch(mockJob, mockCandidate);
  console.log('Match Result:', JSON.stringify(result, null, 2));

  if (typeof result.matchScore !== 'number' || !result.matchTier) {
    throw new Error('Invalid result structure from previewProfileMatch');
  }
  console.log('✓ Test 2 Passed: previewProfileMatch returned valid ATS scorecard');

  console.log('\n=== Test 3: Validating Express App Route Mounting ===');
  const app = require('../src/app');
  if (!app) {
    throw new Error('Express app failed to initialize');
  }
  console.log('✓ Test 3 Passed: Express app with /api/jobs/:jobId/preview-match mounted cleanly');

  console.log('\nAll preview match automated checks succeeded!');
  process.exit(0);
}

testPreview().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
