const jwt = require('jsonwebtoken');
const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required.' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(409).json({ error: 'An account with this email already exists.' });
    const userRole = ['patient', 'doctor'].includes(role) ? role : 'patient';
    const user = new User({ name: name.trim(), email: email.toLowerCase().trim(), password, role: userRole });
    await user.save();
    if (userRole === 'patient') await new PatientProfile({ userId: user._id }).save();
    const token = generateToken(user._id);
    res.status(201).json({ token, user: user.toJSON() });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json({ error: 'Invalid email or password.' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password.' });
    const token = generateToken(user._id);
    res.json({ token, user: user.toJSON() });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
};

const getMe = async (req, res) => res.json({ user: req.user });

module.exports = { register, login, getMe };

