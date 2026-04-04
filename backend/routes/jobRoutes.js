const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const jobController = require('../controllers/jobController');

router.post('/', auth, jobController.saveJob);
router.get('/', auth, jobController.getJobs);
router.delete('/:id', auth, jobController.deleteJob);
router.post('/match', auth, jobController.matchJobs);
router.post('/fetch-external', auth, jobController.fetchAndSaveExternalJobs);

module.exports = router;