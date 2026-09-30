const { N8N_WEBHOOK_URL, N8N_TIMEOUT_MS } = require('../config/chatbotConfig');
const localKnowledgeEngine = require('./localKnowledgeEngine');

/**
 * Normalizes responses from various n8n AI Agent / RAG workflow node outputs
 */
const extractN8nResponseText = (data) => {
  if (!data) return '';

  if (typeof data === 'string') {
    return data;
  }

  // Handle standard n8n AI Agent Chat node output shapes
  if (data.output && typeof data.output === 'string') {
    return data.output;
  }
  if (data.response && typeof data.response === 'string') {
    return data.response;
  }
  if (data.text && typeof data.text === 'string') {
    return data.text;
  }
  if (data.message && typeof data.message === 'string') {
    return data.message;
  }

  // If array returned by n8n Webhook node
  if (Array.isArray(data) && data.length > 0) {
    const first = data[0];
    return extractN8nResponseText(first);
  }

  // Fallback JSON stringification
  return JSON.stringify(data);
};

/**
 * Handles incoming chat messages by first trying n8n Webhook AI Agent,
 * and falling back gracefully to the Local Domain Engine on failure or offline status.
 *
 * @param {Object} params
 * @param {string} params.message - Candidate or recruiter question
 * @param {Array} params.history - Recent chat message thread
 * @param {string} params.sessionId - Unique user chat session ID
 * @param {string} params.userRole - 'candidate' | 'recruiter' | 'guest'
 * @returns {Promise<Object>}
 */
const processChatMessage = async ({ message, history = [], sessionId, userRole = 'guest' }) => {
  const cleanMessage = (message || '').trim();
  if (!cleanMessage) {
    return {
      success: false,
      message: 'Please provide a non-empty message.',
      source: 'validation-guard',
    };
  }

  // 1. Attempt Primary Pathway: n8n AI Agent / RAG Webhook (if configured)
  if (N8N_WEBHOOK_URL && N8N_WEBHOOK_URL.trim().length > 0) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), N8N_TIMEOUT_MS);

      const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Client-Platform': 'Aptly-Talent-AI',
        },
        body: JSON.stringify({
          message: cleanMessage,
          history,
          sessionId: sessionId || 'default-session',
          userRole,
          timestamp: new Date().toISOString(),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (n8nResponse.ok) {
        const data = await n8nResponse.json();
        const responseText = extractN8nResponseText(data);

        if (responseText && responseText.trim()) {
          return {
            success: true,
            message: responseText.trim(),
            source: 'n8n-rag-agent',
            suggestions: data.suggestions || ['Ask about Aptly', 'How to benchmark your CV', 'ATS Kanban Pipeline'],
          };
        }
      } else {
        console.warn(`[ChatService] n8n webhook responded with status ${n8nResponse.status}. Engaging fallback.`);
      }
    } catch (err) {
      console.warn(`[ChatService] n8n webhook unreachable or timed out (${err?.name || err?.message}). Switching to Local Engine.`);
    }
  }

  // 2. Secondary Pathway: Local Domain / Clinical & ATS Knowledge Engine Fallback
  const fallbackResult = await localKnowledgeEngine.answerQuery(cleanMessage, history, userRole);

  return {
    success: true,
    message: fallbackResult.reply,
    source: fallbackResult.source,
    isFallback: true,
    suggestions: fallbackResult.suggestions || [],
  };
};

module.exports = {
  processChatMessage,
};
