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
 * Local AI engine with Gemini generative reasoning for open-ended queries
 */
const queryGeminiFallback = async (query, history = [], userRole = 'candidate') => {
  if (!isGeminiConfigured()) {
    return null;
  }

  try {
    const aiClient = getGeminiClient();
    if (!aiClient) return null;

    const systemInstruction = `You are Aptly AI, an intelligent, versatile developer and talent AI assistant.
You can answer ANY question the user asks:
- Technical & coding questions (JavaScript, React, Node.js, Python, Java, SQL, System Design, algorithms, etc.)
- Aptly platform questions (Semantic ATS matching, JD quality, bias detection, Kanban pipeline)
- Career advice, Resume optimization, and Interview preparation
- General queries, conceptual explanations, and troubleshooting

Format your answers clearly with markdown: use bold text for emphasis, bullet points for lists, and code blocks with syntax highlighting where relevant.
Be direct, helpful, and concise.`;

    const conversationContext = history && history.length > 0
      ? history.slice(-4).map((h) => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`).join('\n') + '\n'
      : '';

    const prompt = `${conversationContext}User: ${query}\nAssistant:`;

    const response = await aiClient.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response?.text || '';

    if (reply && reply.trim()) {
      return {
        reply: reply.trim(),
        source: 'gemini-generative-ai',
        suggestions: ['Ask a coding question', 'How to optimize my resume?', 'How does Aptly score JDs?'],
      };
    }
  } catch (err) {
    console.warn('[LocalKnowledgeEngine] Gemini generation error:', err?.message || err);
  }

  return null;
};

/**
 * Main Answer Query dispatcher
 * If Gemini AI is configured, it answers ANYTHING with generative intelligence.
 * If offline or key not provided, it falls back to curated deterministic knowledge rules.
 */
const answerQuery = async (query, history = [], userRole = 'candidate') => {
  // 1. If Gemini AI is active, answer ANY open-ended question with Generative AI
  if (isGeminiConfigured()) {
    const geminiResult = await queryGeminiFallback(query, history, userRole);
    if (geminiResult) {
      return geminiResult;
    }
  }

  // 2. Check deterministic curated knowledge base
  const ruleResult = queryRuleBasedKnowledge(query);
  if (ruleResult) {
    return ruleResult;
  }

  // 3. Fallback response with helpful suggestions
  return {
    reply:
      "I am **Aptly AI**. To enable open-ended answering for ANY topic (coding, career, tech, anything), configure your **GEMINI_API_KEY** in the backend `.env` file.\n\nCurrently operating on **Local Knowledge Engine mode**. You can ask me about:\n- **Match Scoring:** How Aptly calculates candidate fit\n- **JD Quality:** How bias and clarity scoring works\n- **Recruiter Pipeline:** How the ATS Kanban board operates\n- **Resume Parsing:** How technical competencies are extracted",
    source: 'local-domain-engine',
    suggestions: [
      'What is Aptly?',
      'How does match score work?',
      'How does JD quality scoring work?',
      'Tell me about the recruiter pipeline',
    ],
  };
};

module.exports = {
  answerQuery,
  DOMAIN_KNOWLEDGE_BASE,
};
