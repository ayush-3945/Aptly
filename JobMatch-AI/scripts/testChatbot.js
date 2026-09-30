const app = require('../src/app');
const http = require('http');

async function testChatbot() {
  console.log('🧪 Testing Aptly Chatbot Fallback / Proxy Architecture...\n');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/chat`;

  try {
    // 1. Test Domain Question (Knowledge Engine Fallback)
    console.log('Test 1: Asking "What is Aptly and how does match score work?"');
    const res1 = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'What is Aptly and how does match score work?',
        sessionId: 'test-session-1',
        userRole: 'candidate',
      }),
    });

    const data1 = await res1.json();
    console.log('Status:', res1.status);
    console.log('Source:', data1.source);
    console.log('Response preview:', data1.message.slice(0, 140) + '...');
    console.log('Suggestions:', data1.suggestions);

    if (res1.status === 200 && data1.success && data1.message) {
      console.log('\n✅ Test 1 Passed!\n');
    } else {
      throw new Error('Test 1 failed with unexpected response');
    }

    // 2. Test Recruiter JD Quality Question
    console.log('Test 2: Asking "How does JD quality and bias detection work?"');
    const res2 = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'How does JD quality and bias detection work?',
        sessionId: 'test-session-2',
        userRole: 'recruiter',
      }),
    });

    const data2 = await res2.json();
    console.log('Status:', res2.status);
    console.log('Source:', data2.source);
    console.log('Response preview:', data2.message.slice(0, 140) + '...');

    if (res2.status === 200 && data2.success && data2.message) {
      console.log('\n✅ Test 2 Passed!\n');
    } else {
      throw new Error('Test 2 failed with unexpected response');
    }

    console.log('🎉 All Chatbot Backend Tests PASSED Successfully!');
  } finally {
    server.close();
  }
}

testChatbot().catch((err) => {
  console.error('❌ Chatbot Test Failed:', err);
  process.exit(1);
});
