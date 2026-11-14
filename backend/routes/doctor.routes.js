const express = require('express');
const router = express.Router();
const { getAllPatients, getPatientSummary } = require('../controllers/doctorController');
const { auth, requireRole } = require('../middleware/auth');

router.get('/patients', auth, requireRole('doctor'), getAllPatients);
router.get('/patients/:patientId', auth, requireRole('doctor'), getPatientSummary);

module.exports = router;
