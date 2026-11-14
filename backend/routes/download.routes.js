const express = require('express');
const router = express.Router();
const { downloadAssessmentPDF } = require('../controllers/downloadController');
const { auth } = require('../middleware/auth');

router.get('/assessment/:id', auth, downloadAssessmentPDF);

module.exports = router;

