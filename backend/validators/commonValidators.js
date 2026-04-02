const { body, param, validationResult } = require('express-validator');

// Validate search query
const validateSearch = [
  body('query').trim().isLength({ min: 2, max: 500 }).withMessage('Search query must be 2–500 characters'),
  body('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
];

// Validate job description text (used in tailoring, cover letter, interview)
const validateJobDescription = [
  body('jobDescriptionText').trim().isLength({ min: 10, max: 5000 }).withMessage('Job description must be 10–5000 characters'),
];

// Validate resumeId in body (for AI endpoints)
const validateResumeIdBody = [
  body('resumeId').isMongoId().withMessage('Invalid resume ID'),
];

// Validate resumeId in URL params (for GET/DELETE)
const validateResumeIdParam = [
  param('id').isMongoId().withMessage('Invalid resume ID'),
];

// Generic error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  validateSearch,
  validateJobDescription,
  validateResumeIdBody,
  validateResumeIdParam,
  handleValidationErrors,
};