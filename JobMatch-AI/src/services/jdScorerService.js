const { getGeminiClient, isGeminiConfigured, DEFAULT_MODEL } = require('../config/aiConfig');

/**
 * Known exclusionary or biased terms dictionary with rationale and inclusive replacements
 * Explicitly covers: young, energetic, rockstar, ninja, guru, work hard play hard, aggressive
 */
const BIASED_TERMS_DICTIONARY = [
  {
    regex: /\b(rockstar)\b/gi,
    term: 'rockstar',
    reason: 'Informal hype words and hyper-masculine tech jargon alienate qualified mid/senior candidates and underrepresented groups.',
    suggestion: 'skilled engineer, proficient developer, or technical specialist',
  },
  {
    regex: /\b(ninja)\b/gi,
    term: 'ninja',
    reason: 'Informal tech buzzword that can obscure real role expectations.',
    suggestion: 'skilled engineer, proficient developer, or technical specialist',
  },
  {
    regex: /\b(guru)\b/gi,
    term: 'guru',
    reason: 'Vague hype term that discourages collaborative engineers from applying.',
    suggestion: 'subject-matter expert or domain specialist',
  },
  {
    regex: /\b(young|youthful)\b/gi,
    term: 'young',
    reason: 'Exclusionary language referencing candidate age or generational markers creates ageist bias.',
    suggestion: 'early-career professional or candidates with foundational knowledge',
  },
  {
    regex: /\b(energetic|high energy)\b/gi,
    term: 'energetic',
    reason: 'Subjective personality trait often interpreted as an ageist or ableist proxy.',
    suggestion: 'collaborative, proactive, or results-oriented',
  },
  {
    regex: /\b(work hard play hard|hustle culture|grind)\b/gi,
    term: 'work hard play hard',
    reason: 'Signals burnout culture and poor work-life balance, discouraging seasoned professionals and caregivers.',
    suggestion: 'sustainable engineering velocity and healthy work-life balance',
  },
  {
    regex: /\b(aggressive|dominate|killer instinct|ruthless)\b/gi,
    term: 'aggressive',
    reason: 'Hyper-aggressive language discourages collaborative engineers and fosters toxic team dynamics.',
    suggestion: 'driven, ambitious, or strategic execution',
  },
  {
    regex: /\b(native english speaker)\b/gi,
    term: 'native english speaker',
    reason: 'Potentially discriminatory against fluent non-native English speakers.',
    suggestion: 'proficient verbal and written communication in English',
  },
];

/**
 * Deterministic rule-based fallback analyzer (0 AI calls, 0 cost, 100% reliable)
 * Used when Gemini fails or times out (15s).
 * Computes honest checks only:
 * 1. Description length
 * 2. Presence of sections (responsibilities, requirements, benefits)
 * 3. Number of listed skills
 * 4. Salary mentioned or not
 * 5. Biased-term scan with inclusive alternatives
 *
 * Never fabricates category scores; sets source: 'fallback'.
 */
const generateFallbackJdScore = ({
  jobTitle = '',
  skills = [],
  description = '',
  requirements = '',
  location = '',
  experienceLevel = '',
}) => {
  const combinedText = `${jobTitle} ${description} ${requirements} ${location} ${experienceLevel}`.trim();

  // 1. Description Length Check
  const descWords = (description || '').split(/\s+/).filter(Boolean).length;
  const reqWords = (requirements || '').split(/\s+/).filter(Boolean).length;
  const wordCount = descWords + reqWords;
  const lengthPassed = wordCount >= 80;
  let lengthScore = 5;
  if (wordCount >= 100) lengthScore = 20;
  else if (wordCount >= 60) lengthScore = 15;
  else if (wordCount >= 30) lengthScore = 10;

  // 2. Presence of Sections Check (Responsibilities, Requirements, Benefits)
  const hasResponsibilities = /\b(responsibilit(ies|y)|duties|what you('ll| will) do|role overview|day[- ]to[- ]day|key initiatives|mission)\b/i.test(combinedText);
  const hasRequirements = /\b(requirement(s)?|qualification(s)?|what you need|skills required|must have|prerequisite(s)?|what we('re| are) looking for)\b/i.test(combinedText);
  const hasBenefits = /\b(benefit(s)?|perk(s)?|what we offer|why join( us)?|compensation|salary|\$|₹|equity|401\(?k\)?|vacation|pto|insurance)\b/i.test(combinedText);
  const sectionsPassed = hasResponsibilities && hasRequirements && hasBenefits;
  let sectionsScore = 0;
  const sectionHits = (hasResponsibilities ? 1 : 0) + (hasRequirements ? 1 : 0) + (hasBenefits ? 1 : 0);
  if (sectionHits === 3) sectionsScore = 20;
  else if (sectionHits === 2) sectionsScore = 14;
  else if (sectionHits === 1) sectionsScore = 8;

  // 3. Number of Listed Skills Check
  let skillsCount = 0;
  if (Array.isArray(skills)) {
    skillsCount = skills.filter((s) => typeof s === 'string' && s.trim().length > 0).length;
  }
  if (skillsCount === 0) {
    const techMatches = combinedText.match(/\b(react|node|javascript|typescript|python|docker|aws|sql|mongodb|api|cloud|graphql|ci\/cd|express|vue|angular|java|c\+\+|golang|kubernetes|html|css|tailwind)\b/gi) || [];
    skillsCount = new Set(techMatches.map((m) => m.toLowerCase())).size;
  }
  const skillsPassed = skillsCount >= 3 && skillsCount <= 12;
  let skillsScore = 0;
  if (skillsCount >= 3 && skillsCount <= 12) skillsScore = 20;
  else if (skillsCount >= 1) skillsScore = 12;

  // 4. Salary Mentioned Check
  const salaryMentioned = /\b(salary|compensation|\$|₹|eur|usd|per (year|month|annum|hr|hour)|base pay|stipend|equity package|hourly rate)\b/i.test(combinedText);
  const salaryScore = salaryMentioned ? 20 : 0;

  // 5. Biased-term scan with inclusive alternatives
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
  const biasPassed = biasFlags.length === 0;
  let inclusivityScore = 20;
  if (biasFlags.length === 1) inclusivityScore = 10;
  else if (biasFlags.length === 2) inclusivityScore = 5;
  else if (biasFlags.length >= 3) inclusivityScore = 0;

  // Calculate Honest Overall Score (0 - 100)
  const overallScore = Math.min(100, Math.max(10, lengthScore + sectionsScore + skillsScore + salaryScore + inclusivityScore));

  // Determine Grade
  let grade = 'C';
  if (overallScore >= 85) grade = 'A';
  else if (overallScore >= 75) grade = 'B';
  else if (overallScore >= 60) grade = 'C';
  else if (overallScore >= 45) grade = 'D';
  else grade = 'F';

  // Determine Predicted Candidate Pool
  let predictedCandidatePool = 'Medium';
  if (overallScore >= 80) predictedCandidatePool = 'Large';
  else if (overallScore >= 60) predictedCandidatePool = 'Medium';
  else predictedCandidatePool = 'Small';

  // Construct Concrete Issues
  const issues = [];
  if (biasFlags.length > 0) {
    issues.push({
      severity: 'critical',
      text: `Biased language detected: Replace "${biasFlags.map((b) => b.term).join(', ')}" with inclusive professional terms.`,
    });
  }
  if (!salaryMentioned) {
    issues.push({
      severity: 'warning',
      text: 'No compensation or benefits listed. Adding salary transparency increases qualified applicant response by up to 40%.',
    });
  }
  if (!hasResponsibilities) {
    issues.push({
      severity: 'warning',
      text: 'Missing clear "Key Responsibilities" or daily duties section.',
    });
  }
  if (!hasRequirements) {
    issues.push({
      severity: 'warning',
      text: 'Missing clear "Requirements" or qualification milestones section.',
    });
  }
  if (skillsCount < 3) {
    issues.push({
      severity: 'suggestion',
      text: 'Add at least 3-5 specific technical skills or frameworks required for this role.',
    });
  }
  if (wordCount < 80) {
    issues.push({
      severity: 'critical',
      text: 'Job description is too brief. Candidates need to know about engineering team culture and key initiatives.',
    });
  }

  // Construct Actionable Improvements
  const improvements = [];
  if (biasFlags.length > 0) {
    const firstFlag = biasFlags[0];
    improvements.push({
      priority: 'high',
      action: `Eliminate informal buzzword "${firstFlag.term}"`,
      example: `Instead of: "We need a ${firstFlag.term} to build..."\nUse: "We are seeking a ${firstFlag.suggestion} to lead..."`,
    });
  }
  if (!salaryMentioned) {
    improvements.push({
      priority: 'medium',
      action: 'Include salary band and core benefits package',
      example: 'Compensation: $140,000 - $175,000 base + equity, 401(k) matching, and comprehensive healthcare.',
    });
  }
  if (!hasResponsibilities || !hasRequirements) {
    improvements.push({
      priority: 'high',
      action: 'Structure role responsibilities and requirements clearly',
      example: 'Key Responsibilities:\n• Architect scalable REST APIs and microservices\n• Partner with product teams to ship weekly releases',
    });
  }

  // Construct Strengths
  const strengths = [];
  if (skillsCount >= 3) strengths.push(`${skillsCount} technical skills and competencies clearly listed.`);
  if (salaryMentioned) strengths.push('Clear compensation or benefits transparency.');
  if (hasResponsibilities && hasRequirements) strengths.push('Well-structured responsibilities and qualification sections.');
  if (biasFlags.length === 0) strengths.push('Free of gendered and exclusionary buzzwords.');
  if (wordCount >= 80) strengths.push('Sufficient detail for candidates to evaluate mutual fit.');

  return {
    source: 'fallback',
    overallScore,
    grade,
    predictedCandidatePool,
    checks: {
      descriptionLength: {
        passed: lengthPassed,
        wordCount,
        label: 'Description Length',
        detail: `${wordCount} words (${lengthPassed ? 'optimal length' : 'recommend 80+ words'})`,
      },
      sections: {
        passed: sectionsPassed,
        hasResponsibilities,
        hasRequirements,
        hasBenefits,
        label: 'Standard Sections',
        detail: `${[
          hasResponsibilities ? 'Responsibilities ✓' : 'Responsibilities ✗',
          hasRequirements ? 'Requirements ✓' : 'Requirements ✗',
          hasBenefits ? 'Benefits ✓' : 'Benefits ✗',
        ].join(' | ')}`,
      },
      skillsCount: {
        passed: skillsPassed,
        count: skillsCount,
        label: 'Listed Skills',
        detail: `${skillsCount} skill(s) listed (${skillsPassed ? 'optimal range' : 'recommend 3-8 skills'})`,
      },
      salaryMentioned: {
        passed: salaryMentioned,
        mentioned: salaryMentioned,
        label: 'Salary / Compensation',
        detail: salaryMentioned ? 'Compensation / perks mentioned ✓' : 'No compensation mentioned ✗',
      },
      biasScan: {
        passed: biasPassed,
        flagsCount: biasFlags.length,
        label: 'Inclusive Language Scan',
        detail: biasFlags.length === 0 ? 'Zero biased buzzwords detected ✓' : `${biasFlags.length} exclusionary phrase(s) flagged ✗`,
      },
    },
    biasFlags,
    issues,
    improvements,
    strengths,
  };
};

/**
 * Analyzes a job description using Gemini with deterministic fallback resilience
 */
const analyzeJobDescription = async ({
  jobTitle = '',
  skills = [],
  description = '',
  requirements = '',
  location = '',
  experienceLevel = '',
}) => {
  const combinedLength = (description || '').trim().length + (requirements || '').trim().length;
  if (combinedLength < 15) {
    return {
      source: 'fallback',
      overallScore: 0,
      grade: 'F',
      predictedCandidatePool: 'Very Small',
      checks: {
        descriptionLength: {
          passed: false,
          wordCount: 0,
          label: 'Description Length',
          detail: '0 words (minimum 15 characters required)',
        },
        sections: {
          passed: false,
          hasResponsibilities: false,
          hasRequirements: false,
          hasBenefits: false,
          label: 'Standard Sections',
          detail: 'Awaiting content',
        },
        skillsCount: {
          passed: false,
          count: Array.isArray(skills) ? skills.length : 0,
          label: 'Listed Skills',
          detail: `${Array.isArray(skills) ? skills.length : 0} skills listed`,
        },
        salaryMentioned: {
          passed: false,
          mentioned: false,
          label: 'Salary / Compensation',
          detail: 'Awaiting content',
        },
        biasScan: {
          passed: true,
          flagsCount: 0,
          label: 'Inclusive Language Scan',
          detail: 'Awaiting content',
        },
      },
      issues: [{ severity: 'critical', text: 'Please write a job overview to begin quality analysis.' }],
      improvements: [],
      biasFlags: [],
      strengths: [],
    };
  }

  if (!isGeminiConfigured()) {
    console.log('[JDScorer] Gemini API not configured, using rule-based fallback scorer');
    return generateFallbackJdScore({
      jobTitle,
      skills,
      description,
      requirements,
      location,
      experienceLevel,
    });
  }

  const aiClient = getGeminiClient();
  if (!aiClient) {
    console.warn('[JDScorer] Gemini client unavailable, using rule-based fallback scorer');
    return generateFallbackJdScore({
      jobTitle,
      skills,
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
- Gendered, informal, or exclusionary language (e.g. ninja, rockstar, guru, young, energetic, work hard play hard, aggressive)
- Predicted applicant pool size (Very Large, Large, Medium, Small, Very Small)
- Missing salary, compensation bands, or benefits information
- Structure, readability, and scannability

Job Title: ${jobTitle || 'Engineering Role'}
Skills: ${Array.isArray(skills) ? skills.join(', ') : 'Not specified'}
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

    // 15-second timeout for Gemini API call
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('Gemini API call timed out after 15 seconds')), 15000);
      if (timeoutId && timeoutId.unref) timeoutId.unref();
    });

    let response;
    try {
      response = await Promise.race([apiCall, timeoutPromise]);
    } finally {
      clearTimeout(timeoutId);
    }
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
      // Normalize boundaries and tag source as AI
      parsed.overallScore = Math.max(0, Math.min(100, Math.round(parsed.overallScore)));
      parsed.source = 'ai';
      if (!Array.isArray(parsed.biasFlags)) parsed.biasFlags = [];
      if (!Array.isArray(parsed.strengths)) parsed.strengths = [];
      return parsed;
    }

    console.warn('[JDScorer] Incomplete response structure, using rule-based fallback scorer');
    return generateFallbackJdScore({
      jobTitle,
      skills,
      description,
      requirements,
      location,
      experienceLevel,
    });
  } catch (error) {
    console.warn('[JDScorer] Gemini analysis failed or timed out, using rule-based fallback:', error.message);
    return generateFallbackJdScore({
      jobTitle,
      skills,
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
  BIASED_TERMS_DICTIONARY,
};
