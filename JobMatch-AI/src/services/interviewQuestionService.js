const { getGeminiClient, isGeminiConfigured, DEFAULT_MODEL } = require('../config/aiConfig');

/**
 * Intelligent deterministic fallback question generator
 * Used when Gemini API is unconfigured, rate-limited, or times out.
 */
const generateFallbackInterviewQuestions = ({
  candidateName = 'Candidate',
  jobTitle = 'Engineering Role',
  matchScore = 75,
  matchedSkills = [],
  missingSkills = [],
  jobRequirements = '',
}) => {
  const topMatched = matchedSkills.length > 0 ? matchedSkills.slice(0, 4) : ['Core Problem Solving', 'Architecture'];
  const topMissing = missingSkills.length > 0 ? missingSkills.slice(0, 3) : ['Distributed Systems', 'Cloud Deployment', 'Performance Optimization'];

  return {
    warmup: [
      {
        question: `Welcome ${candidateName}. Could you walk us through the most impactful project you worked on recently and the technical decisions you owned?`,
        purpose: 'Establish rapport, evaluate technical articulation, and gauge candidate pride in their past work.',
        expectedAnswer: 'Look for structured storytelling (STAR method), clear ownership, understanding of business impact, and candid reflection on trade-offs.',
      },
      {
        question: `What drew you to this ${jobTitle} opportunity, and how does it align with what you are looking to build next in your career?`,
        purpose: 'Assess intrinsic motivation, company mission alignment, and self-awareness about role expectations.',
        expectedAnswer: 'The candidate should articulate specific interests in the role domain and show intentionality about their growth trajectory.',
      },
    ],
    technical: [
      {
        question: `Given your hands-on background with ${topMatched[0] || 'software architecture'}, how would you architect a fault-tolerant pipeline that processes high-concurrency requests under tight latency bounds?`,
        difficulty: 'Medium',
        targetSkill: topMatched[0] || 'System Design',
        purpose: 'Assess system design foundations, handling of race conditions, backpressure, and decoupling.',
        expectedAnswer: 'Should mention asynchronous processing, message queues or event streams, caching strategies, and idempotent endpoints.',
      },
      {
        question: `When implementing state management or data consistency with ${topMatched[1] || 'modern frameworks'}, how do you safeguard against stale data and memory leaks in production?`,
        difficulty: 'Easy',
        targetSkill: topMatched[1] || 'State Management',
        purpose: 'Evaluate practical day-to-day code hygiene and understanding of framework runtime internals.',
        expectedAnswer: 'Clean subscription cleanup, proper immutability patterns, hydration strategies, and cache invalidation policies.',
      },
      {
        question: `Suppose our production logs show sporadic 504 gateway timeouts coinciding with peak load spikes. How do you systematically isolate whether the root cause is thread starvation, database connection pooling, or upstream network latency?`,
        difficulty: 'Hard',
        targetSkill: 'Debugging & Observability',
        purpose: 'Test deep troubleshooting capabilities, APM familiarity, and composure during critical incidents.',
        expectedAnswer: 'Hypothesis-driven methodology: inspect metrics/dashboards, trace request IDs across services, verify connection pool saturation, and analyze query slow logs before changing code.',
      },
      {
        question: `In modern scalable services, how do you balance strong consistency versus eventual consistency when designing cross-service transactions?`,
        difficulty: 'Medium',
        targetSkill: topMatched[2] || 'Data Architecture',
        purpose: 'Determine candidate grasp of distributed consensus, CAP theorem trade-offs, and outbox patterns.',
        expectedAnswer: 'Articulates when eventual consistency is acceptable vs financial/inventory ACID needs, referencing Saga patterns, 2-phase commits, or CDC (Change Data Capture).',
      },
    ],
    gapProbe: [
      {
        question: `The requirements highlight proficiency in ${topMissing[0] || 'advanced tooling'}. While this was not prominent on your resume, could you describe your exposure to it or how you would ramp up quickly?`,
        targetGap: topMissing[0] || 'Technical Tooling',
        purpose: 'Probe actual hands-on comfort with the identified skill gap without being adversarial.',
        tip: 'Listen for mental models and foundational knowledge. A strong candidate relates adjacent technologies they already master to bridge this gap quickly.',
      },
      {
        question: `If tasked with deploying or maintaining components built with ${topMissing[1] || 'infrastructure tools'} in week 3, what is your playbook for troubleshooting unfamiliar errors safely in a staging environment?`,
        targetGap: topMissing[1] || 'Ecosystem Knowledge',
        purpose: 'Gauge autonomous problem solving, documentation reading habits, and risk-management mindset.',
        tip: 'Verify whether they ask for pairing/mentorship appropriately while taking ownership of self-directed learning.',
      },
      {
        question: `Have you ever had to substitute ${topMissing[2] || 'specialized services'} with an alternative technology? What trade-offs did you make, and how did you measure success?`,
        targetGap: topMissing[2] || 'Domain Breadth',
        purpose: 'Uncover adaptability and whether missing keyword skills are compensated by conceptual mastery.',
        tip: 'Focus on whether they understand why this technology is used rather than just syntax.',
      },
    ],
    behavioral: [
      {
        question: `Tell me about a time when a product deadline was approaching, but you discovered a non-trivial architectural flaw or security concern in code about to ship. How did you navigate that conversation with leadership?`,
        purpose: 'Evaluate integrity, cross-functional communication, risk prioritization, and negotiation under pressure.',
      },
      {
        question: `Describe a situation where you had a strong technical disagreement with a teammate or team lead regarding an implementation approach. How did you resolve it constructively?`,
        purpose: 'Test empathy, receptiveness to differing viewpoints, and ability to disagree and commit to project goals.',
      },
    ],
    closing: [
      {
        question: `If you were to join our team tomorrow, what is the first area or system in our stack where you believe you could make an immediate measurable contribution?`,
        purpose: 'Leave candidate inspired, verify eagerness to create tangible value, and gauge day-one readiness.',
      },
    ],
  };
};

/**
 * Generates an interview question kit using Gemini 2.5 Flash, with deterministic fallback resilience.
 */
const generateInterviewQuestions = async ({
  candidateName = 'Candidate',
  jobTitle = 'Engineering Role',
  matchScore = 0,
  matchedSkills = [],
  missingSkills = [],
  jobRequirements = '',
}) => {
  const candidateContext = {
    name: candidateName,
    matchScore: Number(matchScore) || 0,
    matchedSkills: Array.isArray(matchedSkills) ? matchedSkills : [],
    missingSkills: Array.isArray(missingSkills) ? missingSkills : [],
  };

  const jobContext = {
    title: jobTitle,
    requirements: jobRequirements || 'Engineering technical competencies and team collaboration.',
  };

  if (!isGeminiConfigured()) {
    console.log('[InterviewKit] Gemini API not configured, using heuristic fallback generator');
    return generateFallbackInterviewQuestions({
      candidateName,
      jobTitle,
      matchScore,
      matchedSkills: candidateContext.matchedSkills,
      missingSkills: candidateContext.missingSkills,
      jobRequirements,
    });
  }

  const aiClient = getGeminiClient();
  if (!aiClient) {
    console.warn('[InterviewKit] Gemini client could not be initialized, using fallback');
    return generateFallbackInterviewQuestions({
      candidateName,
      jobTitle,
      matchScore,
      matchedSkills: candidateContext.matchedSkills,
      missingSkills: candidateContext.missingSkills,
      jobRequirements,
    });
  }

  const prompt = `You are a senior technical interviewer and hiring architect.
Generate a structured, personalized interview question set tailored specifically for this candidate based on their verified skills, identified skill gaps, and the job requirements.

Return ONLY valid JSON, no markdown code fences, no extra text:
{
  "warmup": [
    { "question": "string", "purpose": "string", "expectedAnswer": "string" }
  ],
  "technical": [
    { "question": "string", "difficulty": "Easy|Medium|Hard", "targetSkill": "string", "purpose": "string", "expectedAnswer": "string" }
  ],
  "gapProbe": [
    { "question": "string", "targetGap": "string", "purpose": "string", "tip": "string" }
  ],
  "behavioral": [
    { "question": "string", "purpose": "string" }
  ],
  "closing": [
    { "question": "string", "purpose": "string" }
  ]
}

Generate EXACTLY:
- 2 warmup questions (professional, conversational, role alignment)
- 4 technical questions (deep dive into verified skills with varying difficulties: 1 Easy, 2 Medium, 1 Hard)
- 3 gap probe questions (specifically targeted at the missing skills or potential risks identified)
- 2 behavioral questions (collaboration, engineering culture, handling complexity/deadlines)
- 1 closing question (forward-looking, candidate impact)

Candidate Data:
${JSON.stringify(candidateContext, null, 2)}

Job Data:
${JSON.stringify(jobContext, null, 2)}`;

  try {
    const apiCall = aiClient.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        temperature: 0.3,
        responseMimeType: 'application/json',
      },
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API call timed out after 18 seconds')), 18000)
    );

    const response = await Promise.race([apiCall, timeoutPromise]);
    let rawText = response.text || '';
    rawText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    const parsed = JSON.parse(rawText);

    // Validate structure exists
    if (
      Array.isArray(parsed.warmup) &&
      Array.isArray(parsed.technical) &&
      Array.isArray(parsed.gapProbe) &&
      Array.isArray(parsed.behavioral) &&
      Array.isArray(parsed.closing)
    ) {
      return parsed;
    }

    console.warn('[InterviewKit] Parsed JSON missing required arrays, falling back');
    return generateFallbackInterviewQuestions({
      candidateName,
      jobTitle,
      matchScore,
      matchedSkills: candidateContext.matchedSkills,
      missingSkills: candidateContext.missingSkills,
      jobRequirements,
    });
  } catch (error) {
    console.warn('[InterviewKit] Gemini question generation failed, using fallback:', error.message);
    return generateFallbackInterviewQuestions({
      candidateName,
      jobTitle,
      matchScore,
      matchedSkills: candidateContext.matchedSkills,
      missingSkills: candidateContext.missingSkills,
      jobRequirements,
    });
  }
};

module.exports = {
  generateInterviewQuestions,
  generateFallbackInterviewQuestions,
};
