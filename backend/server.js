require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth.routes');
const patientRoutes = require('./routes/patient.routes');
const reportRoutes = require('./routes/report.routes');
const assessmentRoutes = require('./routes/assessment.routes');
const doctorRoutes = require('./routes/doctor.routes');
const downloadRoutes = require('./routes/download.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Security & middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', app: 'AnemiaAI Backend', timestamp: new Date().toISOString() }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/download', downloadRoutes);

// Error handler
app.use(errorHandler);

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/anemiaai';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`🚀 AnemiaAI Backend running on http://localhost:${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
    });
  })
  .catch(err => {
    console.warn('⚠️ MongoDB connection warning:', err.message);
    console.warn('Running server in fallback/offline mode (start MongoDB with `mongod` to enable database operations)');
    app.listen(PORT, () => {
      console.log(`🚀 AnemiaAI Backend running on http://localhost:${PORT} (without active MongoDB)`);
      console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
    });
  });
