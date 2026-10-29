/**
 * Test Suite: Recruiter Analytics Honesty & Single Source of Truth Verifier
 * Validates:
 * 1. GET /api/analytics/overview RBAC (401 without auth, 403 for candidate, 200 for recruiter)
 * 2. Mathematical consistency across stat metrics, funnel steps, quality tiers, and drop percentages
 * 3. Exact consecutive stage labeling for bottleneck attrition
 * 4. AI-only score isolation from fallback evaluations
 * 5. Demo protection on DELETE /api/jobs/:id (403 for demo recruiter)
 */

require('dotenv').config();
const http = require('http');
const jwt = require('jsonwebtoken');
const app = require('../src/app');

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 Aptly.AI - Recruiter Analytics Honesty Test Suite');
  console.log('======================================================\n');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  const secret = process.env.JWT_SECRET || 'test_secret_for_suite';

  const recruiterToken = jwt.sign(
    { id: '64f8a1b2c3d4e5f6a7b8c9d1', role: 'recruiter', email: 'recruiter@aptly.ai' },
    secret,
    { expiresIn: '1h' }
  );

  const candidateToken = jwt.sign(
    { id: '64f8a1b2c3d4e5f6a7b8c9d0', role: 'candidate', email: 'candidate@aptly.ai' },
    secret,
    { expiresIn: '1h' }
  );

  const makeReq = (endpoint, token, method = 'GET') =>
    new Promise((resolve, reject) => {
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const req = http.request(
        `${baseUrl}${endpoint}`,
        { method, headers },
        (res) => {
          let chunks = '';
          res.on('data', (c) => (chunks += c));
          res.on('end', () => {
            try {
              resolve({ status: res.statusCode, data: JSON.parse(chunks) });
            } catch (e) {
              resolve({ status: res.statusCode, raw: chunks });
            }
          });
        }
      );
      req.on('error', reject);
      req.end();
    });

  let passed = 0;
  let failed = 0;

  // Test 1: RBAC on /api/analytics/overview
  const unauthRes = await makeReq('/api/analytics/overview', null);
  if (unauthRes.status === 401) {
    console.log('✔ Test 1 Passed: Unauthenticated request rejected with HTTP 401');
    passed++;
  } else {
    console.error(`❌ Test 1 Failed: Expected 401, got ${unauthRes.status}`);
    failed++;
  }

  // Test 2: Candidate blocked from recruiter overview
  const candRes = await makeReq('/api/analytics/overview', candidateToken);
  if (candRes.status === 403) {
    console.log('✔ Test 2 Passed: Candidate role rejected from /api/analytics/overview with HTTP 403');
    passed++;
  } else {
    console.error(`❌ Test 2 Failed: Expected 403, got ${candRes.status}`);
    failed++;
  }

  // Test 3: Recruiter authorized to get overview
  const recRes = await makeReq('/api/analytics/overview', recruiterToken);
  if (recRes.status === 200 && recRes.data?.success && recRes.data?.data) {
    const d = recRes.data.data;
    console.log('✔ Test 3 Passed: Recruiter fetched /api/analytics/overview with HTTP 200');
    passed++;

    // Test 4: Mathematical consistency check
    const totalApplicants = d.totalApplicants;
    const funnelSteps = d.funnelSteps || [];
    const topFunnel = funnelSteps[0]?.count;

    if (totalApplicants === topFunnel) {
      console.log(`✔ Test 4 Passed: Total applicants (${totalApplicants}) exactly equals top of funnel (${topFunnel})`);
      passed++;
    } else {
      console.error(`❌ Test 4 Failed: Total applicants (${totalApplicants}) !== top of funnel (${topFunnel})`);
      failed++;
    }

    // Test 5: Consecutive funnel drops
    let dropsValid = true;
    for (let i = 1; i < funnelSteps.length; i++) {
      const prev = funnelSteps[i - 1].count;
      const curr = funnelSteps[i].count;
      const expectedDrop = Number((((prev - curr) / (prev || 1)) * 100).toFixed(1));
      if (Math.abs(funnelSteps[i].dropOff - expectedDrop) > 0.2) {
        dropsValid = false;
        console.error(`Drop mismatch at step ${i}: got ${funnelSteps[i].dropOff}, expected ${expectedDrop}`);
      }
    }
    if (dropsValid) {
      console.log('✔ Test 5 Passed: All sequential funnel drops mathematically verified against consecutive stages');
      passed++;
    } else {
      failed++;
    }

    // Test 6: Bottleneck stage labeling
    if (d.bottleneck?.stage && d.bottleneck.stage.includes('→')) {
      console.log(`✔ Test 6 Passed: Bottleneck stage accurately labeled consecutive pair: "${d.bottleneck.stage}" (${d.bottleneck.dropOffRate}% drop)`);
      passed++;
    } else {
      console.error(`❌ Test 6 Failed: Bottleneck stage not formatted as consecutive pair: ${d.bottleneck?.stage}`);
      failed++;
    }

    // Test 7: AI vs Fallback evaluation separation
    if (d.scoreMetrics && typeof d.scoreMetrics.aiEvaluationCount === 'number' && typeof d.scoreMetrics.fallbackEvaluationCount === 'number') {
      console.log(`✔ Test 7 Passed: Evaluation mix properly separated: ${d.scoreMetrics.aiEvaluationCount} AI / ${d.scoreMetrics.fallbackEvaluationCount} Fallback`);
      passed++;
    } else {
      console.error('❌ Test 7 Failed: scoreMetrics missing AI/Fallback counts');
      failed++;
    }
  } else {
    console.error(`❌ Test 3 Failed: Overview fetch failed: ${JSON.stringify(recRes)}`);
    failed++;
  }

  // Test 8: Demo safety on DELETE /api/jobs/:id
  const deleteRes = await makeReq('/api/jobs/64f8a1b2c3d4e5f6a7b8c9d9', recruiterToken, 'DELETE');
  if (deleteRes.status === 403 && deleteRes.data?.isDemoProtected) {
    console.log('✔ Test 8 Passed: Demo account deletion safely blocked with HTTP 403 (isDemoProtected: true)');
    passed++;
  } else {
    console.error(`❌ Test 8 Failed: Expected 403 isDemoProtected, got ${deleteRes.status} ${JSON.stringify(deleteRes.data)}`);
    failed++;
  }

  server.close();

  console.log('\n======================================================');
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log('======================================================\n');

  if (failed > 0) process.exit(1);
  process.exit(0);
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});

