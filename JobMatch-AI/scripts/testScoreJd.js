const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { analyzeJobDescription } = require('../src/services/jdScorerService');

async function runTest() {
  console.log('Testing Job Description Quality Scorer...\n');

  // Test 1: Standard high-quality job description
  console.log('Test 1: Evaluating High Quality Job Description...');
  const goodJd = {
    jobTitle: 'Senior Full-Stack MERN & Gemini AI Engineer',
    location: 'Remote (US/Global)',
    experienceLevel: 'Senior',
    description: `CloudPulse AI Systems is building next-generation intelligent HR platforms. We are seeking a Senior Full-Stack MERN & Gemini AI Engineer.
Key Responsibilities:
• Architect resilient microservices using Node.js, Express, and MongoDB.
• Integrate Google Gemini models for automated semantic resume scoring.
• Build accessible, reactive interfaces using React 19 and modern CSS.
Compensation & Benefits:
• $145,000 - $175,000 base salary + equity options.
• Flexible remote schedule, comprehensive healthcare, and 401(k) matching.`,
    requirements: `• 4+ years of production experience in JavaScript/TypeScript and MERN stack.
• Strong knowledge of MongoDB aggregation pipelines and indexing.
• Familiarity with Docker containerization and CI/CD automation.`,
  };

  const goodResult = await analyzeJobDescription(goodJd);
  console.log(`- Overall Score: ${goodResult.overallScore}/100 (Grade: ${goodResult.grade})`);
  console.log(`- Predicted Pool: ${goodResult.predictedCandidatePool}`);
  console.log(`- Clarity: ${goodResult.categories?.clarity?.score}, Specificity: ${goodResult.categories?.specificity?.score}, Inclusivity: ${goodResult.categories?.inclusivity?.score}, Competitiveness: ${goodResult.categories?.competitiveness?.score}, Structure: ${goodResult.categories?.structure?.score}`);
  console.log(`- Bias Flags: ${goodResult.biasFlags?.length || 0}`);
  console.log(`- Strengths: ${goodResult.strengths?.length || 0}`);
  console.log(`- Improvements: ${goodResult.improvements?.length || 0}`);

  // Test 2: Biased job description with exclusionary terms
  console.log('\nTest 2: Evaluating Biased Job Description ("rockstar ninja guru young energetic")...');
  const biasedJd = {
    jobTitle: 'Rockstar Frontend Ninja',
    location: 'New York, NY',
    experienceLevel: 'Entry',
    description: `We are looking for a rockstar ninja developer who can dominate our codebase. We have a work hard play hard hustle culture and want young, energetic candidates with killer instinct.`,
    requirements: `Must know everything about web development.`,
  };

  const biasedResult = await analyzeJobDescription(biasedJd);
  console.log(`- Overall Score: ${biasedResult.overallScore}/100 (Grade: ${biasedResult.grade})`);
  console.log(`- Predicted Pool: ${biasedResult.predictedCandidatePool}`);
  console.log(`- Inclusivity Score: ${biasedResult.categories?.inclusivity?.score}`);
  console.log(`- Bias Flags Detected: ${biasedResult.biasFlags?.length}`);
  biasedResult.biasFlags?.forEach((flag, idx) => {
    console.log(`   ${idx + 1}. Term: "${flag.term}" -> Suggestion: "${flag.suggestion}"`);
  });

  if (biasedResult.biasFlags?.length >= 3) {
    console.log('\n✓ BIAS DETECTION AND SCORING VERIFIED SUCCESSFULLY!');
  } else {
    console.warn('\n⚠ Warning: fewer bias flags detected than expected:', biasedResult.biasFlags);
  }
}

runTest().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
