const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const aiController = require("../controllers/aiController");
const { aiLimiter } = require("../middleware/rateLimiter");
const { validateResumeIdBody, validateJobDescription, handleValidationErrors } = require('../validators/commonValidators');

/*
All AI routes require authentication
*/

// Resume Tailoring
router.post('/resume-tailor/generate',auth,aiLimiter,validateResumeIdBody,validateJobDescription,handleValidationErrors,aiController.generateResume);
router.post("/resume-tailor",auth,aiController.saveTailoredResume);
router.get("/resume-tailor",auth,aiController.getAllTailoredResumes);
router.get("/resume-tailor/:id",auth,aiController.getTailoredResumeById);
router.delete("/resume-tailor/:id",auth,aiController.deleteTailoredResume);

// Cover Letter
router.post("/cover-letter/generate",auth,aiLimiter,validateResumeIdBody,validateJobDescription,handleValidationErrors,aiController.generateCoverLetter);
router.post("/cover-letter", auth, aiController.saveCoverLetter);
router.get("/cover-letter", auth, aiController.getAllCoverLetters);
router.get("/cover-letter/:id", auth, aiController.getCoverLetterById);
router.delete("/cover-letter/:id", auth, aiController.deleteCoverLetter);

// Interview Questions
router.post("/interview/generate",auth,aiLimiter,validateResumeIdBody,validateJobDescription,handleValidationErrors,aiController.generateInterview);
router.post("/interview", auth, aiController.saveInterview);
router.get("/interview", auth, aiController.getAllInterviews);
router.get("/interview/:id", auth, aiController.getInterviewById);
router.delete("/interview/:id", auth, aiController.deleteInterview);

module.exports = router;