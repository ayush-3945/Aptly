#!/usr/bin/env node
/**
 * JobMatch AI - Phase 2 AI Pipeline Verification & Multi-Resume Benchmark Suite
 * Evaluates distinct candidate archetypes against job requirements and asserts ATS scoring accuracy.
 */

require('dotenv').config();
const { evaluateMatch, generateFallbackEvaluation } = require('../src/services/aiMatcherService');
const { isGeminiConfigured } = require('../src/config/aiConfig');

// 1. Target Job Definition
const targetJob = {
  title: 'Full-Stack MERN & AI Engineer',
  company: 'TechPulse Solutions',
  location: 'Remote',
  requiredSkills: ['React', 'Node.js', 'Express', 'MongoDB', 'Gemini AI', 'Docker'],
  description: `We are looking for a Senior Full-Stack MERN & AI Engineer.
Responsibilities:
- Build modern, accessible frontends using React 19 and TailwindCSS.
- Architect high-throughput Node.js and Express REST microservices.
- Design performant MongoDB database schemas and complex aggregation pipelines.
- Integrate Google Gemini AI SDK for semantic intelligence, embeddings, and chat pipelines.
- Containerize application services using Docker and manage CI/CD deployment pipelines.`,
};

// 2. Candidate Archetypes
const candidates = [
  {
    id: 'Candidate A',
    archetype: 'Strong Match (Senior MERN & AI Engineer)',
    resumeText: `ALEX MERCER
Email: alex.mercer@example.com | GitHub: github.com/alex-mercer | Phone: +1-555-0192
Location: San Francisco, CA

PROFESSIONAL SUMMARY
Senior Full-Stack MERN & AI Engineer with 4+ years of hands-on experience architecting and deploying production-grade web applications. Proven track record scaling Node.js microservices, building responsive React 19 frontends, optimizing MongoDB aggregations, and integrating Gemini AI models into enterprise workflows.

TECHNICAL SKILLS
- Frontend: React 19, React Hooks, Redux Toolkit, Next.js, HTML5, CSS3, TailwindCSS
- Backend: Node.js, Express, RESTful APIs, Microservices, WebSockets, JWT Authentication
- Databases: MongoDB, Mongoose, Aggregation Pipelines, Redis
- Cloud & AI: Gemini AI SDK, LLM Prompt Engineering, Docker, Docker Compose, AWS, CI/CD, Git

EXPERIENCE
Lead Full-Stack Engineer | CloudPeak Systems (2022 - Present)
- Architected and scaled 12+ Node.js and Express microservices processing over 2.5 million daily API requests.
- Spearheaded Gemini AI integration for automated resume screening and candidate evaluation, reducing recruiter screening time by 60%.
- Optimized MongoDB queries and indexing strategies, decreasing average aggregation response times from 340ms to 42ms.
- Containerized entire developer environment and production services with Docker and Kubernetes.

Full-Stack Developer | DevSphere Solutions (2020 - 2022)
- Built interactive customer portal using React and Express with end-to-end user authentication.
- Designed schema models and relational aggregations with MongoDB and Mongoose.`,
    expectedMinScore: 80,
    expectedMaxScore: 100,
    expectedRecommendation: 'Strong Match',
  },
  {
    id: 'Candidate B',
    archetype: 'Partial Match (Frontend Dev / Adjacent Skills)',
    resumeText: `BRENDA VANCE
Email: brenda.vance@example.com | Portfolio: brendavance.dev
Location: Austin, TX

PROFESSIONAL SUMMARY
Frontend React Developer with 2.5 years of experience creating dynamic, responsive web interfaces. Experienced with modern client-side workflows, basic Express API routes, and introductory Gemini AI prompt implementations. Eager to expand into backend microservices.

TECHNICAL SKILLS
- Languages & Frameworks: React, JavaScript (ES6+), Express, Gemini AI, HTML5, CSS3, TailwindCSS, Python, MySQL
- Tools & Libraries: Git, GitHub, REST APIs, Postman, Vite, Redux
- Familiar with: Basic Express routing, SQLite, Python data scripts

EXPERIENCE
Frontend Web Developer | PixelCraft Studio (2022 - Present)
- Developed responsive, client-facing single-page applications using React and Redux Toolkit.
- Built lightweight Express backend endpoints to serve mocked user profile data.
- Integrated simple Gemini AI prompts for automated copywriting assistance in client CMS tools.
- Styled accessible component libraries using TailwindCSS and CSS Grid/Flexbox.

Junior Web Associate | NetWorks Digital (2021 - 2022)
- Built marketing landing pages and automated internal data reports using Python scripts connected to MySQL databases.
- Consumed third-party REST APIs and handled frontend client state.`,
    expectedMinScore: 40,
    expectedMaxScore: 75,
    expectedRecommendation: 'Moderate Match',
  },
  {
    id: 'Candidate C',
    archetype: 'Clear Mismatch (Digital Marketing / Graphics)',
    resumeText: `CHLOE ADAMS
Email: chloe.adams@example.com | LinkedIn: linkedin.com/in/chloeadams
Location: Chicago, IL

PROFESSIONAL SUMMARY
Creative and analytical Digital Marketing Specialist & Graphic Designer with 5+ years of experience leading multi-channel growth campaigns, brand identity creation, search engine optimization (SEO), and content marketing.

CORE COMPETENCIES
- Marketing & Growth: Search Engine Optimization (SEO), SEM, Google Ads, Meta Business Suite, Email Campaigns
- Creative Tools: Adobe Photoshop, Adobe Illustrator, Canva, Figma (UI assets), InDesign
- Content & Web: WordPress, Squarespace, Copywriting, Google Analytics 4, HubSpot, Social Media Strategy

EXPERIENCE
Senior Digital Marketer | MediaWave Agency (2021 - Present)
- Managed end-to-end SEO campaigns that boosted organic client search traffic by 160% over 18 months.
- Designed promotional graphics, display ads, and branded social assets using Adobe Photoshop and Illustrator.
- Maintained company blog and client web pages using WordPress CMS.

Digital Marketing Associate | BrandReach Media (2019 - 2021)
- Spearheaded email marketing flows and Google Ads conversion funnels.
- Analyzed website visitor conversion rates using Google Analytics.`,
    expectedMinScore: 0,
    expectedMaxScore: 39,
    expectedRecommendation: 'Low Match',
  },
  {
    id: 'Candidate D',
    archetype: 'Edge Case (Scanned / Unextractable PDF)',
    resumeText: `[Scanned Image - Unreadable]`,
    expectedMinScore: null,
    expectedMaxScore: null,
    expectedRecommendation: 'Pending Evaluation',
  },
];

// Helper: Format string to fixed length
const pad = (str, len) => {
  const s = String(str ?? '');
  return s.length > len ? s.substring(0, len - 3) + '...' : s.padEnd(len, ' ');
};

// 3. Main Benchmark Runner
async function runAIBenchmark() {
  console.log('\n================================================================================================');
  console.log('                   JOBMATCH AI - PHASE 2 ATS EVALUATION & BENCHMARK SUITE                       ');
  console.log('================================================================================================');
  
  const liveAIActive = isGeminiConfigured();
  console.log(`[Configuration Status]`);
  console.log(`  Target Job          : ${targetJob.title} @ ${targetJob.company}`);
  console.log(`  Required Skills     : ${targetJob.requiredSkills.join(', ')}`);
  console.log(`  Gemini AI API Key   : ${liveAIActive ? 'Configured (Live Gemini API enabled)' : 'Not Configured (Testing Deterministic Heuristic Engine)'}`);
  console.log(`  Benchmark Profiles  : ${candidates.length} Candidate Archetypes`);
  console.log('------------------------------------------------------------------------------------------------\n');

  const results = [];
  let allPassed = true;

  for (const candidate of candidates) {
    process.stdout.write(`Evaluating ${candidate.id} (${candidate.archetype})... `);
    const startTime = Date.now();

    let evaluation;
    try {
      evaluation = await evaluateMatch(targetJob, candidate.resumeText);
    } catch (err) {
      evaluation = generateFallbackEvaluation(targetJob, candidate.resumeText, err.message);
    }

    const duration = Date.now() - startTime;
    const score = evaluation.matchScore;
    const rec = evaluation.recommendation;

    // Validate assertions
    let scorePass = false;
    if (candidate.expectedMinScore === null) {
      scorePass = score === null;
    } else {
      scorePass = typeof score === 'number' && score >= candidate.expectedMinScore && score <= candidate.expectedMaxScore;
    }

    const recPass = rec === candidate.expectedRecommendation;
    const passed = scorePass && recPass;

    if (!passed) {
      allPassed = false;
    }

    console.log(`${passed ? '✔ PASSED' : '✖ FAILED'} (${duration}ms) [Score: ${score !== null ? score + '%' : 'null'}, Rec: "${rec}"]`);

    results.push({
      candidate: candidate.id,
      archetype: candidate.archetype,
      score: score !== null ? `${score}%` : 'N/A (null)',
      matchedSkills: evaluation.matchedSkills.length > 0 ? evaluation.matchedSkills.join(', ') : 'None',
      missingSkills: evaluation.missingSkills.length > 0 ? evaluation.missingSkills.join(', ') : 'None',
      recommendation: rec,
      passed,
      reason: !passed ? `Expected score [${candidate.expectedMinScore}-${candidate.expectedMaxScore}], got ${score}; Expected "${candidate.expectedRecommendation}", got "${rec}"` : null,
    });
  }

  // 4. Render Formatted Benchmark Table
  console.log('\n\n### ATS Evaluation Benchmark Summary Table\n');
  console.log('+-------------+-------------------------------------+-------------+------------------------------------+------------------------------------+----------------------+----------+');
  console.log('| Candidate   | Archetype Profile                   | Match Score | Matched Skills                     | Missing Skills                     | Recommendation       | Status   |');
  console.log('+-------------+-------------------------------------+-------------+------------------------------------+------------------------------------+----------------------+----------+');

  for (const r of results) {
    const candidateCol = pad(r.candidate, 11);
    const archCol = pad(r.archetype, 35);
    const scoreCol = pad(r.score, 11);
    const matchedCol = pad(r.matchedSkills, 34);
    const missingCol = pad(r.missingSkills, 34);
    const recCol = pad(r.recommendation, 20);
    const statusCol = pad(r.passed ? 'PASSED' : 'FAILED', 8);

    console.log(`| ${candidateCol} | ${archCol} | ${scoreCol} | ${matchedCol} | ${missingCol} | ${recCol} | ${statusCol} |`);
  }
  console.log('+-------------+-------------------------------------+-------------+------------------------------------+------------------------------------+----------------------+----------+\n');

  // 5. Verification Verdict
  const total = results.length;
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = total - passedCount;

  console.log('================================================================================================');
  console.log(`BENCHMARK VERIFICATION RESULT: ${allPassed ? 'ALL TESTS PASSED (100%)' : 'SOME TESTS FAILED'}`);
  console.log(`Total Profiles Evaluated : ${total}`);
  console.log(`Passed Assertions        : ${passedCount}`);
  console.log(`Failed Assertions        : ${failedCount}`);
  console.log('================================================================================================\n');

  if (!allPassed) {
    console.error('Failure details:');
    results.filter((r) => !r.passed).forEach((f) => console.error(` - ${f.candidate}: ${f.reason}`));
    process.exit(1);
  } else {
    process.exit(0);
  }
}

// Execute benchmark
runAIBenchmark().catch((err) => {
  console.error('Fatal Benchmark Error:', err);
  process.exit(1);
});
