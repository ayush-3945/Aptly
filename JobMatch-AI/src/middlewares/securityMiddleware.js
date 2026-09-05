const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

/**
 * Configure Helmet with secure HTTP headers & custom Content Security Policy (CSP)
 * Allows Google Fonts, SVG icons, and external CDNs without triggering security blocks.
 */
const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
      connectSrc: ["'self'", 'https:', 'http:'],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
});

/**
 * General API Limiter:
 * 200 requests per 15 minutes per IP.
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true, // Return standard RateLimit headers in the response
  legacyHeaders: false, // Disable X-RateLimit headers
  message: {
    status: 'error',
    statusCode: 429,
    message: 'Too many requests from this IP address. Please retry after 15 minutes.',
  },
});

/**
 * Strict Auth Limiter:
 * 25 attempts per 15 minutes to defend against credential stuffing and brute-force password guessing.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    statusCode: 429,
    message: 'Too many authentication attempts. Please retry after 15 minutes.',
  },
});

/**
 * AI & Resume Upload Rate Limiter:
 * 30 requests per 15 minutes on document parsing and Gemini ATS evaluation endpoints.
 * Defends against API quota exhaustion and denial-of-wallet attacks.
 */
const aiUploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    statusCode: 429,
    message: 'AI evaluation / resume upload quota exceeded for this IP. Please try again after 15 minutes.',
  },
});

module.exports = {
  helmetMiddleware,
  generalLimiter,
  authLimiter,
  aiUploadLimiter,
};