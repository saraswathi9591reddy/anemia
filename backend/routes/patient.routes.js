const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/patientController');
const { auth, requireRole } = require('../middleware/auth');

router.get('/profile', auth, requireRole('patient'), getProfile);
router.put('/profile', auth, requireRole('patient'), updateProfile);

module.exports = router;
