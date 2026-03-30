const rateLimit = require("express-rate-limit");

exports.aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 requests per hour per IP
  message: "Too many AI requests. Try again later."
});