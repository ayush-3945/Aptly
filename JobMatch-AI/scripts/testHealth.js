/**
 * JobMatch AI - Automated System Health & Telemetry Test Suite
 * Tests GET /api/health against the running Express application.
 */

require('dotenv').config();
const http = require('http');
const app = require('../src/app');

async function testHealthEndpoint() {
  console.log('\n======================================================');
  console.log('🩺 JobMatch AI - Production Health Telemetry Verifier');
  console.log('======================================================\n');

  const server = http.createServer(app);

  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      resolve();
    });
  });

  const address = server.address();
  const port = address.port;
  const healthUrl = `http://127.0.0.1:${port}/api/health`;

  console.log(`🌐 Ephemeral test server listening at: ${healthUrl}`);

  try {
    const res = await fetch(healthUrl);
    const status = res.status;
    const body = await res.json();

    console.log('\n📥 HTTP Response Code:', status);
    console.log('📋 Response Payload:');
    console.log(JSON.stringify(body, null, 2));

    // Assertions
    const errors = [];
    if (status !== 200) errors.push(`Expected HTTP 200, got ${status}`);
    if (body.status !== 'healthy') errors.push(`Expected status 'healthy', got '${body.status}'`);
    if (body.service !== 'JobMatch AI (Aptly) Backend') errors.push(`Unexpected service name: '${body.service}'`);
    if (typeof body.uptime !== 'number') errors.push(`Uptime should be a number, got ${typeof body.uptime}`);
    if (!body.database || typeof body.database.readyState !== 'number') errors.push('Missing database.readyState');
    if (!['connected', 'disconnected'].includes(body.database?.status)) {
      errors.push(`Database status should be 'connected' | 'disconnected', got '${body.database?.status}'`);
    }
    if (!body.aiEngine || body.aiEngine.status !== 'active') errors.push('Missing or invalid aiEngine.status');
    if (body.aiEngine.provider !== 'Google Gemini') errors.push(`Unexpected AI provider: '${body.aiEngine?.provider}'`);
    if (!['live_gemini_2.5_flash', 'deterministic_heuristic_fallback'].includes(body.aiEngine?.mode)) {
      errors.push(`Unexpected AI mode: '${body.aiEngine?.mode}'`);
    }
    if (!body.timestamp || isNaN(Date.parse(body.timestamp))) errors.push('Invalid timestamp format');

    if (errors.length > 0) {
      console.error('\n❌ Health check verification failed with errors:');
      errors.forEach((err) => console.error(`  - ${err}`));
      if (typeof server.closeAllConnections === 'function') {
        server.closeAllConnections();
      }
      server.close();
      process.exit(1);
    }

    console.log('\n✅ All System Health & Telemetry assertions passed successfully!');
    console.log('------------------------------------------------------\n');
    if (typeof server.closeAllConnections === 'function') {
      server.closeAllConnections();
    }
    server.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to test health endpoint:', err);
    if (server) {
      if (typeof server.closeAllConnections === 'function') {
        server.closeAllConnections();
      }
      server.close();
    }
    process.exit(1);
  }
}

testHealthEndpoint();