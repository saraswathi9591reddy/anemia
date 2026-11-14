const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { createReport, getReports, uploadFile } = require('../controllers/reportController');
const { auth, requireRole } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`)
});
const upload = multer({ storage, limits: { fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB) || 10) * 1024 * 1024 } });

router.get('/', auth, requireRole('patient'), getReports);
router.post('/', auth, requireRole('patient'), createReport);
router.post('/upload', auth, requireRole('patient'), upload.single('report'), uploadFile);

module.exports = router;

