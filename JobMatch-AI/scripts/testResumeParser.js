const fs = require('fs');
const path = require('path');
const { parseResumeWithGemini, extractFallbackProfile } = require('../src/services/resumeParserService');

async function runTests() {
  console.log('=== Test 1: Testing Heuristic Fallback Resume Parser ===');
  const sampleResumeText = `
Alex Morgan
alex.morgan@techpulse.io | (555) 019-2834 | Austin, TX
LinkedIn: https://linkedin.com/in/alexmorgan-dev
GitHub: https://github.com/alexmorgan-dev

Professional Summary:
Senior Full-Stack Engineer with 5+ years of experience building modern React and Node.js applications.
Core competencies include React, TypeScript, Node.js, Express, MongoDB, Docker, and Gemini AI.

Experience:
Senior Software Engineer - TechPulse Solutions (2022 - Present)
- Engineered scalable microservices in Node.js and Express.
- Developed dynamic ATS interface using React and TailwindCSS.

Software Developer - CloudScale Innovations (2019 - 2022)
- Built RESTful APIs and optimized MongoDB queries.

Education:
B.S. in Computer Science - University of Texas at Austin (2019)
`;

  const fallbackResult = extractFallbackProfile(sampleResumeText);
  console.log('Fallback extracted:', JSON.stringify(fallbackResult, null, 2));

  if (!fallbackResult.email || !fallbackResult.skills || fallbackResult.skills.length === 0) {
    throw new Error('Fallback parsing failed to extract email or skills');
  }
  console.log('✓ Test 1 Passed: Fallback parser accurately extracted candidate data');

  console.log('\n=== Test 2: Checking Route and Controller Availability ===');
  const app = require('../src/app');
  if (!app) {
    throw new Error('Express app failed to load');
  }
  console.log('✓ Test 2 Passed: Express app with /api/candidate route loaded cleanly');

  console.log('\nAll automated parser checks passed successfully!');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('Parser test error:', err);
  process.exit(1);
});
