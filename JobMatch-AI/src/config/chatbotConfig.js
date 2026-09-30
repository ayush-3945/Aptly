/**
 * Chatbot Configuration
 * Supports primary n8n Webhook / AI Agent RAG endpoint and fallback settings
 */

module.exports = {
  // Primary n8n Webhook URL (configured via .env or fallback local webhook address)
  N8N_WEBHOOK_URL: process.env.N8N_WEBHOOK_URL || '',

  // Network timeout before circuit-breaker falls back to local engine (in milliseconds)
  N8N_TIMEOUT_MS: parseInt(process.env.N8N_TIMEOUT_MS, 10) || 5000,

  // Fallback domain configuration
  FALLBACK_DOMAIN: 'Aptly Talent & Semantic ATS Engineering',
};
