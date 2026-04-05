const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const feedbackController = require('../controllers/feedbackController');

router.post('/skill', auth, feedbackController.submitSkillFeedback);

module.exports = router;