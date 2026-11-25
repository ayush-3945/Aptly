/**
 * Normalizes skill names to their canonical industry representation.
 * Guarantees 'TailwindCSS', 'tailwindcss', 'tailwind' -> 'Tailwind CSS'.
 *
 * @param {string} name
 * @returns {string}
 */
function normalizeSkillName(name) {
  if (!name || typeof name !== 'string') return '';
  const trimmed = name.trim();
  const lower = trimmed.toLowerCase();

  // Canonical mappings
  if (lower === 'tailwindcss' || lower === 'tailwind') return 'Tailwind CSS';
  if (lower === 'reactjs') return 'React';
  if (lower === 'nodejs') return 'Node.js';
  if (lower === 'nextjs') return 'Next.js';
  if (lower === 'vuejs') return 'Vue.js';
  if (lower === 'angularjs') return 'Angular';
  if (lower === 'postgres' || lower === 'psql') return 'PostgreSQL';
  if (lower === 'mongo') return 'MongoDB';
  if (lower === 'js') return 'JavaScript';
  if (lower === 'ts') return 'TypeScript';
  if (lower === 'py') return 'Python';
  if (lower === 'k8s') return 'Kubernetes';
  if (lower === 'golang') return 'Go';
  if (lower === 'aws') return 'AWS';
  if (lower === 'gcp') return 'Google Cloud';
  if (lower === 'docker') return 'Docker';
  if (lower === 'graphql') return 'GraphQL';

  return trimmed;
}

/**
 * Normalizes and deduplicates an array of skill strings.
 *
 * @param {Array<string>} skills
 * @returns {Array<string>}
 */
function normalizeSkillsArray(skills) {
  if (!Array.isArray(skills)) return [];
  const normalized = skills
    .map((s) => normalizeSkillName(s))
    .filter(Boolean);

  const seen = new Set();
  const deduped = [];
  for (const s of normalized) {
    const key = s.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(s);
    }
  }
  return deduped;
}

module.exports = {
  normalizeSkillName,
  normalizeSkillsArray,
};
