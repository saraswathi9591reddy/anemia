const express = require('express');
const router = express.Router();
const { createAssessment, getAssessments, getAssessmentById } = require('../controllers/assessmentController');
const { auth, requireRole } = require('../middleware/auth');

router.get('/', auth, requireRole('patient'), getAssessments);
router.post('/', auth, requireRole('patient'), createAssessment);
router.get('/:id', auth, requireRole('patient'), getAssessmentById);

module.exports = router;
