const rateLimit = require("express-rate-limit");

exports.aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 100 requests per hour per IP
  message: "Too many AI requests. Try again later."
});

exports.searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: 'Too many search requests. Please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
});

exports.uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: 'Too many upload requests. Please wait.',
  standardHeaders: true,
  legacyHeaders: false,
});