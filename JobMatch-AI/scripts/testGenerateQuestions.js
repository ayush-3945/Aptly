const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { generateInterviewQuestions } = require('../src/services/interviewQuestionService');

async function runTest() {
  console.log('Testing Interview Question Generation...');
  const sampleCandidate = {
    candidateName: 'Priya Sharma',
    jobTitle: 'Senior Full-Stack Engineer',
    matchScore: 82,
    matchedSkills: ['React', 'Node.js', 'Express', 'PostgreSQL'],
    missingSkills: ['Kubernetes', 'GraphQL', 'AWS ECS'],
    jobRequirements: '5+ years full-stack experience, container orchestration, high-throughput microservices.',
  };

  try {
    const result = await generateInterviewQuestions(sampleCandidate);
    console.log('Questions successfully generated!');
    console.log(`- Warmup questions: ${result.warmup?.length}`);
    console.log(`- Technical questions: ${result.technical?.length}`);
    console.log(`- Gap Probe questions: ${result.gapProbe?.length}`);
    console.log(`- Behavioral questions: ${result.behavioral?.length}`);
    console.log(`- Closing questions: ${result.closing?.length}`);

    console.log('\nSample Technical Question:', JSON.stringify(result.technical[0], null, 2));
    console.log('\nSample Gap Probe Question:', JSON.stringify(result.gapProbe[0], null, 2));

    if (
      result.warmup?.length === 2 &&
      result.technical?.length === 4 &&
      result.gapProbe?.length === 3 &&
      result.behavioral?.length === 2 &&
      result.closing?.length === 1
    ) {
      console.log('\n✓ ALL QUESTION COUNTS MATCH SPECIFICATION!');
    } else {
      console.warn('\n⚠ Question counts differed:', {
        warmup: result.warmup?.length,
        technical: result.technical?.length,
        gapProbe: result.gapProbe?.length,
        behavioral: result.behavioral?.length,
        closing: result.closing?.length,
      });
    }
  } catch (err) {
    console.error('Test failed with error:', err);
    process.exit(1);
  }
}

runTest();
