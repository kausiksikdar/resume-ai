const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const applicationController = require('../controllers/applicationController');

router.post('/', auth, applicationController.createApplication);
router.get('/', auth, applicationController.getUserApplications);
router.get('/:id', auth, applicationController.getApplicationById);
router.put('/:id', auth, applicationController.updateApplication);
router.delete('/:id', auth, applicationController.deleteApplication);

module.exports = router;