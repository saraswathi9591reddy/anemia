const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50, message: { error: 'Too many requests. Try again in 15 minutes.' } });

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', auth, getMe);

module.exports = router;

