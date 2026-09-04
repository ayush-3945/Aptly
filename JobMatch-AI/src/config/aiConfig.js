const { GoogleGenAI } = require('@google/genai');

const getApiKey = () => process.env.GEMINI_API_KEY || '';

let aiClient = null;

const getGeminiClient = () => {
  const apiKey = getApiKey();
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
};

const isGeminiConfigured = () => {
  const key = getApiKey();
  return Boolean(key && key.trim().length > 0 && !key.startsWith('your_'));
};

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

module.exports = {
  getGeminiClient,
  isGeminiConfigured,
  DEFAULT_MODEL,
};
