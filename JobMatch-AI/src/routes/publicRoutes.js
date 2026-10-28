const express = require('express');
const router = express.Router();

const COMMON_SKILLS = [
  'React', 'Node.js', 'Express', 'MongoDB', 'TypeScript', 'JavaScript',
  'Python', 'Java', 'SQL', 'PostgreSQL', 'MySQL', 'Docker', 'Kubernetes',
  'AWS', 'Git', 'REST API', 'GraphQL', 'Next.js', 'Vue', 'Angular',
  'HTML', 'CSS', 'Tailwind', 'Redis', 'CI/CD', 'Linux', 'Microservices',
  'System Design', 'C++', 'Golang',
];

/**
 * Public Free Playground Endpoint: Rule-based Instant Match
 * POST /api/public/quick-match
 * - Zero external API costs (pure heuristic matcher)
 * - Zero database writes
 * - Strict 3000 character validation per field
 * - Formula-grounded 40/30/20/10 sub-score computation
 */
router.post('/quick-match', (req, res) => {
  try {
    const { jobDescription, resumeText } = req.body || {};

    if (!jobDescription || !jobDescription.trim()) {
      return res.status(400).json({ error: 'Job description text is required.' });
    }
    if (!resumeText || !resumeText.trim()) {
      return res.status(400).json({ error: 'Resume text is required.' });
    }

    if (jobDescription.length > 3000) {
      return res.status(400).json({
        error: `Job description exceeds 3,000 characters limit (received ${jobDescription.length}).`,
      });
    }
    if (resumeText.length > 3000) {
      return res.status(400).json({
        error: `Resume text exceeds 3,000 characters limit (received ${resumeText.length}).`,
      });
    }

    const jdLower = jobDescription.toLowerCase();
    const resumeLower = resumeText.toLowerCase();

    // 1. Extract required skills from job description
    let requiredSkills = COMMON_SKILLS.filter((skill) => {
      const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(?:\\b|\\W)${escaped}(?:\\b|\\W)`, 'i');
      return regex.test(jdLower) || jdLower.includes(skill.toLowerCase());
    });

    // If no common skills detected in JD, extract standard foundational skills
    if (requiredSkills.length === 0) {
      requiredSkills = ['JavaScript', 'REST API', 'Git'];
    }

    // 2. Identify matched and missing skills in resume
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

    // 3. Compute 4 Sub-Scores
    // Skills Sub-score (40% weight): Ratio of matched to required skills
    const skillsScore = Math.min(
      100,
      Math.max(10, Math.round((matchedSkills.length / requiredSkills.length) * 100))
    );

    // Experience Sub-score (30% weight): Parse years of experience from resume
    const expRegex = /(\d+)\+?\s*(?:years?|yrs?)/i;
    const expMatch = resumeText.match(expRegex);
    let experienceScore = 60;
    if (expMatch) {
      const yrs = parseInt(expMatch[1], 10);
      if (yrs >= 6) experienceScore = 95;
      else if (yrs >= 4) experienceScore = 85;
      else if (yrs >= 2) experienceScore = 75;
      else if (yrs >= 1) experienceScore = 65;
      else experienceScore = 50;
    } else if (resumeLower.length > 600) {
      experienceScore = 70;
    }

    // Domain Sub-score (20% weight): Architectural depth and industry alignment
    let domainScore = 40;
    if (skillsScore >= 80) domainScore = 90;
    else if (skillsScore >= 50) domainScore = 70;
    else if (skillsScore >= 25) domainScore = 50;

    // Education Sub-score (10% weight): Degree or credential detection
    const eduRegex = /(bachelor|master|b\.?s\.?|b\.?tech|m\.?s\.?|computer science|engineering|degree|phd)/i;
    const educationScore = eduRegex.test(resumeText) ? 85 : 70;

    // 4. Calculate Final Weighted Score using exact 40/30/20/10 formula
    const weightedExact =
      skillsScore * 0.4 +
      experienceScore * 0.3 +
      domainScore * 0.2 +
      educationScore * 0.1;
    const matchScore = Math.min(100, Math.max(0, Math.round(weightedExact)));

    // 5. Tier & Summary
    let recommendation = 'Moderate Match';
    if (matchScore >= 75) recommendation = 'Strong Match';
    else if (matchScore < 45) recommendation = 'Low Match';

    const summary =
      matchedSkills.length > 0
        ? `Found ${matchedSkills.length} of ${requiredSkills.length} required skills. ${
            missingSkills.length > 0
              ? `Skill gaps identified: ${missingSkills.slice(0, 3).join(', ')}.`
              : 'All role prerequisites satisfied.'
          }`
        : 'Resume shows minimal keyword overlap with role requirements. Consider tailoring key technical proficiencies.';

    return res.status(200).json({
      matchScore,
      recommendation,
      scoreBreakdown: {
        skills: skillsScore,
        experience: experienceScore,
        domain: domainScore,
        education: educationScore,
      },
      matchedSkills,
      missingSkills,
      summary,
    });
  } catch (err) {
    // Only log error message - never log user-submitted resume or job description text
    console.error('[Public Quick-Match Error]:', err.message || 'Unexpected failure');
    return res.status(500).json({ error: 'Failed to evaluate match. Please try again.' });
  }
});

module.exports = router;

