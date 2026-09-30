const chatService = require('../services/chatService');

/**
 * POST /api/chat
 * Main endpoint for Aptly Chatbot UI
 */
const handleChat = async (req, res, next) => {
  try {
    const { message, history, sessionId, userRole } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'A valid message string is required.',
      });
    }

    const result = await chatService.processChatMessage({
      message,
      history: Array.isArray(history) ? history.slice(-10) : [],
      sessionId: sessionId || req.ip || 'anonymous-session',
      userRole: userRole || (req.user ? req.user.role : 'guest'),
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleChat,
};
