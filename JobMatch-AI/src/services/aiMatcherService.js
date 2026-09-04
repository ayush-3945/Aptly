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
  } else if (matchScore < 45) {
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
  // If no resume text provided at all
  if (!resumeText || resumeText.trim().length === 0) {
    return {
      matchScore: 0,
      matchedSkills: [],
      missingSkills: Array.isArray(job?.requiredSkills) ? job.requiredSkills : [],
      experienceFit: 'No resume content available for evaluation.',
      fitSummary: 'Resume text is empty or could not be parsed.',
      recommendation: 'Low Match',
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
    const response = await aiClient.models.generateContent({
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

    let rawText = response.text || '';
    rawText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    const parsed = JSON.parse(rawText);

    // Enforce and sanitize output boundaries
    const matchScore = Math.max(0, Math.min(100, Number(parsed.matchScore) || 0));
    const validRecommendations = ['Strong Match', 'Moderate Match', 'Low Match'];
    const recommendation = validRecommendations.includes(parsed.recommendation)
      ? parsed.recommendation
      : (matchScore >= 75 ? 'Strong Match' : matchScore >= 45 ? 'Moderate Match' : 'Low Match');

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

module.exports = {
  evaluateMatch,
  generateFallbackEvaluation,
};
