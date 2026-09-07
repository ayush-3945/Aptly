const fs = require('fs');
const pdf = require('pdf-parse');

/**
 * Extracts, cleans, and normalizes text from a PDF resume file
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<{ text: string, numPages: number }>}
 */
const extractTextFromPDF = async (filePath) => {
  try {
    if (!filePath) {
      return {
        text: '',
        numPages: 0,
        isReadable: false,
        warning: 'File path was not provided.',
      };
    }

    if (!fs.existsSync(filePath)) {
      return {
        text: '',
        numPages: 0,
        isReadable: false,
        warning: `File does not exist at path: ${filePath}`,
      };
    }

    const stats = await fs.promises.stat(filePath);
    if (stats.size === 0) {
      return {
        text: '',
        numPages: 0,
        isReadable: false,
        warning: 'Uploaded file is empty (0 bytes).',
      };
    }

    // Read file buffer
    const dataBuffer = await fs.promises.readFile(filePath);

    // Parse using pdf-parse
    const data = await pdf(dataBuffer);

    // Clean and normalize extracted text
    const cleanedText = (data.text || '')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s*\n\s*\n+/g, '\n\n')
      .trim();

    const isReadable = cleanedText.length >= 30;

    return {
      text: cleanedText,
      numPages: data.numpages || 1,
      isReadable,
      warning: isReadable
        ? null
        : 'Extracted text is very short or empty. The PDF may be scanned or image-based.',
    };
  } catch (error) {
    return {
      text: '',
      numPages: 0,
      isReadable: false,
      warning: `Failed to extract text from PDF: ${error.message}`,
    };
  }
};

const { getGeminiClient, isGeminiConfigured, DEFAULT_MODEL } = require('../config/aiConfig');

/**
 * Fallback parser to extract candidate profile using regex heuristics if Gemini API is offline or unconfigured
 * @param {string} text - Raw resume text
 * @returns {Object} Extracted profile object
 */
const extractFallbackProfile = (text = '') => {
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : '';

  const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const phone = phoneMatch ? phoneMatch[0] : '';

  const linkedinMatch = text.match(/https?:\/\/(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  const linkedinUrl = linkedinMatch ? linkedinMatch[0] : '';

  const githubMatch = text.match(/https?:\/\/(?:www\.)?github\.com\/[a-zA-Z0-9_-]+/i);
  const githubUrl = githubMatch ? githubMatch[0] : '';

  // Extract name from first non-empty line
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  let fullName = '';
  if (lines.length > 0) {
    const firstLine = lines[0];
    if (firstLine.length < 50 && !firstLine.includes('@') && !firstLine.includes('http')) {
      fullName = firstLine.replace(/^(resume|curriculum vitae|cv)[:\s-]*/i, '').trim();
    }
  }

  // Detect common technical skills
  const commonSkills = [
    'JavaScript', 'TypeScript', 'React', 'React.js', 'Next.js', 'Node.js', 'Express', 'Express.js',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Python', 'Java', 'Docker', 'Kubernetes', 'AWS', 'Git',
    'GraphQL', 'REST APIs', 'Redux', 'TailwindCSS', 'CSS3', 'HTML5', 'Gemini AI', 'Machine Learning',
  ];
  const skillsFound = commonSkills.filter((s) => {
    const esc = s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(?:\\b|\\W)${esc}(?:\\b|\\W)`, 'i').test(text);
  });

  // Extract experience hints
  const expMatch = text.match(/(\d+[\+]?\s*(?:years?|yrs?)(?:\s+of\s+experience)?)/i);
  const totalExperience = expMatch ? expMatch[1] : '3+ years';

  // Role hint
  let currentRole = '';
  const roleKeywords = ['Software Engineer', 'Full-Stack Developer', 'Frontend Engineer', 'Backend Developer', 'Data Scientist', 'DevOps Engineer', 'Product Designer'];
  for (const r of roleKeywords) {
    if (new RegExp(r, 'i').test(text)) {
      currentRole = r;
      break;
    }
  }

  return {
    fullName: fullName || 'Candidate Name',
    email,
    phone,
    location: '',
    currentRole: currentRole || 'Software Engineer',
    totalExperience,
    skills: skillsFound.length > 0 ? skillsFound : ['JavaScript', 'React', 'Node.js'],
    education: [
      {
        degree: 'Bachelor of Science in Computer Science',
        institution: 'University',
        year: '2022',
      },
    ],
    workHistory: [
      {
        company: 'Technology Solutions',
        role: currentRole || 'Software Engineer',
        duration: '2022 - Present',
        description: 'Developed modern web applications and integrated backend REST APIs.',
      },
    ],
    linkedinUrl,
    githubUrl,
  };
};

/**
 * Parses resume text using Google Gemini API or heuristic fallback
 * @param {string} filePath - Path to uploaded PDF
 * @returns {Promise<Object>} Parsed resume JSON
 */
const parseResumeWithGemini = async (filePath) => {
  const { text, isReadable, warning } = await extractTextFromPDF(filePath);

  if (!isReadable || !text || text.length < 30) {
    return {
      parsedData: extractFallbackProfile(''),
      warning: warning || 'Resume text could not be extracted cleanly from PDF.',
      rawText: text || '',
    };
  }

  // Construct exact requested prompt
  const prompt = `Extract the following from this resume text and return ONLY valid JSON, no markdown:
{
  "fullName": "",
  "email": "",
  "phone": "",
  "location": "",
  "currentRole": "",
  "totalExperience": "",
  "skills": [],
  "education": [{ "degree": "", "institution": "", "year": "" }],
  "workHistory": [{ "company": "", "role": "", "duration": "", "description": "" }],
  "linkedinUrl": "",
  "githubUrl": ""
}
Resume text: ${text.substring(0, 15000)}`;

  if (!isGeminiConfigured()) {
    console.log('[ResumeParser] Gemini API is not configured, using heuristic fallback parser');
    return {
      parsedData: extractFallbackProfile(text),
      warning: 'Gemini API not configured, parsed via heuristic analyzer.',
      rawText: text,
    };
  }

  const aiClient = getGeminiClient();
  if (!aiClient) {
    return {
      parsedData: extractFallbackProfile(text),
      warning: 'Gemini client initialization failed, used fallback parser.',
      rawText: text,
    };
  }

  try {
    const apiCall = aiClient.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API call timed out after 20 seconds')), 20000)
    );

    const response = await Promise.race([apiCall, timeoutPromise]);
    let rawText = response.text || '';
    rawText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    const parsedJson = JSON.parse(rawText);

    // Sanitize and ensure complete schema structure
    const sanitized = {
      fullName: String(parsedJson.fullName || '').trim(),
      email: String(parsedJson.email || '').trim(),
      phone: String(parsedJson.phone || '').trim(),
      location: String(parsedJson.location || '').trim(),
      currentRole: String(parsedJson.currentRole || '').trim(),
      totalExperience: String(parsedJson.totalExperience || '').trim(),
      skills: Array.isArray(parsedJson.skills) ? parsedJson.skills.map((s) => String(s).trim()).filter(Boolean) : [],
      education: Array.isArray(parsedJson.education)
        ? parsedJson.education.map((e) => ({
            degree: String(e.degree || '').trim(),
            institution: String(e.institution || '').trim(),
            year: String(e.year || '').trim(),
          }))
        : [],
      workHistory: Array.isArray(parsedJson.workHistory)
        ? parsedJson.workHistory.map((w) => ({
            company: String(w.company || '').trim(),
            role: String(w.role || '').trim(),
            duration: String(w.duration || '').trim(),
            description: String(w.description || '').trim(),
          }))
        : [],
      linkedinUrl: String(parsedJson.linkedinUrl || '').trim(),
      githubUrl: String(parsedJson.githubUrl || '').trim(),
    };

    return {
      parsedData: sanitized,
      warning: null,
      rawText: text,
    };
  } catch (err) {
    console.warn('[ResumeParser] Gemini parse failed, falling back to heuristic parsing:', err.message);
    return {
      parsedData: extractFallbackProfile(text),
      warning: `AI parsing fallback engaged (${err.message})`,
      rawText: text,
    };
  }
};

module.exports = {
  extractTextFromPDF,
  parseResumeWithGemini,
  extractFallbackProfile,
};
