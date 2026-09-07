const { getGeminiClient, isGeminiConfigured, DEFAULT_MODEL } = require('../config/aiConfig');

/**
 * Fallback heuristic matching engine when Gemini AI is not configured or unavailable
 * @param {Object|string} job - Job document or requirements string
 * @param {string} resumeText - Extracted text from candidate's resume
 * @param {string} reason - Cause of fallback invocation
 * @returns {Object} Structured match evaluation
 */
const generateFallbackEvaluation = (job, resumeText, reason = 'Gemini API not configured or unavailable') => {
  const resumeLower = (resumeText || '').toLowerCase();

  let requiredSkills = [];
  if (job && Array.isArray(job.requiredSkills)) {
    requiredSkills = job.requiredSkills;
  } else if (job && typeof job.requiredSkills === 'string') {
    requiredSkills = job.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean);
  } else if (typeof job === 'string') {
    const commonTech = [
      'javascript', 'typescript', 'react', 'node.js', 'nodejs', 'express',
      'mongodb', 'python', 'java', 'sql', 'docker', 'aws', 'git', 'rest api',
    ];
    requiredSkills = commonTech.filter((tech) => job.toLowerCase().includes(tech));
  }

  const matchedSkills = [];
  const missingSkills = [];

  requiredSkills.forEach((skill) => {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?:\\b|\\W)${escaped}(?:\\b|\\W)`, 'i');
    if (regex.test(resumeLower) || resumeLower.includes(skill.toLowerCase())) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  let matchScore = 50;
  if (requiredSkills.length > 0) {
    matchScore = Math.round((matchedSkills.length / requiredSkills.length) * 100);
  } else if (resumeLower.length > 300) {
    matchScore = 65;
  }

  let recommendation = 'Moderate Match';
  if (matchScore >= 75) {
    recommendation = 'Strong Match';
  } else if (matchScore < 40) {
    recommendation = 'Low Match';
  }

  return {
    matchScore,
    matchedSkills,
    missingSkills,
    experienceFit: `Heuristic evaluation: ${matchedSkills.length} of ${requiredSkills.length || 0} core skills matched against candidate resume.`,
    fitSummary: `Candidate matches ${matchedSkills.length}/${requiredSkills.length || 0} specified skills. [Notice: ${reason}]`,
    recommendation,
  };
};

/**
 * Evaluates candidate resume against job requirements using Gemini AI with fallback resilience
 * @param {Object|string} job - Job document or description
 * @param {string} resumeText - Cleaned text from resume
 * @returns {Promise<Object>} Formatted evaluation containing matchScore, skills, fitSummary, etc.
 */
const evaluateMatch = async (job, resumeText) => {
  // If no resume text provided or text is too short to be meaningful (scanned/image PDF)
  if (!resumeText || resumeText.trim().length < 30) {
    return {
      matchScore: null,
      matchedSkills: [],
      missingSkills: Array.isArray(job?.requiredSkills) ? job.requiredSkills : [],
      experienceFit: 'Resume text is empty, scanned, or could not be extracted.',
      fitSummary: 'Text could not be extracted from the resume PDF. Flagged for manual recruiter review.',
      recommendation: 'Pending Evaluation',
    };
  }

  // Format job details for the AI prompt
  const jobDetails = typeof job === 'string'
    ? job
    : `Job Title: ${job.title || 'N/A'}
Company: ${job.company || 'N/A'}
Location: ${job.location || 'N/A'}
Required Skills: ${Array.isArray(job.requiredSkills) ? job.requiredSkills.join(', ') : (job.requiredSkills || 'N/A')}
Job Description:
${job.description || 'N/A'}`;

  // Check if Gemini is configured
  if (!isGeminiConfigured()) {
    return generateFallbackEvaluation(job, resumeText, 'GEMINI_API_KEY environment variable is not configured');
  }

  const aiClient = getGeminiClient();
  if (!aiClient) {
    return generateFallbackEvaluation(job, resumeText, 'Gemini AI client initialization failed');
  }

  const systemInstruction = `You are an expert ATS (Applicant Tracking System) Technical Recruiter and Talent Acquisition Specialist.
Your task is to objectively evaluate a candidate's resume against a target job description.
Evaluate semantic alignment across:
1. Technical and domain skills (exact and adjacent technologies)
2. Years of experience and seniority level
3. Core responsibilities and project impact

Be objective, thorough, and realistic in your scoring.
Return a valid JSON object matching the required schema.`;

  const prompt = `Please evaluate the following Candidate Resume against the Target Job Description:

--- TARGET JOB DESCRIPTION ---
${jobDetails}

--- CANDIDATE RESUME ---
${resumeText.substring(0, 15000)}

Analyze the match and provide the evaluation in the requested JSON structure.`;

  try {
    // Wrap API call with 15-second timeout for resilience
    const apiCall = aiClient.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            matchScore: {
              type: 'integer',
              description: 'Overall match score from 0 to 100',
            },
            matchedSkills: {
              type: 'array',
              items: { type: 'string' },
              description: 'Skills present in both job description and resume',
            },
            missingSkills: {
              type: 'array',
              items: { type: 'string' },
              description: 'Skills required by the job but missing or weak in the resume',
            },
            experienceFit: {
              type: 'string',
              description: 'Concise assessment of seniority, tenure, and domain experience',
            },
            fitSummary: {
              type: 'string',
              description: 'A 2-3 sentence executive recruiter summary of the candidate fit',
            },
            recommendation: {
              type: 'string',
              enum: ['Strong Match', 'Moderate Match', 'Low Match'],
              description: 'Hiring recommendation tier',
            },
          },
          required: [
            'matchScore',
            'matchedSkills',
            'missingSkills',
            'experienceFit',
            'fitSummary',
            'recommendation',
          ],
        },
      },
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API call timed out after 15 seconds')), 15000)
    );

    const response = await Promise.race([apiCall, timeoutPromise]);

    let rawText = response.text || '';
    rawText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    const parsed = JSON.parse(rawText);

    // Enforce and sanitize output boundaries
    const matchScore = Math.max(0, Math.min(100, Number(parsed.matchScore) || 0));
    const validRecommendations = ['Strong Match', 'Moderate Match', 'Low Match'];
    const recommendation = validRecommendations.includes(parsed.recommendation)
      ? parsed.recommendation
      : (matchScore >= 75 ? 'Strong Match' : matchScore >= 40 ? 'Moderate Match' : 'Low Match');

    return {
      matchScore,
      matchedSkills: Array.isArray(parsed.matchedSkills) ? parsed.matchedSkills : [],
      missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
      experienceFit: parsed.experienceFit || 'Experience profile assessed.',
      fitSummary: parsed.fitSummary || 'Fit assessment completed.',
      recommendation,
    };
  } catch (error) {
    console.warn('Gemini AI generation failed, falling back to heuristic matcher:', error.message);
    return generateFallbackEvaluation(job, resumeText, `AI service error: ${error.message}`);
  }
};

/**
 * Fallback generator for previewing candidate match against job requirements
 * @param {Object} job - Job document
 * @param {Object} candidateProfile - Candidate skills, experience, education
 * @returns {Object} Structured match preview
 */
const generateFallbackPreview = (job, candidateProfile) => {
  const candidateSkills = Array.isArray(candidateProfile?.skills) ? candidateProfile.skills : [];
  const candidateSkillsLower = candidateSkills.map((s) => String(s).toLowerCase().trim());

  let requiredSkills = [];
  if (job && Array.isArray(job.requiredSkills)) {
    requiredSkills = job.requiredSkills;
  } else if (job && typeof job.requiredSkills === 'string') {
    requiredSkills = job.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean);
  }

  const matchedSkills = [];
  const missingSkills = [];

  requiredSkills.forEach((skill) => {
    const sLower = skill.toLowerCase().trim();
    if (candidateSkillsLower.some((c) => c === sLower || c.includes(sLower) || sLower.includes(c))) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  const matchScore = requiredSkills.length > 0
    ? Math.min(100, Math.max(10, Math.round((matchedSkills.length / requiredSkills.length) * 100)))
    : (candidateSkills.length > 0 ? 70 : 35);

  const matchTier = matchScore >= 75 ? 'Strong Match' : matchScore >= 50 ? 'Moderate Match' : 'Low Match';

  const strengthSummary = matchedSkills.length > 0
    ? `Strong technical alignment demonstrated in key competencies (${matchedSkills.slice(0, 3).join(', ')}).`
    : 'Candidate demonstrates solid foundational capabilities with room to expand in this domain.';

  const gapSummary = missingSkills.length > 0
    ? `Identified technical gaps in ${missingSkills.slice(0, 3).join(', ')} relative to this role.`
    : 'No critical competency gaps identified against the posted job criteria.';

  return {
    matchScore,
    matchTier,
    matchedSkills,
    missingSkills,
    strengthSummary,
    gapSummary,
  };
};

/**
 * Real-time AI preview match comparison using Gemini 2.5 Flash
 * @param {Object} job - Job document
 * @param {Object} candidateProfile - Profile object containing skills, experience, education
 * @returns {Promise<Object>} Match preview scorecard
 */
const previewProfileMatch = async (job, candidateProfile) => {
  if (!job) {
    throw new Error('Target job is required for preview match.');
  }

  const jobDetails = `Job Title: ${job.title || 'N/A'}
Company: ${job.company || 'N/A'}
Location: ${job.location || 'N/A'}
Required Skills: ${Array.isArray(job.requiredSkills) ? job.requiredSkills.join(', ') : (job.requiredSkills || 'N/A')}
Description: ${job.description || 'N/A'}`;

  const candidateDetails = `Current Role: ${candidateProfile?.currentRole || candidateProfile?.targetRole || 'N/A'}
Total Experience: ${candidateProfile?.totalExperience || 'N/A'}
Skills: ${Array.isArray(candidateProfile?.skills) ? candidateProfile.skills.join(', ') : (candidateProfile?.skills || 'N/A')}
Education: ${Array.isArray(candidateProfile?.education) ? candidateProfile.education.map((e) => `${e.degree || ''} at ${e.institution || ''} (${e.year || ''})`).join('; ') : 'N/A'}
Work History: ${Array.isArray(candidateProfile?.workHistory) ? candidateProfile.workHistory.map((w) => `${w.role || ''} at ${w.company || ''} (${w.duration || ''}): ${w.description || ''}`).join('; ') : 'N/A'}`;

  if (!isGeminiConfigured()) {
    return generateFallbackPreview(job, candidateProfile);
  }

  const aiClient = getGeminiClient();
  if (!aiClient) {
    return generateFallbackPreview(job, candidateProfile);
  }

  const prompt = `You are an ATS evaluator. Compare this candidate profile against the job requirements and return ONLY valid JSON:
{
  "matchScore": 0-100,
  "matchTier": "Strong Match | Moderate Match | Low Match",
  "matchedSkills": [],
  "missingSkills": [],
  "strengthSummary": "one sentence",
  "gapSummary": "one sentence"
}
Job Requirements: ${jobDetails}
Candidate Profile: ${candidateDetails}`;

  try {
    const apiCall = aiClient.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API call timed out after 15 seconds')), 15000)
    );

    const response = await Promise.race([apiCall, timeoutPromise]);
    let rawText = response.text || '';
    rawText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    const parsed = JSON.parse(rawText);

    const rawScore = Number(parsed.matchScore);
    const matchScore = Number.isFinite(rawScore) ? Math.max(0, Math.min(100, Math.round(rawScore))) : 70;
    const validTiers = ['Strong Match', 'Moderate Match', 'Low Match'];
    const matchTier = validTiers.includes(parsed.matchTier)
      ? parsed.matchTier
      : (matchScore >= 75 ? 'Strong Match' : matchScore >= 50 ? 'Moderate Match' : 'Low Match');

    return {
      matchScore,
      matchTier,
      matchedSkills: Array.isArray(parsed.matchedSkills) ? parsed.matchedSkills : [],
      missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
      strengthSummary: String(parsed.strengthSummary || 'Candidate demonstrates relevant competencies.').trim(),
      gapSummary: String(parsed.gapSummary || 'No major gaps observed.').trim(),
    };
  } catch (error) {
    console.warn('[PreviewMatch] Gemini generation failed, using heuristic preview:', error.message);
    return generateFallbackPreview(job, candidateProfile);
  }
};

module.exports = {
  evaluateMatch,
  generateFallbackEvaluation,
  previewProfileMatch,
  generateFallbackPreview,
};
