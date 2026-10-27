/**
 * Automated Security & Path Traversal Verification Test Suite
 * Validates that /api/resumes/parse properly defends against directory traversal,
 * rejects non-PDF file references, and resolves files strictly within uploads/resumes.
 */

require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const app = require('../src/app');

async function runPathTraversalTests() {
  console.log('\n======================================================');
  console.log('🛡️ Aptly.AI - Path Traversal & File Resolution Test Suite');
  console.log('======================================================\n');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  const secret = process.env.JWT_SECRET || 'test_secret_for_suite';
  const candidateToken = jwt.sign(
    { id: '64f8a1b2c3d4e5f6a7b8c9d0', role: 'candidate', email: 'candidate@jobmatch.ai' },
    secret,
    { expiresIn: '1h' }
  );

  const makePost = (endpoint, body) =>
    new Promise((resolve, reject) => {
      const data = JSON.stringify(body);
      const req = http.request(
        `${baseUrl}${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data),
            Authorization: `Bearer ${candidateToken}`,
          },
        },
        (res) => {
          let chunks = '';
          res.on('data', (c) => (chunks += c));
          res.on('end', () => {
            try {
              resolve({ status: res.statusCode, data: JSON.parse(chunks) });
            } catch (_e) {
              resolve({ status: res.statusCode, raw: chunks });
            }
          });
        }
      );
      req.on('error', reject);
      req.write(data);
      req.end();
    });

  let passed = 0;
  let failed = 0;

  // Test 1: Reject relative path to sensitive file (../../package.json)
  try {
    const res = await makePost('/api/resumes/parse', { fileId: '../../package.json' });
    if (res.status === 400 && res.data.message.includes('must reference a .pdf')) {
      console.log('✔ Test 1 Passed: Rejected non-PDF path traversal attempt with HTTP 400');
      passed++;
    } else {
      console.error('❌ Test 1 Failed: Expected HTTP 400, got', res.status, res.data);
      failed++;
    }
  } catch (e) {
    console.error('❌ Test 1 Exception:', e.message);
    failed++;
  }

  // Test 2: Stripping path traversal on fake pdf (../../secret.pdf)
  try {
    const res = await makePost('/api/resumes/parse', { fileId: '../../secret.pdf' });
    if (res.status === 404 && res.data.message.includes('Resume file not found')) {
      console.log('✔ Test 2 Passed: Path traversal stripped; non-existent upload returns safe HTTP 404');
      passed++;
    } else {
      console.error('❌ Test 2 Failed: Expected HTTP 404, got', res.status, res.data);
      failed++;
    }
  } catch (e) {
    console.error('❌ Test 2 Exception:', e.message);
    failed++;
  }

  // Test 3: Missing fileId payload
  try {
    const res = await makePost('/api/resumes/parse', {});
    if (res.status === 400 && res.data.message.includes('Please provide a valid fileId')) {
      console.log('✔ Test 3 Passed: Missing fileId payload rejected with HTTP 400');
      passed++;
    } else {
      console.error('❌ Test 3 Failed: Expected HTTP 400, got', res.status, res.data);
      failed++;
    }
  } catch (e) {
    console.error('❌ Test 3 Exception:', e.message);
    failed++;
  }

  // Test 4: Access control - Recruiter cannot access candidate-only route
  try {
    const recruiterToken = jwt.sign(
      { id: '64f8a1b2c3d4e5f6a7b8c9d1', role: 'recruiter', email: 'recruiter@jobmatch.ai' },
      secret,
      { expiresIn: '1h' }
    );
    const req = http.request(
      `${baseUrl}/api/resumes/parse`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${recruiterToken}`,
        },
      },
      (res) => {
        let chunks = '';
        res.on('data', (c) => (chunks += c));
        res.on('end', () => {
          if (res.statusCode === 403) {
            console.log('✔ Test 4 Passed: Recruiter rejected from candidateOnly endpoint with HTTP 403');
            passed++;
          } else {
            console.error('❌ Test 4 Failed: Expected HTTP 403, got', res.statusCode);
            failed++;
          }
          finish();
        });
      }
    );
    req.write(JSON.stringify({ fileId: 'test.pdf' }));
    req.end();
  } catch (e) {
    console.error('❌ Test 4 Exception:', e.message);
    failed++;
    finish();
  }

  function finish() {
    server.close();
    console.log('\n======================================================');
    console.log(`Results: ${passed} Passed, ${failed} Failed`);
    console.log('======================================================\n');
    if (failed > 0) process.exit(1);
    process.exit(0);
  }
}

runPathTraversalTests();
