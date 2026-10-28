require('dotenv').config();
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test_jwt_secret_for_unit_tests';
}

const http = require('http');
const app = require('../src/app');

async function runQuickMatchTests() {
  console.log('\n======================================================');
  console.log('🧪 Aptly.AI - Public Quick Match Playground Test Suite');
  console.log('======================================================\n');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;

  const postJSON = (path, body) => {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify(body);
      const req = http.request(
        {
          hostname: '127.0.0.1',
          port,
          path,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data),
          },
        },
        (res) => {
          let buf = '';
          res.on('data', (c) => (buf += c));
          res.on('end', () => {
            try {
              resolve({ status: res.statusCode, body: JSON.parse(buf) });
            } catch {
              resolve({ status: res.statusCode, body: buf });
            }
          });
        }
      );
      req.on('error', reject);
      req.write(data);
      req.end();
    });
  };

  try {
    // Test 1: Missing Fields
    const res1 = await postJSON('/api/public/quick-match', { jobDescription: 'React developer' });
    if (res1.status === 400 && res1.body.error) {
      console.log('✔ Test 1 Passed: Missing resumeText properly rejected with HTTP 400');
    } else {
      throw new Error(`Test 1 Failed: Expected 400, got ${res1.status}`);
    }

    // Test 2: Field Length Exceeded (> 3000 chars)
    const longText = 'a'.repeat(3001);
    const res2 = await postJSON('/api/public/quick-match', {
      jobDescription: longText,
      resumeText: 'React developer with 3 years experience',
    });
    if (res2.status === 400 && res2.body.error && res2.body.error.includes('3,000 characters')) {
      console.log('✔ Test 2 Passed: Text exceeding 3000 chars properly rejected with HTTP 400');
    } else {
      throw new Error(`Test 2 Failed: Expected 400 length error, got ${res2.status}`);
    }

    // Test 3: Successful Rule-Based Match
    const res3 = await postJSON('/api/public/quick-match', {
      jobDescription: 'Senior Full-Stack Engineer requiring React, Node.js, Express, MongoDB, and Docker. 4+ years required.',
      resumeText: 'Full Stack Software Engineer with 4 years of experience specializing in React, Node.js, Express, MongoDB. Bachelor in Computer Science.',
    });

    if (res3.status === 200 && res3.body.matchScore !== undefined) {
      const b = res3.body;
      const expectedWeighted = Math.round(
        b.scoreBreakdown.skills * 0.4 +
        b.scoreBreakdown.experience * 0.3 +
        b.scoreBreakdown.domain * 0.2 +
        b.scoreBreakdown.education * 0.1
      );
      if (b.matchScore !== expectedWeighted) {
        throw new Error(`Formula mismatch: expected ${expectedWeighted}, got ${b.matchScore}`);
      }
      if (!b.matchedSkills.includes('React') || !b.missingSkills.includes('Docker')) {
        throw new Error('Skills classification mismatch');
      }
      console.log(`✔ Test 3 Passed: Computed match score (${b.matchScore}%) matches 40/30/20/10 formula exactly`);
    } else {
      throw new Error(`Test 3 Failed: ${JSON.stringify(res3)}`);
    }

    // Test 4: Body Size Exceeding 20KB is rejected with HTTP 413
    const bigPayload = {
      jobDescription: 'React developer',
      resumeText: 'a'.repeat(25 * 1024), // 25KB
    };
    const res4 = await postJSON('/api/public/quick-match', bigPayload);
    if (res4.status === 413) {
      console.log('✔ Test 4 Passed: Payload exceeding 20KB properly rejected with HTTP 413');
    } else {
      throw new Error(`Test 4 Failed: Expected 413, got ${res4.status}`);
    }

    console.log('\n======================================================');
    console.log('Results: All Public Quick-Match Tests Passed (4/4)');
    console.log('======================================================\n');
  } finally {
    server.close();
  }
}

runQuickMatchTests().catch((err) => {
  console.error('Quick Match Test Failure:', err);
  process.exit(1);
});

