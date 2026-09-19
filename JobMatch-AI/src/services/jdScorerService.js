const { getGeminiClient, isGeminiConfigured, DEFAULT_MODEL } = require('../config/aiConfig');

/**
 * Known exclusionary or biased terms dictionary with rationale and inclusive replacements
 */
const BIASED_TERMS_DICTIONARY = [
  {
    regex: /\b(ninja|rockstar|guru|wizard|superhero|unicorn)\b/gi,
    reason: 'Informal hype words and hyper-masculine tech jargon alienate qualified mid/senior candidates and underrepresented groups.',
    suggestion: 'skilled engineer, proficient developer, or technical specialist',
  },
  {
    regex: /\b(young|youthful|digital native|recent graduate)\b/gi,
    reason: 'Exclusionary language referencing candidate age or generational markers creates ageist bias.',
    suggestion: 'early-career professional or candidates with foundational knowledge',
  },
  {
    regex: /\b(energetic|high energy)\b/gi,
    reason: 'Subjective personality trait often interpreted as an ageist or ableist proxy.',
    suggestion: 'collaborative, proactive, or results-oriented',
  },
  {
    regex: /\b(work hard play hard|hustle culture|grind)\b/gi,
    reason: 'Signals poor work-life balance and burnout culture, discouraging caregivers and seasoned professionals.',
    suggestion: 'sustainable engineering velocity and healthy work-life balance',
  },
  {
    regex: /\b(aggressive|dominate|killer instinct|ruthless)\b/gi,
    reason: 'Hyper-aggressive language discourages collaborative engineers and fosters toxic team dynamics.',
    suggestion: 'driven, ambitious, or strategic execution',
  },
  {
    regex: /\b(native english speaker)\b/gi,
    reason: 'Potentially discriminatory against fluent non-native English speakers.',
    suggestion: 'proficient verbal and written communication in English',
  },
];

/**
 * Deterministic heuristic fallback analyzer
 * Provides instant real-time quality evaluation when Gemini API is unconfigured or unavailable.
 */
const generateFallbackJdScore = ({
  jobTitle = '',
  description = '',
  requirements = '',
  location = '',
  experienceLevel = '',
}) => {
  const combinedText = `${jobTitle} ${description} ${requirements} ${location} ${experienceLevel}`.trim();
  const lowerText = combinedText.toLowerCase();

  // 1. Detect Biased Language
  const biasFlags = [];
  BIASED_TERMS_DICTIONARY.forEach((item) => {
    const matches = combinedText.match(item.regex);
    if (matches && matches.length > 0) {
      const uniqueMatches = [...new Set(matches.map((m) => m.toLowerCase()))];
      uniqueMatches.forEach((term) => {
        if (!biasFlags.some((f) => f.term.toLowerCase() === term)) {
          biasFlags.push({
            term,
            reason: item.reason,
            suggestion: item.suggestion,
          });
        }
      });
    }
  });

  // 2. Clarity Assessment
  const wordCount = combinedText.split(/\s+/).filter(Boolean).length;
  let clarityScore = 50;
  let clarityFeedback = '';

  if (wordCount < 60) {
    clarityScore = 40;
    clarityFeedback = 'Description is too brief. Expand on day-to-day responsibilities and mission.';
  } else if (wordCount < 120) {
    clarityScore = 65;
    clarityFeedback = 'Fairly clear but lacks deeper operational and team context.';
  } else if (wordCount < 400) {
    clarityScore = 88;
    clarityFeedback = 'Well-articulated scope with balanced overview and expectations.';
  } else {
    clarityScore = 78;
    clarityFeedback = 'Very comprehensive, though slightly verbose. Ensure key duties remain easy to scan.';
  }

  // 3. Specificity Assessment
  const hasBullets = /(?:•|-|\*|\d+\.)\s+/i.test(description) || /(?:•|-|\*|\d+\.)\s+/i.test(requirements);
  const mentionsTech = /(react|node|javascript|typescript|python|docker|aws|sql|mongodb|api|cloud|graphql|ci\/cd)/i.test(combinedText);
  const mentionsYears = /\b\d+\+?\s*(?:years?|yrs?)\b/i.test(combinedText);

  let specificityScore = 50;
  let specificityFeedback = '';

  if (hasBullets && mentionsTech && mentionsYears) {
    specificityScore = 90;
    specificityFeedback = 'Concrete qualifications with clear experience milestones and tech stack details.';
  } else if (hasBullets && mentionsTech) {
    specificityScore = 80;
    specificityFeedback = 'Good technical specificity; consider specifying preferred seniority or years of experience.';
  } else if (mentionsTech) {
    specificityScore = 65;
    specificityFeedback = 'Lists technical tools, but needs structured bullet points for qualifications.';
  } else {
    specificityScore = 45;
    specificityFeedback = 'Vague requirements. Add specific languages, frameworks, and tools used by the team.';
  }

  // 4. Inclusivity Assessment
  let inclusivityScore = 85;
  let inclusivityFeedback = '';

  if (biasFlags.length > 0) {
    inclusivityScore = Math.max(30, 85 - biasFlags.length * 18);
    inclusivityFeedback = `Contains ${biasFlags.length} exclusionary phrase(s) that may discourage qualified candidates.`;
  } else {
    const hasEqualOpp = /(equal opportunity|diversity|inclusive|belonging|accommodations?)/i.test(combinedText);
    if (hasEqualOpp) {
      inclusivityScore = 95;
      inclusivityFeedback = 'Exemplary inclusive tone with zero detected bias and an equal-opportunity stance.';
    } else {
      inclusivityScore = 85;
      inclusivityFeedback = 'Neutral tone free of obvious biased buzzwords. Consider adding an EOE statement.';
    }
  }

  // 5. Competitiveness Assessment
  const mentionsComp = /(salary|\$|compensation|equity|benefits|health|401k|pto|vacation|bonus|stipend)/i.test(combinedText);
  const mentionsFlex = /(remote|flexible|hybrid|work from anywhere)/i.test(combinedText);

  let competitivenessScore = 50;
  let competitivenessFeedback = '';

  if (mentionsComp && mentionsFlex) {
    competitivenessScore = 92;
    competitivenessFeedback = 'High applicant appeal with transparent benefits, compensation context, and location flexibility.';
  } else if (mentionsComp || mentionsFlex) {
    competitivenessScore = 75;
    competitivenessFeedback = mentionsFlex
      ? 'Strong location flexibility; adding salary bands or key benefits will boost application volume.'
      : 'Solid benefits mention; clarify remote/hybrid policy for maximum reach.';
  } else {
    competitivenessScore = 52;
    competitivenessFeedback = 'Missing compensation range or perks. Top candidates prioritize transparent job postings.';
  }

  // 6. Structure Assessment
  const hasParagraphs = (description.match(/\n\s*\n/) || []).length > 0;
  let structureScore = 55;
  let structureFeedback = '';

  if (hasParagraphs && hasBullets) {
    structureScore = 92;
    structureFeedback = 'Excellent readability with distinct sections and skimmable bullet points.';
  } else if (hasBullets || hasParagraphs) {
    structureScore = 74;
    structureFeedback = 'Decent readability. Use clear section headers like "Responsibilities" and "Requirements".';
  } else {
    structureScore = 48;
    structureFeedback = 'Dense wall of text. Break into short paragraphs and bullet points for mobile readability.';
  }

  // Calculate Weighted Overall Score
  const rawOverall = Math.round(
    clarityScore * 0.25 +
    specificityScore * 0.25 +
    inclusivityScore * 0.2 +
    competitivenessScore * 0.15 +
    structureScore * 0.15
  );
  const overallScore = Math.min(100, Math.max(10, rawOverall));

  // Determine Grade
  let grade = 'C';
  if (overallScore >= 85) grade = 'A';
  else if (overallScore >= 75) grade = 'B';
  else if (overallScore >= 65) grade = 'C';
  else if (overallScore >= 50) grade = 'D';
  else grade = 'F';

  // Determine Predicted Candidate Pool
  let predictedCandidatePool = 'Medium';
  if (overallScore >= 82) predictedCandidatePool = 'Very Large';
  else if (overallScore >= 72) predictedCandidatePool = 'Large';
  else if (overallScore >= 60) predictedCandidatePool = 'Medium';
  else if (overallScore >= 45) predictedCandidatePool = 'Small';
  else predictedCandidatePool = 'Very Small';

  // Generate Issues
  const issues = [];
  if (biasFlags.length > 0) {
    issues.push({
      severity: 'critical',
      text: `Biased language detected: Replace "${biasFlags.map((b) => b.term).join(', ')}" with inclusive professional terms.`,
    });
  }
  if (!mentionsComp) {
    issues.push({
      severity: 'warning',
      text: 'No compensation or benefits listed. Adding salary transparency increases qualified applicant response by up to 40%.',
    });
  }
  if (!hasBullets) {
    issues.push({
      severity: 'warning',
      text: 'Format qualifications into distinct bullet points so candidates can quickly gauge their fit.',
    });
  }
  if (wordCount < 80) {
    issues.push({
      severity: 'critical',
      text: 'Job description is too brief. Candidates need to know about engineering team culture and key initiatives.',
    });
  } else if (!/(growth|mentorship|career|opportunity)/i.test(combinedText)) {
    issues.push({
      severity: 'suggestion',
      text: 'Highlight career development and mentorship opportunities to attract ambitious candidates.',
    });
  }

  // Generate Improvements with Code-Style Examples
  const improvements = [];
  if (biasFlags.length > 0) {
    const firstFlag = biasFlags[0];
    improvements.push({
      priority: 'high',
      action: `Eliminate informal buzzword "${firstFlag.term}"`,
      example: `Instead of: "We need a ${firstFlag.term} to build..."\nUse: "We are seeking a ${firstFlag.suggestion} to lead..."`,
    });
  }
  if (!mentionsComp) {
    improvements.push({
      priority: 'medium',
      action: 'Include salary band and core benefits package',
      example: 'Compensation: $140,000 - $175,000 base + equity, 401(k) matching, and comprehensive healthcare.',
    });
  }
  if (!hasBullets) {
    improvements.push({
      priority: 'high',
      action: 'Structure role responsibilities with action verbs',
      example: 'Key Responsibilities:\n• Architect scalable REST APIs and microservices\n• Optimize MongoDB database query performance\n• Partner with product teams to ship weekly releases',
    });
  } else {
    improvements.push({
      priority: 'low',
      action: 'Distinguish essential requirements from "nice-to-have" skills',
      example: 'Required:\n• 3+ years Node.js\nNice to Have:\n• Experience with Gemini AI or LangChain',
    });
  }

  // Generate Strengths
  const strengths = [];
  if (mentionsTech) strengths.push('Clear mention of core modern technology stack.');
  if (mentionsFlex) strengths.push('Highlights workplace flexibility (Remote/Hybrid options).');
  if (hasBullets) strengths.push('Well-organized bulleted list for qualifications.');
  if (biasFlags.length === 0) strengths.push('Free of gendered and exclusionary tech jargon.');
  if (wordCount >= 120) strengths.push('Sufficient detail for candidates to evaluate mutual fit.');

  return {
    overallScore,
    grade,
    predictedCandidatePool,
    categories: {
      clarity: { score: clarityScore, feedback: clarityFeedback },
      specificity: { score: specificityScore, feedback: specificityFeedback },
      inclusivity: { score: inclusivityScore, feedback: inclusivityFeedback },
      competitiveness: { score: competitivenessScore, feedback: competitivenessFeedback },
      structure: { score: structureScore, feedback: structureFeedback },
    },
    issues,
    improvements,
    biasFlags,
    strengths,
  };
};

/**
 * Analyzes a job description using Gemini 2.5 Flash, with deterministic fallback resilience
 */
const analyzeJobDescription = async ({
  jobTitle = '',
  description = '',
  requirements = '',
  location = '',
  experienceLevel = '',
}) => {
  const combinedLength = (description || '').trim().length + (requirements || '').trim().length;
  if (combinedLength < 15) {
    return {
      overallScore: 0,
      grade: 'F',
      predictedCandidatePool: 'Very Small',
      categories: {
        clarity: { score: 0, feedback: 'Description is too short to evaluate.' },
        specificity: { score: 0, feedback: 'Provide key qualifications and tech stack.' },
        inclusivity: { score: 0, feedback: 'Awaiting content.' },
        competitiveness: { score: 0, feedback: 'Awaiting content.' },
        structure: { score: 0, feedback: 'Awaiting content.' },
      },
      issues: [{ severity: 'critical', text: 'Please write a job overview to begin quality analysis.' }],
      improvements: [],
      biasFlags: [],
      strengths: [],
    };
  }

  if (!isGeminiConfigured()) {
    console.log('[JDScorer] Gemini API not configured, using heuristic fallback scorer');
    return generateFallbackJdScore({
      jobTitle,
      description,
      requirements,
      location,
      experienceLevel,
    });
  }

  const aiClient = getGeminiClient();
  if (!aiClient) {
    console.warn('[JDScorer] Gemini client unavailable, using fallback scorer');
    return generateFallbackJdScore({
      jobTitle,
      description,
      requirements,
      location,
      experienceLevel,
    });
  }

  const prompt = `You are an expert HR consultant, hiring architect, and job description analyst.
Analyze this job description and return ONLY valid JSON, no markdown code fences:
{
  "overallScore": 0-100,
  "grade": "A|B|C|D|F",
  "predictedCandidatePool": "Very Large|Large|Medium|Small|Very Small",
  "categories": {
    "clarity": { "score": 0-100, "feedback": "string" },
    "specificity": { "score": 0-100, "feedback": "string" },
    "inclusivity": { "score": 0-100, "feedback": "string" },
    "competitiveness": { "score": 0-100, "feedback": "string" },
    "structure": { "score": 0-100, "feedback": "string" }
  },
  "issues": [
    { "severity": "critical|warning|suggestion", "text": "string" }
  ],
  "improvements": [
    { "priority": "high|medium|low", "action": "string", "example": "string" }
  ],
  "biasFlags": [
    { "term": "string", "reason": "string", "suggestion": "string" }
  ],
  "strengths": ["string"]
}

Analyze for:
- Clarity of role and day-to-day duties
- Specific vs vague requirements
- Gendered, informal, or exclusionary language (e.g. ninja, rockstar, guru, young, energetic, work hard play hard)
- Predicted applicant pool size (Very Large, Large, Medium, Small, Very Small)
- Missing salary, compensation bands, or benefits information
- Structure, readability, and scannability

Job Title: ${jobTitle || 'Engineering Role'}
Location: ${location || 'Not specified'}
Experience Level: ${experienceLevel || 'Not specified'}
Description:
${description || ''}

Requirements:
${requirements || ''}`;

  try {
    const apiCall = aiClient.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        temperature: 0.2,
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

    // Validate essential keys
    if (
      typeof parsed.overallScore === 'number' &&
      parsed.categories &&
      Array.isArray(parsed.issues) &&
      Array.isArray(parsed.improvements)
    ) {
      // Normalize boundaries
      parsed.overallScore = Math.max(0, Math.min(100, Math.round(parsed.overallScore)));
      if (!Array.isArray(parsed.biasFlags)) parsed.biasFlags = [];
      if (!Array.isArray(parsed.strengths)) parsed.strengths = [];
      return parsed;
    }

    console.warn('[JDScorer] Incomplete response structure, using fallback scorer');
    return generateFallbackJdScore({
      jobTitle,
      description,
      requirements,
      location,
      experienceLevel,
    });
  } catch (error) {
    console.warn('[JDScorer] Gemini analysis failed, using fallback:', error.message);
    return generateFallbackJdScore({
      jobTitle,
      description,
      requirements,
      location,
      experienceLevel,
    });
  }
};

module.exports = {
  analyzeJobDescription,
  generateFallbackJdScore,
};
