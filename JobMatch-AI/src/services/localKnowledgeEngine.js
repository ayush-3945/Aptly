const { getGeminiClient, isGeminiConfigured, DEFAULT_MODEL } = require('../config/aiConfig');

/**
 * Curated Aptly & ATS Domain Knowledge Base
 * Used for deterministic resolution when external services / n8n are offline
 */
const DOMAIN_KNOWLEDGE_BASE = [
  {
    keywords: ['what is aptly', 'about aptly', 'how aptly works', 'what do you do', 'who are you'],
    response:
      '**Aptly.AI** is a semantic AI-powered talent screening platform and ATS. Unlike traditional ATS platforms that reject candidates based on rigid keyword matching (e.g. missing "PostgreSQL" when you know "MySQL"), Aptly evaluates candidate skill depth, seniority, and adjacent frameworks to provide transparent skill gap scorecards to candidates and unbiased ranking to recruiters.',
    suggestions: ['How is the match score calculated?', 'How does JD quality scoring work?', 'What is the recruiter pipeline?'],
  },
  {
    keywords: ['score', 'match score', 'calculate', 'how is score', 'fit score', 'percentage'],
    response:
      'Aptly calculates a multi-vector match score (0–100%):\n1. **Core Competency Overlap:** Checks required skills against extracted resume skills.\n2. **Adjacent Framework Equivalencies:** Recognizes transferable skills (e.g., React translates smoothly to Next.js or Vue).\n3. **Experience & Project Depth:** Evaluates real-world production engineering tenure and system complexity rather than superficial bullet points.',
    suggestions: ['What happens if I miss a skill?', 'Can I improve my score?', 'How do recruiters see my score?'],
  },
  {
    keywords: ['jd quality', 'bias', 'jd panel', 'post job', 'job description', 'quality score'],
    response:
      'The **JD Quality & Bias Analyzer** (`JDQualityPanel`) evaluates job postings before publication across 5 key dimensions: **Clarity**, **Specificity**, **Inclusivity & Tone**, **Market Competitiveness**, and **Structure**. It flags biased terms (like "ninja", "rockstar", "young energetic") and suggests inclusive alternatives to attract diverse, top-tier engineering talent.',
    suggestions: ['What words are considered biased?', 'How to post a job on Aptly?', 'Can AI rewrite my JD?'],
  },
  {
    keywords: ['resume', 'upload resume', 'pdf', 'parser', 'extract skills'],
    response:
      'When you upload a resume PDF in Aptly, our **Resume Parsing Engine** extracts text via stream buffers, standardizes technical competencies, parses project descriptions, and instantly benchmarks your profile against active job listings with zero manual data entry.',
    suggestions: ['What formats are supported?', 'Can I update my resume?', 'How do I explore open roles?'],
  },
  {
    keywords: ['recruiter', 'ats pipeline', 'kanban', 'stages', 'shortlist'],
    response:
      'For recruiters, Aptly provides an automated **ATS Kanban Pipeline** with stages: **Applied ➔ Shortlisted ➔ Technical Interview ➔ Offer / Hired**. Candidates are automatically pre-ranked by AI match percentage, allowing recruiters to filter talent with a single score slider and schedule interviews directly.',
    suggestions: ['How to filter applicants?', 'How does interview scheduling work?', 'Can I export applicant data?'],
  },
  {
    keywords: ['interview', 'cheat sheet', 'technical questions', 'prep'],
    response:
      'Aptly generates tailored **Technical Interview Questions** targeted directly at the gap between a candidate\'s resume and the job description. This helps recruiters ask high-signal questions and helps candidates prepare for their specific technical weaknesses.',
    suggestions: ['Give me sample interview questions', 'How to benchmark my CV?', 'How does Aptly eliminate ATS bias?'],
  },
  {
    keywords: ['n8n', 'rag', 'workflow', 'offline', 'circuit breaker'],
    response:
      'The Aptly Chatbot operates on a resilient **Hybrid Gateway Architecture**: Queries are first routed to our **n8n AI Agent / RAG Workflow** for advanced knowledge retrieval. If n8n times out or is offline, this **Local Domain Knowledge Engine** automatically takes over to ensure zero downtime.',
    suggestions: ['What is Aptly?', 'How does match score work?', 'How to post a job?'],
  },
];

/**
 * Deterministic rule-based lookup for domain queries
 */
const queryRuleBasedKnowledge = (query) => {
  const q = (query || '').toLowerCase().trim();

  for (const entry of DOMAIN_KNOWLEDGE_BASE) {
    const hasMatch = entry.keywords.some((kw) => q.includes(kw));
    if (hasMatch) {
      return {
        reply: entry.response,
        source: 'local-domain-engine',
        suggestions: entry.suggestions,
      };
    }
  }

  return null;
};

/**
 * Local AI engine with Gemini fallback if available
 */
const queryGeminiFallback = async (query, history = [], userRole = 'candidate') => {
  if (!isGeminiConfigured()) {
    return null;
  }

  try {
    const client = getGeminiClient();
    const systemInstruction = `You are Aptly's AI Support and Domain Intelligence Assistant.
Aptly is a modern semantic ATS and talent screening SaaS that replaces rigid keyword filters with semantic evaluation, transparent candidate skill-gap scorecards, and a recruiter JD quality & ATS Kanban pipeline.
User role: ${userRole}.
Keep responses helpful, concise, well-formatted with markdown bullet points, and encouraging. Never invent non-existent features.`;

    const chatSession = client.chats.create({
      model: DEFAULT_MODEL,
      config: {
        systemInstruction,
        temperature: 0.3,
      },
    });

    const prompt = `User question: "${query}"`;
    const result = await chatSession.sendMessage({ message: prompt });
    const reply = result?.text?.() || result?.text || '';

    if (reply && reply.trim()) {
      return {
        reply: reply.trim(),
        source: 'local-gemini-engine',
        suggestions: ['Explore open roles', 'View sample match report', 'How does Aptly score JDs?'],
      };
    }
  } catch (err) {
    console.warn('[LocalKnowledgeEngine] Gemini fallback error:', err?.message || err);
  }

  return null;
};

/**
 * Main Answer Query dispatcher for the Local Engine
 */
const answerQuery = async (query, history = [], userRole = 'candidate') => {
  // 1. Check deterministic curated knowledge base
  const ruleResult = queryRuleBasedKnowledge(query);
  if (ruleResult) {
    return ruleResult;
  }

  // 2. If no rule matched, invoke local Gemini engine if available
  const geminiResult = await queryGeminiFallback(query, history, userRole);
  if (geminiResult) {
    return geminiResult;
  }

  // 3. Ultimate deterministic fallback response
  return {
    reply:
      "I am **Aptly's AI Assistant**. I can assist you with understanding your candidate match score, identifying skill gaps, creating inclusive JDs with our JD Quality Panel, or navigating our ATS Kanban pipeline.\n\nCould you please rephrase or ask about one of the topics below?",
    source: 'local-domain-engine',
    suggestions: [
      'What is Aptly?',
      'How does the match score work?',
      'How to post a job without bias?',
      'Tell me about the recruiter pipeline',
    ],
  };
};

module.exports = {
  answerQuery,
  DOMAIN_KNOWLEDGE_BASE,
};
