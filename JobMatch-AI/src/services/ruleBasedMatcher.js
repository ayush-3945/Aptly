const COMMON_SKILLS = [
  'React', 'Node.js', 'Express', 'MongoDB', 'TypeScript', 'JavaScript',
  'Python', 'Java', 'SQL', 'PostgreSQL', 'MySQL', 'Docker', 'Kubernetes',
  'AWS', 'Git', 'REST API', 'GraphQL', 'Next.js', 'Vue', 'Angular',
  'HTML', 'CSS', 'Tailwind', 'Redis', 'CI/CD', 'Linux', 'Microservices',
  'System Design', 'C++', 'Golang',
];

/**
 * Generates an actionable skill gap roadmap for missing technologies
 * @param {Array<string>} missingSkills 
 * @returns {Array<Object>} Roadmap steps
 */
const generateRoadmapFromMissingSkills = (missingSkills = []) => {
  if (!Array.isArray(missingSkills) || missingSkills.length === 0) {
    return [
      {
        skill: 'Production Polish',
        priority: 'Low',
        impact: '+5% Polish',
        timeToBridge: '1-2 Days',
        actionPlan: 'Core technical requirements already met. Add comprehensive unit tests, API docs, and Dockerfile.',
        resource: 'Clean Architecture best practices & Jest documentation',
      },
    ];
  }

  return missingSkills.slice(0, 5).map((skill, index) => {
    const isHigh = index < 2;
    return {
      skill,
      priority: isHigh ? 'High' : 'Medium',
      impact: isHigh ? '+15% Match Score' : '+8% Match Score',
      timeToBridge: isHigh ? '2-3 Days' : '4-5 Days',
      actionPlan: 'Build a hands-on mini-module utilizing ' + skill + ' and showcase it in your portfolio or GitHub.',
      resource: 'Official ' + skill + ' documentation and community crash courses.',
    };
  });
};

const getDefaultResumeImprovements = () => [
  'Quantify project outcomes: Replace generic phrases with measurable metrics (e.g. "Reduced API response latency by 35%").',
  'Lead bullet points with strong action verbs: "Architected", "Deployed", "Engineered" rather than "Helped" or "Worked on".',
  'Ensure every technical skill listed in your stack is referenced with real-world application in your projects section.',
];

/**
 * Shared Rule-Based Matcher Engine:
 * Used for both public playground quick-match and backend AI fallback.
 * Strictly honest: only skillsScore drives matchScore. No fabricated experience, domain or education scores.
 *
 * @param {Object} options
 * @param {Object|string} options.job - Job document, object, or description string
 * @param {string} options.resumeText - Plaintext extracted from candidate resume
 * @param {string} [options.reason] - Explanation of fallback trigger
 * @returns {Object} Structured match evaluation with evaluationSource: 'fallback'
 */
function evaluateRuleBasedMatch({ job, resumeText, reason = 'Graceful fallback when AI is unavailable' }) {
  const resumeLower = (resumeText || '').toLowerCase();

  let requiredSkills = [];
  if (job && Array.isArray(job.requiredSkills)) {
    requiredSkills = job.requiredSkills;
  } else if (job && typeof job.requiredSkills === 'string') {
    requiredSkills = job.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean);
  } else {
    const jdText = typeof job === 'string' ? job : (job?.description || '');
    const jdLower = jdText.toLowerCase();
    requiredSkills = COMMON_SKILLS.filter((skill) => {
      const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(?:\\b|\\W)${escaped}(?:\\b|\\W)`, 'i');
      return regex.test(jdLower) || jdLower.includes(skill.toLowerCase());
    });
    if (requiredSkills.length === 0) {
      requiredSkills = ['JavaScript', 'REST API', 'Git'];
    }
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

  const skillsScore = requiredSkills.length > 0
    ? Math.min(100, Math.max(10, Math.round((matchedSkills.length / requiredSkills.length) * 100)))
    : (resumeLower.length > 300 ? 60 : 30);

  // Honest rule-based scoring: matchScore is driven solely by verified skills overlap
  const matchScore = skillsScore;

  let recommendation = 'Moderate Match';
  if (matchScore >= 75) recommendation = 'Strong Match';
  else if (matchScore < 40) recommendation = 'Low Match';

  const summary = matchedSkills.length > 0
    ? `Found ${matchedSkills.length} of ${requiredSkills.length} required skills. ${
        missingSkills.length > 0
          ? `Skill gaps identified: ${missingSkills.slice(0, 3).join(', ')}.`
          : 'All role prerequisites satisfied.'
      } [Notice: ${reason}]`
    : `Resume shows minimal keyword overlap with role requirements. [Notice: ${reason}]`;

  return {
    matchScore,
    evaluationSource: 'fallback',
    scoreBreakdown: {
      skillsScore,
      skills: skillsScore,
    },
    matchedSkills,
    missingSkills,
    experienceFit: `Keyword-based result (AI was unavailable): ${matchedSkills.length} of ${requiredSkills.length} core skills matched.`,
    fitSummary: summary,
    recommendation,
    skillGapRoadmap: generateRoadmapFromMissingSkills(missingSkills),
    resumeImprovements: getDefaultResumeImprovements(),
    reason,
  };
}

module.exports = {
  COMMON_SKILLS,
  evaluateRuleBasedMatch,
  generateRoadmapFromMissingSkills,
  getDefaultResumeImprovements,
};
