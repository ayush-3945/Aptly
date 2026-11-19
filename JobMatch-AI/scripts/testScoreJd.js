/**
 * Aptly.AI - Automated JD Quality Scorer & Fallback Reliability Test Suite
 * Tests rule-based fallback scoring, honest checks, biased-term detection, and HTTP API response.
 */

const path = require('path');
const http = require('http');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { generateFallbackJdScore, BIASED_TERMS_DICTIONARY } = require('../src/services/jdScorerService');
const app = require('../src/app');

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    throw new Error(message);
  }
  passedTests++;
  console.log(`✔ Passed: ${message}`);
}

async function runTestSuite() {
  console.log('\n======================================================');
  console.log('🧪 Aptly.AI - JD Quality Scorer & Fallback Test Suite');
  console.log('======================================================\n');

  // -----------------------------------------------------------------
  // Test 1: Clean high-quality job description evaluated by fallback
  // -----------------------------------------------------------------
  console.log('--- Test Group 1: Clean High-Quality Job Description ---');
  const cleanJd = {
    jobTitle: 'Staff Backend Systems Engineer',
    skills: ['Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Docker', 'AWS'],
    location: 'Remote (US/India)',
    experienceLevel: 'Senior',
    description: `CloudPulse Systems is building high-volume candidate screening architecture.
Key Responsibilities:
• Architect scalable Node.js microservices and RESTful APIs connecting to MongoDB clusters.
• Design resilient background job processing pipelines and caching layers.
• Collaborate with product managers and engineers to uphold 99.9% uptime.
Compensation & Benefits:
• $150,000 - $185,000 base salary + equity options.
• Comprehensive health insurance, 401(k) matching, and remote work stipends.`,
    requirements: `Requirements & Qualifications:
• 5+ years of production experience in JavaScript/TypeScript and Node.js.
• Strong knowledge of MongoDB aggregation pipelines and indexing strategies.
• Hands-on experience with Docker containerization and AWS infrastructure.`,
  };

  const cleanResult = generateFallbackJdScore(cleanJd);

  assert(cleanResult.source === 'fallback', 'Result is tagged with source: "fallback"');
  assert(typeof cleanResult.overallScore === 'number' && cleanResult.overallScore >= 70, `Overall score is honest and valid (${cleanResult.overallScore}/100)`);
  assert(cleanResult.categories === undefined, 'No fabricated category scores returned in fallback');
  assert(Boolean(cleanResult.checks), 'Honest checks object is present');
  assert(cleanResult.checks.descriptionLength.passed === true, 'Description length check passed (>80 words)');
  assert(cleanResult.checks.sections.passed === true, 'Sections check passed (responsibilities, requirements, benefits all present)');
  assert(cleanResult.checks.skillsCount.passed === true, 'Skills count check passed (6 skills listed)');
  assert(cleanResult.checks.salaryMentioned.passed === true, 'Salary mentioned check passed');
  assert(cleanResult.checks.biasScan.passed === true, 'Bias scan check passed (0 biased terms in clean JD)');
  assert(cleanResult.biasFlags.length === 0, 'Zero bias flags in clean JD');

  // -----------------------------------------------------------------
  // Test 2: Biased job description with all 7 targeted buzzwords
  // (young, energetic, rockstar, ninja, guru, work hard play hard, aggressive)
  // -----------------------------------------------------------------
  console.log('\n--- Test Group 2: Biased Job Description Scan ---');
  const biasedJd = {
    jobTitle: 'Rockstar Frontend Ninja',
    skills: ['React'],
    location: 'New York, NY',
    experienceLevel: 'Entry',
    description: `We are looking for a rockstar ninja and coding guru who can dominate our aggressive product roadmap.
We have a work hard play hard hustle culture and require young, energetic candidates with killer instinct.`,
    requirements: `Must know everything about web applications.`,
  };

  const biasedResult = generateFallbackJdScore(biasedJd);

  assert(biasedResult.source === 'fallback', 'Biased result is tagged with source: "fallback"');
  assert(biasedResult.checks.biasScan.passed === false, 'Bias scan check correctly failed for exclusionary JD');
  assert(biasedResult.biasFlags.length >= 7, `Detected all targeted biased terms (detected: ${biasedResult.biasFlags.length})`);

  const detectedTerms = biasedResult.biasFlags.map((b) => b.term.toLowerCase());
  const expectedTerms = ['young', 'energetic', 'rockstar', 'ninja', 'guru', 'work hard play hard', 'aggressive'];

  expectedTerms.forEach((expected) => {
    const found = detectedTerms.includes(expected);
    assert(found, `Biased term "${expected}" accurately detected`);
    const flagObj = biasedResult.biasFlags.find((b) => b.term.toLowerCase() === expected);
    assert(Boolean(flagObj && flagObj.suggestion), `Inclusive alternative provided for "${expected}": "${flagObj?.suggestion}"`);
  });

  assert(biasedResult.checks.salaryMentioned.passed === false, 'Salary check correctly failed when no compensation is mentioned');
  assert(biasedResult.overallScore < 50, `Overall score penalized for biased terms and missing sections (${biasedResult.overallScore}/100)`);

  // -----------------------------------------------------------------
  // Test 3: HTTP POST /api/jobs/score-jd Integration
  // -----------------------------------------------------------------
  console.log('\n--- Test Group 3: HTTP Endpoint POST /api/jobs/score-jd ---');
  const server = http.createServer(app);

  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });

  const port = server.address().port;
  const postData = JSON.stringify({
    jobTitle: 'Full-Stack Developer',
    skills: ['React', 'Node.js', 'Express', 'MongoDB'],
    description: 'CloudPulse is hiring a Full-Stack Developer to build user interfaces and REST APIs. Responsibilities include shipping features weekly and optimizing databases.',
    requirements: '3+ years experience with React, Node.js, and MongoDB. Benefits include competitive salary and health insurance.',
    location: 'Remote',
    experienceLevel: 'Mid-Level',
  });

  const httpResult = await new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path: '/api/jobs/score-jd',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve({ statusCode: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    req.on('error', reject);
    req.write(postData);
    req.end();
  });

  await new Promise((resolve) => server.close(resolve));

  assert(httpResult.statusCode === 200, `Endpoint returned HTTP 200 OK (received: ${httpResult.statusCode})`);
  assert(httpResult.data.success === true, 'Response JSON has success: true');
  assert(httpResult.data.source === 'fallback' || httpResult.data.source === 'ai', `Result contains source tag ("${httpResult.data.source}")`);
  assert(typeof httpResult.data.overallScore === 'number', `Response contains valid overallScore: ${httpResult.data.overallScore}`);

  if (httpResult.data.source === 'fallback') {
    assert(Boolean(httpResult.data.checks), 'Fallback response provides honest checks object');
    assert(httpResult.data.categories === undefined || httpResult.data.categories === null, 'Fallback response does not provide fabricated categories');
  }

  console.log('\n======================================================');
  console.log(`Results: All ${passedTests}/${totalTests} JD Quality Scorer Tests Passed!`);
  console.log('======================================================\n');
}

runTestSuite()
  .catch((err) => {
    console.error('Test suite failed:', err);
    process.exit(1);
  });
